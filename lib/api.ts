import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Error codes matching the API spec
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "DUPLICATE_HAZARD"
  | "CONFLICTING_VOTE"
  | "INTERNAL_ERROR";

interface ApiErrorDetails {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

// Generate a simple request ID
function generateRequestId(): string {
  return `req_${Math.random().toString(36).substring(2, 14)}`;
}

// Standard success response
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

// Paginated success response
export function apiPaginated<T>(
  data: T[],
  nextCursor: string | null,
  hasMore: boolean
): NextResponse {
  return NextResponse.json({ data, nextCursor, hasMore }, { status: 200 });
}

// Standard error response
export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>
): NextResponse {
  const error: ApiErrorDetails = {
    code,
    message,
    requestId: generateRequestId(),
  };

  if (details) {
    error.details = details;
  }

  return NextResponse.json({ error }, { status });
}

// Common error responses
export const errors = {
  unauthorized: (message = "Authentication required") =>
    apiError("UNAUTHORIZED", message, 401),

  forbidden: (message = "You do not have permission to perform this action") =>
    apiError("FORBIDDEN", message, 403),

  notFound: (resource = "Resource") =>
    apiError("NOT_FOUND", `${resource} not found`, 404),

  validation: (message: string, field?: string) =>
    apiError("VALIDATION_ERROR", message, 400, field ? { field } : undefined),

  conflict: (code: ApiErrorCode, message: string) =>
    apiError(code, message, 409),

  rateLimited: (retryAfter: number) => {
    const response = apiError("RATE_LIMITED", "Too many requests", 429);
    response.headers.set("Retry-After", String(retryAfter));
    return response;
  },

  internal: (message = "An unexpected error occurred") =>
    apiError("INTERNAL_ERROR", message, 500),
};

// Handle Zod validation errors
export function handleZodError(error: ZodError): NextResponse {
  const firstIssue = error.issues[0];
  const field = firstIssue?.path.join(".");
  const message = firstIssue?.message ?? "Validation failed";

  return errors.validation(message, field || undefined);
}

// Wrapper for async route handlers with error handling
export function withErrorHandler<T>(
  handler: (request: Request, context: T) => Promise<NextResponse>
) {
  return async (request: Request, context: T): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof ZodError) {
        return handleZodError(error);
      }

      return errors.internal();
    }
  };
}

// Parse cursor for pagination (base64 encoded JSON)
export function decodeCursor(cursor: string | null): Record<string, unknown> | null {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}
