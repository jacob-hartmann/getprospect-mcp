/**
 * GetProspect Contact Tools
 *
 * Tools for managing CRM contacts.
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

export function registerContactTools(server: McpServer): void {
  // getprospect.contacts.search
  server.registerTool(
    "getprospect.contacts.search",
    {
      title: "Search Contacts",
      description: "Search CRM contacts with filters and pagination.",
      inputSchema: z.object({
        filters: z
          .array(
            z.object({
              operator: z
                .string()
                .describe("Filter operator (e.g., 'is', 'contains', 'isNot')"),
              property: z.string().describe("Property to filter on"),
              value: z.string().describe("Filter value"),
            })
          )
          .optional()
          .describe("Array of filter conditions"),
        listId: z.string().optional().describe("Filter by list ID"),
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
      });
      const body = buildParams({
        filters: args.filters,
        listId: args.listId,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/api/v1/contacts/contact/search",
        method: "POST",
        body,
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "contact");
      return formatSuccess(result.data);
    }
  );

  // getprospect.contacts.get
  server.registerTool(
    "getprospect.contacts.get",
    {
      title: "Get Contact",
      description: "Get details of a specific CRM contact.",
      inputSchema: z.object({
        contactId: z.string().describe("Contact ID"),
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
        path: `/api/v1/contacts/contact/${args.contactId}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "contact");
      return formatSuccess(result.data);
    }
  );

  // getprospect.contacts.create
  server.registerTool(
    "getprospect.contacts.create",
    {
      title: "Create Contact",
      description: "Create a new CRM contact with the given properties.",
      inputSchema: z.object({
        properties: z
          .array(
            z.object({
              property: z
                .string()
                .describe(
                  "Property name (e.g., 'firstName', 'lastName', 'email')"
                ),
              value: z.string().describe("Property value"),
            })
          )
          .describe("Array of contact properties"),
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
        path: "/api/v1/contacts/contact",
        method: "POST",
        body: { properties: args.properties },
      });

      if (!result.success) return formatError(result.error, "contact");
      return formatSuccess(result.data);
    }
  );

  // getprospect.contacts.update
  server.registerTool(
    "getprospect.contacts.update",
    {
      title: "Update Contact",
      description: "Update an existing CRM contact's properties.",
      inputSchema: z.object({
        contactId: z.string().describe("Contact ID"),
        properties: z
          .array(
            z.object({
              property: z.string().describe("Property name"),
              value: z.string().describe("New property value"),
            })
          )
          .describe("Array of properties to update"),
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
        path: `/api/v1/contacts/contact/${args.contactId}`,
        method: "PATCH",
        body: { properties: args.properties },
      });

      if (!result.success) return formatError(result.error, "contact");
      return formatSuccess(result.data);
    }
  );

  // getprospect.contacts.delete
  server.registerTool(
    "getprospect.contacts.delete",
    {
      title: "Delete Contact",
      description:
        "Permanently delete a CRM contact. This action cannot be undone.",
      inputSchema: z.object({
        contactId: z.string().describe("Contact ID"),
      }),
      outputSchema: getprospectOutputSchema,
      annotations: {
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getGetProspectClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/api/v1/contacts/contact/${args.contactId}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "contact");
      return formatSuccess(result.data);
    }
  );

  // getprospect.contacts.addCompanies
  server.registerTool(
    "getprospect.contacts.addCompanies",
    {
      title: "Add Companies to Contact",
      description: "Link one or more companies to a contact.",
      inputSchema: z.object({
        contactId: z.string().describe("Contact ID"),
        companies: z
          .array(
            z.object({
              companyId: z.string().describe("Company ID"),
              email: z
                .string()
                .optional()
                .describe("Contact email at this company"),
              status: z.string().optional().describe("Status"),
              position: z
                .string()
                .optional()
                .describe("Position/title at this company"),
            })
          )
          .describe("Array of company associations"),
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
        path: `/api/v1/contacts/contact/${args.contactId}/companies`,
        method: "POST",
        body: { companies: args.companies },
      });

      if (!result.success) return formatError(result.error, "contact");
      return formatSuccess(result.data);
    }
  );
}
