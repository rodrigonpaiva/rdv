/** Public DTOs generated from the versioned OpenAPI source; no persistence types. */
import type { components } from './generated/schema.js';
export type WorkspaceInfoDto = components['schemas']['WorkspaceInfo'];
export type ApiError = components['schemas']['ApiError'];
export type ErrorCode = components['schemas']['ErrorCode'];
export type FieldError = components['schemas']['FieldError'];
export type PaginationQuery = components['schemas']['PaginationQuery'];
export type PageInfo = components['schemas']['PageInfo'];
export type BookingAcceptance = components['schemas']['BookingAcceptance'];
export type CreateBookingInput = components['schemas']['CreateBookingInput'];
/** Each list operation must specialize its public item schema before implementation. */
export type CursorPage<T> = Omit<components['schemas']['CursorPage'], 'data'> & { data: T[] };
