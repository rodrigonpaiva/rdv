import { HttpException } from '@nestjs/common';
import type { ErrorCode, FieldError } from '@agenda/contracts';

// Closed server-owned catalog: never forward exception.message or database/provider details.
export const errorCatalog = {
  VALIDATION_ERROR: [400, 'Check the request fields.'],
  ACCEPTANCE_REQUIRED: [422, 'Explicit acceptance is required.'],
  AUTH_REQUIRED: [401, 'Authentication is required.'],
  SESSION_EXPIRED: [401, 'Authenticate again to continue.'],
  FORBIDDEN: [403, 'This operation is not permitted.'],
  RESOURCE_NOT_FOUND: [404, 'Resource not found.'],
  SLOT_UNAVAILABLE: [409, 'Choose another available time.'],
  VERSION_CONFLICT: [409, 'Reload the current state before continuing.'],
  POLICY_CHANGED: [409, 'Review the updated conditions.'],
  QUOTE_EXPIRED: [409, 'Request a new summary.'],
  QUOTE_CONSUMED: [409, 'Retrieve the existing booking.'],
  IDEMPOTENCY_CONFLICT: [409, 'This key was used for a different request.'],
  BOOKING_CREATION_SUSPENDED: [409, 'New bookings are currently unavailable.'],
  HUMAN_REVIEW_REQUIRED: [409, 'Human review is required.'],
  CONVERSATION_NOT_BOT_ACTIVE: [409, 'Automated actions are paused.'],
  RATE_LIMITED: [429, 'Wait before trying again.'],
  DEPENDENCY_UNAVAILABLE: [503, 'The service is temporarily unavailable.'],
  INTERNAL_ERROR: [500, 'The request could not be completed.'],
  PAYLOAD_TOO_LARGE: [413, 'The request exceeds the permitted size.'],
  UNSUPPORTED_MEDIA_TYPE: [415, 'Use the supported request content type.'],
  METHOD_NOT_ALLOWED: [405, 'This method is not supported.'],
} as const satisfies Record<ErrorCode, readonly [number, string]>;

export class SafeHttpError extends HttpException {
  constructor(readonly code: ErrorCode, readonly fieldErrors: FieldError[] = []) {
    super(errorCatalog[code][1], errorCatalog[code][0]);
  }
}
