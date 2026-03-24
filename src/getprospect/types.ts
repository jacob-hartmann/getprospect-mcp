/**
 * GetProspect API Types
 *
 * Shared types for the GetProspect API client.
 */

// ---------------------------------------------------------------------------
// Error Types
// ---------------------------------------------------------------------------

/** Error codes returned by the GetProspect client */
export type GetProspectErrorCode =
  | "UNAUTHORIZED"
  | "INSUFFICIENT_CREDITS"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

/**
 * Typed error for GetProspect API operations.
 */
export class GetProspectClientError extends Error {
  constructor(
    message: string,
    public readonly code: GetProspectErrorCode,
    public readonly statusCode: number | undefined,
    public readonly retryable: boolean,
    public readonly apiMessage?: string
  ) {
    super(message);
    this.name = "GetProspectClientError";
  }
}

// ---------------------------------------------------------------------------
// Result Types
// ---------------------------------------------------------------------------

/** Success result from a GetProspect API call */
export interface GetProspectSuccess<T> {
  success: true;
  data: T;
}

/** Error result from a GetProspect API call */
export interface GetProspectError {
  success: false;
  error: GetProspectClientError;
}

/** Discriminated union for API results */
export type GetProspectResult<T> = GetProspectSuccess<T> | GetProspectError;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Configuration for the GetProspect API client */
export interface GetProspectConfig {
  /** GetProspect API key (required) */
  apiKey: string;
  /** API base URL (defaults to https://api.getprospect.com) */
  baseUrl: string;
}
