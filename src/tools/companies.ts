/**
 * GetProspect Company Tools
 *
 * Tools for managing CRM companies.
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

export function registerCompanyTools(server: McpServer): void {
  // getprospect.companies.search
  server.registerTool(
    "getprospect.companies.search",
    {
      title: "Search Companies",
      description: "Search CRM companies by name.",
      inputSchema: z.object({
        name: z.string().describe("Company name to search for"),
        limit: z
          .number()
          .min(1)
          .max(100)
          .optional()
          .describe("Maximum number of results (1-100)"),
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
        name: args.name,
        limit: args.limit?.toString(),
      });

      const result = await clientResult.client.request<unknown>({
        path: "/api/v1/companies/company/search/query",
        method: "GET",
        params,
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );

  // getprospect.companies.get
  server.registerTool(
    "getprospect.companies.get",
    {
      title: "Get Company",
      description: "Get details of a specific CRM company.",
      inputSchema: z.object({
        companyId: z.string().describe("Company ID"),
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
        path: `/api/v1/companies/company/${args.companyId}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );

  // getprospect.companies.create
  server.registerTool(
    "getprospect.companies.create",
    {
      title: "Create Company",
      description: "Create a new CRM company with the given properties.",
      inputSchema: z.object({
        properties: z
          .array(
            z.object({
              property: z
                .string()
                .describe("Property name (e.g., 'name', 'domain', 'industry')"),
              value: z.string().describe("Property value"),
            })
          )
          .describe("Array of company properties"),
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
        path: "/api/v1/companies/company",
        method: "POST",
        body: { properties: args.properties },
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );

  // getprospect.companies.update
  server.registerTool(
    "getprospect.companies.update",
    {
      title: "Update Company",
      description: "Update an existing CRM company's properties.",
      inputSchema: z.object({
        companyId: z.string().describe("Company ID"),
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
        path: `/api/v1/companies/company/${args.companyId}`,
        method: "PATCH",
        body: { properties: args.properties },
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );

  // getprospect.companies.delete
  server.registerTool(
    "getprospect.companies.delete",
    {
      title: "Delete Company",
      description:
        "Permanently delete a CRM company. This action cannot be undone.",
      inputSchema: z.object({
        companyId: z.string().describe("Company ID"),
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
        path: `/api/v1/companies/company/${args.companyId}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );
}
