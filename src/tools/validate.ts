/**
 * getprospect.validate Tool
 *
 * Validate GetProspect API credentials.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getGetProspectClient } from "../getprospect/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  getprospectOutputSchema,
} from "./utils.js";

export function registerValidateTool(server: McpServer): void {
  server.registerTool(
    "getprospect.validate",
    {
      title: "Validate API Key",
      description:
        "Validate the GetProspect API key and check connectivity to the GetProspect API.",
      inputSchema: {},
      outputSchema: getprospectOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (_args, extra) => {
      const clientResult = getGetProspectClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/api/v1/properties",
        method: "GET",
      });

      if (!result.success) return formatError(result.error);
      return formatSuccess(result.data);
    }
  );
}
