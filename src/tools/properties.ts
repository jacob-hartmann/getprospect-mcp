/**
 * GetProspect Properties Tool
 *
 * Tool for listing workspace properties.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getGetProspectClient } from "../getprospect/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  getprospectOutputSchema,
} from "./utils.js";

export function registerPropertyTools(server: McpServer): void {
  // getprospect.properties.list
  server.registerTool(
    "getprospect.properties.list",
    {
      title: "List Properties",
      description: "Get all workspace properties (contact and company fields).",
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
