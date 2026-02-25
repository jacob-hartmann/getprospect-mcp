/**
 * GetProspect Client Factory
 *
 * Shared factory for creating GetProspectClient instances from MCP request context.
 * Used by both tools and resources to avoid code duplication.
 *
 * Caches the client instance and invalidates when env vars change.
 */

import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types.js";
import { GetProspectClient } from "./client.js";
import { loadGetProspectConfig, GetProspectAuthError } from "./auth.js";

/**
 * Result type for getGetProspectClient - allows callers to handle errors gracefully
 */
export type GetProspectClientResult =
  | { success: true; client: GetProspectClient }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Client Cache
// ---------------------------------------------------------------------------

let cachedClient: GetProspectClient | undefined;
let cachedConfigHash: string | undefined;

function getConfigHash(): string {
  return `${process.env["GETPROSPECT_API_KEY"] ?? ""}:${process.env["GETPROSPECT_API_BASE_URL"] ?? ""}`;
}

/**
 * Get a GetProspectClient from MCP request context.
 *
 * Loads API key from environment variables.
 * Caches the instance and invalidates if env vars change.
 *
 * @param _extra - MCP request handler extra context (reserved for future use)
 * @returns Result with client or error message
 */
export function getGetProspectClient(
  _extra: RequestHandlerExtra<ServerRequest, ServerNotification>
): GetProspectClientResult {
  try {
    const hash = getConfigHash();
    if (cachedClient && cachedConfigHash === hash) {
      return { success: true, client: cachedClient };
    }

    const config = loadGetProspectConfig();
    cachedClient = new GetProspectClient(config);
    cachedConfigHash = hash;
    return { success: true, client: cachedClient };
  } catch (err) {
    // Invalidate cache on error
    cachedClient = undefined;
    cachedConfigHash = undefined;

    if (err instanceof GetProspectAuthError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown auth error",
    };
  }
}

/**
 * Get a GetProspectClient, throwing on error.
 *
 * Use this variant when errors should propagate as exceptions (e.g., resources).
 *
 * @param extra - MCP request handler extra context
 * @returns GetProspectClient instance
 * @throws Error if client cannot be created
 */
export function getGetProspectClientOrThrow(
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>
): GetProspectClient {
  const result = getGetProspectClient(extra);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.client;
}
