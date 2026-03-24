/**
 * GetProspect API Client
 *
 * Generic HTTP client wrapper for the GetProspect REST API.
 *
 * - Sets `apiKey: <API_KEY>` header on all requests
 * - Centralizes error mapping into typed GetProspectClientError
 * - Uses AbortController for request timeouts
 */

import { FETCH_TIMEOUT_MS } from "../constants.js";
import {
  GetProspectClientError,
  type GetProspectConfig,
  type GetProspectResult,
} from "./types.js";

// ---------------------------------------------------------------------------
// HTTP Methods
// ---------------------------------------------------------------------------

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  /** URL path relative to the base URL (e.g., "/api/v1/contacts/contact") */
  path: string;
  /** HTTP method (defaults to GET) */
  method?: HttpMethod;
  /** Query parameters */
  params?: Record<string, string>;
  /** JSON request body */
  body?: unknown;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/**
 * GetProspect API Client
 *
 * Wraps the GetProspect REST API with typed error handling and auth.
 */
export class GetProspectClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: GetProspectConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
  }

  /**
   * Make an authenticated request to the GetProspect API.
   *
   * @param options - Request configuration
   * @returns Typed result with data or error
   */
  async request<T>(options: RequestOptions): Promise<GetProspectResult<T>> {
    const { path, method = "GET", params, body } = options;

    // Build URL
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    // Set up timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, FETCH_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        apiKey: this.apiKey,
        Accept: "application/json",
      };

      const init: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(body);
      }

      const response = await fetch(url.toString(), init);

      // Map HTTP status to typed error
      if (!response.ok) {
        return { success: false, error: await this.mapHttpError(response) };
      }

      // Parse response — guard against non-JSON bodies
      let data: T;
      try {
        data = (await response.json()) as T;
      } catch {
        return {
          success: false,
          error: new GetProspectClientError(
            "Received non-JSON response from the GetProspect API",
            "UNKNOWN",
            response.status,
            false
          ),
        };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: this.mapNetworkError(err) };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // -------------------------------------------------------------------------
  // Error Mapping
  // -------------------------------------------------------------------------

  private async mapHttpError(
    response: Response
  ): Promise<GetProspectClientError> {
    const status = response.status;

    // Try to extract API error message from response body
    let apiMessage: string | undefined;
    try {
      const body = (await response.json()) as Record<string, unknown>;
      const msg = body["message"] ?? body["error"];
      if (typeof msg === "string") {
        apiMessage = msg;
      }
    } catch {
      // Non-JSON error body — proceed without apiMessage
    }

    const suffix = apiMessage ? `: ${apiMessage}` : "";

    switch (status) {
      case 400:
        return new GetProspectClientError(
          `Bad request${suffix}`,
          "VALIDATION_ERROR",
          status,
          false,
          apiMessage
        );
      case 401:
        return new GetProspectClientError(
          `Unauthorized – invalid or missing API key${suffix}`,
          "UNAUTHORIZED",
          status,
          false,
          apiMessage
        );
      case 402:
        return new GetProspectClientError(
          `Insufficient credits${suffix}`,
          "INSUFFICIENT_CREDITS",
          status,
          false,
          apiMessage
        );
      case 404:
        return new GetProspectClientError(
          `Resource not found${suffix}`,
          "NOT_FOUND",
          status,
          false,
          apiMessage
        );
      case 408:
        return new GetProspectClientError(
          `Request timeout${suffix}`,
          "TIMEOUT",
          status,
          true,
          apiMessage
        );
      case 429:
        return new GetProspectClientError(
          `Rate limit exceeded. Please wait before retrying.${suffix}`,
          "RATE_LIMITED",
          status,
          true,
          apiMessage
        );
      default:
        if (status >= 400 && status < 500) {
          return new GetProspectClientError(
            `Client error (${status})${suffix}`,
            "VALIDATION_ERROR",
            status,
            false,
            apiMessage
          );
        }
        return new GetProspectClientError(
          `Server error (${status})${suffix}`,
          "SERVER_ERROR",
          status,
          true,
          apiMessage
        );
    }
  }

  private mapNetworkError(err: unknown): GetProspectClientError {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return new GetProspectClientError(
          "Request timed out",
          "TIMEOUT",
          undefined,
          true
        );
      }
      return new GetProspectClientError(
        `Network error: ${err.message}`,
        "NETWORK_ERROR",
        undefined,
        false
      );
    }
    return new GetProspectClientError(
      "Unknown error occurred",
      "UNKNOWN",
      undefined,
      false
    );
  }
}
