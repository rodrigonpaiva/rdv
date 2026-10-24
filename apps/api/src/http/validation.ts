import { Ajv2020 } from 'ajv/dist/2020.js';
import type { ValidateFunction } from 'ajv';
import addFormatsImport from 'ajv-formats';
import type { PipeTransform } from '@nestjs/common';
import type { PaginationQuery } from '@agenda/contracts';
import { apiDocument } from '@agenda/contracts/openapi';
import { SafeHttpError } from './errors.js';

// ajv-formats uses CommonJS; the explicit import binding preserves NodeNext interop.
const addFormats = addFormatsImport as unknown as (ajv: Ajv2020) => void;
const ajv = new Ajv2020({ strict: true, allErrors: false, coerceTypes: false, removeAdditional: false, useDefaults: false });
addFormats(ajv);
const schemaId = 'urn:agenda:public-contracts:v1';
const schemas = JSON.parse(JSON.stringify(apiDocument.components.schemas).replaceAll('#/components/schemas/', '#/$defs/')) as Record<string, object>;
ajv.addSchema({ $id: schemaId, $defs: schemas });
export type SchemaName = keyof typeof apiDocument.components.schemas;
const validators = new Map<SchemaName, ValidateFunction>();
export function schemaValidator(name: SchemaName): ValidateFunction {
  let validator = validators.get(name);
  if (!validator) {
    validator = ajv.compile({ $ref: `${schemaId}#/$defs/${name}` });
    validators.set(name, validator);
  }
  return validator;
}

export class SchemaValidationPipe implements PipeTransform {
  private readonly validate: ValidateFunction;
  constructor(name: SchemaName, private readonly field: 'body' | 'query' = 'body') {
    this.validate = schemaValidator(name);
  }
  transform(value: unknown): unknown {
    if (!this.validate(value)) throw new SafeHttpError('VALIDATION_ERROR', [{ field: this.field, code: 'INVALID_VALUE' }]);
    return value;
  }
}

export class PaginationPipe implements PipeTransform {
  private readonly pipe = new SchemaValidationPipe('PaginationQuery', 'query');
  transform(value: unknown): PaginationQuery & { limit: number } {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new SafeHttpError('VALIDATION_ERROR');
    const query: Record<string, unknown> = { ...value };
    if (query.limit === undefined) query.limit = apiDocument.components.schemas.PaginationQuery.properties.limit.default;
    else if (typeof query.limit === 'string' && /^(?:[1-9][0-9]{0,2})$/.test(query.limit)) query.limit = Number(query.limit);
    this.pipe.transform(query);
    return query as PaginationQuery & { limit: number };
  }
}
