/**
 * GetProspect Module
 *
 * GetProspect API client and authentication utilities.
 */

export { GetProspectClient } from "./client.js";
export {
  loadGetProspectConfig,
  isGetProspectConfigured,
  GetProspectAuthError,
} from "./auth.js";
export {
  getGetProspectClient,
  getGetProspectClientOrThrow,
} from "./client-factory.js";
export {
  GetProspectClientError,
  type GetProspectConfig,
  type GetProspectResult,
  type GetProspectSuccess,
  type GetProspectError,
  type GetProspectErrorCode,
} from "./types.js";
