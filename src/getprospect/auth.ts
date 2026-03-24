/**
 * GetProspect Authentication
 *
 * Loads GetProspect API credentials from environment variables.
 *
 * Authentication is API key-based:
 *   - GETPROSPECT_API_KEY (required) - API key sent via `apiKey` header
 *   - GETPROSPECT_API_BASE_URL (optional, defaults to https://api.getprospect.com)
 */

import { GETPROSPECT_API_BASE_URL } from "../constants.js";
import type { GetProspectConfig } from "./types.js";

export class GetProspectAuthError extends Error {
  constructor(
    message: string,
    public readonly code: "NO_API_KEY"
  ) {
    super(message);
    this.name = "GetProspectAuthError";
  }
}

export function loadGetProspectConfig(): GetProspectConfig {
  const apiKey = process.env["GETPROSPECT_API_KEY"];
  if (!apiKey) {
    throw new GetProspectAuthError(
      "GETPROSPECT_API_KEY environment variable is required. " +
        "Get your API key from: https://app.getprospect.com/settings/api.",
      "NO_API_KEY"
    );
  }

  const baseUrl =
    process.env["GETPROSPECT_API_BASE_URL"] ?? GETPROSPECT_API_BASE_URL;

  return { apiKey, baseUrl };
}

export function isGetProspectConfigured(): boolean {
  return !!process.env["GETPROSPECT_API_KEY"];
}
