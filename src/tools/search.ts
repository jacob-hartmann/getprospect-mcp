/**
 * GetProspect Search / Insights Tools
 *
 * Tools for searching leads, companies, LinkedIn enrichment, and fast search.
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

export function registerSearchTools(server: McpServer): void {
  // getprospect.search.leads
  server.registerTool(
    "getprospect.search.leads",
    {
      title: "Search Leads",
      description:
        "Search for leads (contacts) with filters like name, title, seniority, industry, and location.",
      inputSchema: z.object({
        name: z.string().optional().describe("Contact name to search for"),
        title: z.string().optional().describe("Job title filter"),
        seniority: z
          .string()
          .optional()
          .describe(
            "Seniority level (e.g., 'C-Level', 'VP', 'Director', 'Manager')"
          ),
        industry: z.string().optional().describe("Industry filter"),
        location: z
          .string()
          .optional()
          .describe("Location filter (city, state, or country)"),
        companyName: z.string().optional().describe("Company name filter"),
        companyDomain: z.string().optional().describe("Company domain filter"),
        companySize: z
          .string()
          .optional()
          .describe("Company size range (e.g., '1-10', '11-50', '51-200')"),
        pageSize: z
          .number()
          .min(1)
          .max(500)
          .optional()
          .describe("Number of results per page (1-500, default 25)"),
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
      const body = buildParams({
        name: args.name,
        title: args.title,
        seniority: args.seniority,
        industry: args.industry,
        location: args.location,
        companyName: args.companyName,
        companyDomain: args.companyDomain,
        companySize: args.companySize,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/public/v1/insights/contacts",
        method: "POST",
        body,
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error);
      return formatSuccess(result.data);
    }
  );

  // getprospect.search.companies
  server.registerTool(
    "getprospect.search.companies",
    {
      title: "Search Companies",
      description:
        "Search for companies with filters like name, domain, industry, size, and location.",
      inputSchema: z.object({
        name: z.string().optional().describe("Company name to search for"),
        domain: z.string().optional().describe("Company domain filter"),
        industry: z.string().optional().describe("Industry filter"),
        size: z.string().optional().describe("Company size range"),
        location: z.string().optional().describe("Location filter"),
        pageSize: z
          .number()
          .min(1)
          .max(500)
          .optional()
          .describe("Number of results per page (1-500, default 25)"),
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
      const body = buildParams({
        name: args.name,
        domain: args.domain,
        industry: args.industry,
        size: args.size,
        location: args.location,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/public/v1/insights/companies",
        method: "POST",
        body,
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error);
      return formatSuccess(result.data);
    }
  );

  // getprospect.search.linkedin
  server.registerTool(
    "getprospect.search.linkedin",
    {
      title: "Enrich by LinkedIn",
      description: "Enrich a contact by their LinkedIn profile URL.",
      inputSchema: z.object({
        linkedinUrl: z
          .string()
          .describe(
            "LinkedIn profile URL (e.g., https://linkedin.com/in/username)"
          ),
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
        path: "/public/v1/insights/contact",
        method: "GET",
        params: { linkedinUrl: args.linkedinUrl },
      });

      if (!result.success) return formatError(result.error);
      return formatSuccess(result.data);
    }
  );

  // getprospect.search.fast
  server.registerTool(
    "getprospect.search.fast",
    {
      title: "Fast Search",
      description: "Quick search across contacts and companies by keyword.",
      inputSchema: z.object({
        search: z.string().describe("Search keyword or query"),
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
        path: `/api/v1/insights/search/fast-search/${encodeURIComponent(args.search)}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error);
      return formatSuccess(result.data);
    }
  );
}
