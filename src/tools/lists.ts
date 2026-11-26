/**
 * GetProspect List Tools
 *
 * Tools for managing contact lists.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getGetProspectClient } from "../getprospect/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  buildParams,
  getprospectOutputSchema,
} from "./utils.js";

export function registerListTools(server: McpServer): void {
  // getprospect.lists.list
  server.registerTool(
    "getprospect.lists.list",
    {
      title: "List All Lists",
      description: "Get all contact lists (paginated).",
      inputSchema: z.object({
        pageSize: z
          .number()
          .min(1)
          .max(500)
          .optional()
          .describe("Number of results per page (1-500)"),
        pageNumber: z
          .number()
          .min(1)
          .optional()
          .describe("Page number (1-based)"),
        sort: z.string().optional().describe("Sort field"),
        order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
      }),
      outputSchema: getprospectOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getGetProspectClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const params = buildParams({
        pageSize: args.pageSize?.toString(),
        pageNumber: args.pageNumber?.toString(),
        sort: args.sort,
        order: args.order,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/api/v1/contacts/lists",
        method: "GET",
        params,
      });

      if (!result.success) return formatError(result.error, "list");
      return formatSuccess(result.data);
    }
  );

  // getprospect.lists.create
  server.registerTool(
    "getprospect.lists.create",
    {
      title: "Create List",
      description: "Create a new contact list.",
      inputSchema: z.object({
        name: z.string().describe("Name for the new list"),
      }),
      outputSchema: getprospectOutputSchema,
      annotations: {
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getGetProspectClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/api/v1/contacts/lists",
        method: "POST",
        body: { name: args.name },
      });

      if (!result.success) return formatError(result.error, "list");
      return formatSuccess(result.data);
    }
  );

  // getprospect.lists.update
  server.registerTool(
    "getprospect.lists.update",
    {
      title: "Update List",
      description: "Update a list name.",
      inputSchema: z.object({
        listId: z.string().describe("List ID"),
        name: z.string().describe("New name for the list"),
      }),
      outputSchema: getprospectOutputSchema,
      annotations: {
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getGetProspectClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/api/v1/contacts/lists/${args.listId}`,
        method: "PATCH",
        body: { name: args.name },
      });

      if (!result.success) return formatError(result.error, "list");
      return formatSuccess(result.data);
    }
  );

  // getprospect.lists.delete
  server.registerTool(
    "getprospect.lists.delete",
    {
      title: "Delete Lists",
      description:
        "Delete one or more contact lists. This action cannot be undone.",
      inputSchema: z.object({
        listIds: z.array(z.string()).describe("Array of list IDs to delete"),
      }),
      outputSchema: getprospectOutputSchema,
      annotations: {
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getGetProspectClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/api/v1/contacts/lists",
        method: "DELETE",
        body: { listIds: args.listIds },
      });

      if (!result.success) return formatError(result.error, "list");
      return formatSuccess(result.data);
    }
  );

  // getprospect.lists.sizes
  server.registerTool(
    "getprospect.lists.sizes",
    {
      title: "Get List Sizes",
      description: "Get contact counts for one or more lists.",
      inputSchema: z.object({
        listIds: z
          .array(z.string())
          .describe("Array of list IDs to get sizes for"),
      }),
      outputSchema: getprospectOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getGetProspectClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/api/v1/contacts/lists/lists-sizes",
        method: "POST",
        body: { listIds: args.listIds },
      });

      if (!result.success) return formatError(result.error, "list");
      return formatSuccess(result.data);
    }
  );

  // getprospect.lists.addContacts
  server.registerTool(
    "getprospect.lists.addContacts",
    {
      title: "Add Contacts to List",
      description: "Add one or more contacts to a list.",
      inputSchema: z.object({
        listId: z.string().describe("List ID"),
        contactsIds: z
          .array(z.string())
          .describe("Array of contact IDs to add"),
      }),
      outputSchema: getprospectOutputSchema,
      annotations: {
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getGetProspectClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/api/v1/contacts/lists/${args.listId}/add`,
        method: "POST",
        body: { contactsIds: args.contactsIds },
      });

      if (!result.success) return formatError(result.error, "list");
      return formatSuccess(result.data);
    }
  );

  // getprospect.lists.contacts
  server.registerTool(
    "getprospect.lists.contacts",
    {
      title: "Get List Contacts",
      description: "Get contacts in a specific list (paginated).",
      inputSchema: z.object({
        listId: z.string().describe("List ID"),
        pageSize: z
          .number()
          .min(1)
          .max(500)
          .optional()
          .describe("Number of results per page (1-500)"),
        pageNumber: z
          .number()
          .min(1)
          .optional()
          .describe("Page number (1-based)"),
        sort: z.string().optional().describe("Sort field"),
        order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
      }),
      outputSchema: getprospectOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getGetProspectClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const params = buildParams({
        pageSize: args.pageSize?.toString(),
        pageNumber: args.pageNumber?.toString(),
        sort: args.sort,
        order: args.order,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/api/v1/contacts/lists/${args.listId}/contacts/search`,
        method: "GET",
        params,
      });

      if (!result.success) return formatError(result.error, "list");
      return formatSuccess(result.data);
    }
  );
}
