import { randomUUID } from 'node:crypto';
import { Catch, HttpException, VersioningType } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter, INestApplication } from '@nestjs/common';
import type { ApiError, ErrorCode } from '@agenda/contracts';
import { errorCatalog, SafeHttpError } from './errors.js';

interface RequestContext {
  headers: Record<string, string | string[] | undefined>;
  correlation_id?: string;
}
interface JsonResponse {
  setHeader(name: string, value: string): void;
  status(code: number): JsonResponse;
  json(body: unknown): void;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fallbackCodes: Record<number, ErrorCode> = {
  400: 'VALIDATION_ERROR', 401: 'AUTH_REQUIRED', 403: 'FORBIDDEN',
  404: 'RESOURCE_NOT_FOUND', 405: 'METHOD_NOT_ALLOWED', 409: 'VERSION_CONFLICT',
  413: 'PAYLOAD_TOO_LARGE', 415: 'UNSUPPORTED_MEDIA_TYPE', 422: 'VALIDATION_ERROR',
  429: 'RATE_LIMITED', 503: 'DEPENDENCY_UNAVAILABLE',
};

const parserStatuses: Record<string, number> = {
  'entity.too.large': 413, 'entity.parse.failed': 400,
  'charset.unsupported': 415, 'encoding.unsupported': 415,
};

@Catch()
export class SafeErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestContext>();
    const response = context.getResponse<JsonResponse>();
    const correlation = request.correlation_id ?? randomUUID();
    // Body-parser errors occur before controllers; treat only recognized transport failures specially.
    const parserType = typeof exception === 'object' && exception !== null && 'type' in exception ? exception.type : undefined;
    const status = exception instanceof HttpException ? exception.getStatus() : typeof parserType === 'string' ? parserStatuses[parserType] ?? 500 : 500;
    const code = exception instanceof SafeHttpError ? exception.code : fallbackCodes[status] ?? 'INTERNAL_ERROR';
    const body: ApiError = { error: {
      code, message: errorCatalog[code][1], correlation_id: correlation,
      field_errors: exception instanceof SafeHttpError ? exception.fieldErrors : [],
      // No automatic mutation retries. Future operations require explicit recovery/idempotency.
      retryable: false,
    } };
    response.setHeader('X-Correlation-ID', correlation);
    response.status(code === 'INTERNAL_ERROR' ? 500 : status).json(body);
  }
}

export function configureHttp(app: INestApplication): void {
  // Runs before JSON parsing so even malformed/oversized payloads retain correlation.
  app.use((request: RequestContext, response: JsonResponse, next: () => void) => {
    const incoming = request.headers['x-correlation-id'];
    request.correlation_id = typeof incoming === 'string' && uuid.test(incoming) ? incoming.toLowerCase() : randomUUID();
    response.setHeader('X-Correlation-ID', request.correlation_id);
    next();
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalFilters(new SafeErrorFilter());
}
