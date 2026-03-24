/**
 * MCP Resources Registration
 *
 * Registers all available resources with the MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getGetProspectClientOrThrow } from "../getprospect/client-factory.js";

export function registerResources(server: McpServer): void {
  // 1. Lists
  server.registerResource(
    "lists",
    "getprospect://lists",
    {
      title: "GetProspect Lists",
      description: "List all contact lists in your GetProspect workspace",
    },
    async (_uri, extra) => {
      const client = getGetProspectClientOrThrow(extra);

      const result = await client.request<unknown>({
        path: "/api/v1/contacts/lists",
        method: "GET",
      });

      if (!result.success) {
        throw new Error(
          `GetProspect API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: "getprospect://lists",
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // 2. List contacts (template)
  server.registerResource(
    "list-contacts",
    new ResourceTemplate("getprospect://lists/{id}/contacts", {
      list: undefined,
    }),
    {
      title: "List Contacts",
      description: "Get contacts in a specific list",
    },
    async (_uri, variables, extra) => {
      const client = getGetProspectClientOrThrow(extra);
      const id = String(variables["id"]);

      const result = await client.request<unknown>({
        path: `/api/v1/contacts/lists/${id}/contacts/search`,
        method: "GET",
      });

      if (!result.success) {
        throw new Error(
          `GetProspect API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: `getprospect://lists/${id}/contacts`,
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // 3. Properties
  server.registerResource(
    "properties",
    "getprospect://properties",
    {
      title: "GetProspect Properties",
      description: "List all workspace properties",
    },
    async (_uri, extra) => {
      const client = getGetProspectClientOrThrow(extra);

      const result = await client.request<unknown>({
        path: "/api/v1/properties",
        method: "GET",
      });

      if (!result.success) {
        throw new Error(
          `GetProspect API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: "getprospect://properties",
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );
}
