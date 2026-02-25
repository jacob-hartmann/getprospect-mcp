/**
 * GetProspect Email Tools
 *
 * Tools for email verification, finding, and lookup.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getGetProspectClient } from "../getprospect/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  getprospectOutputSchema,
} from "./utils.js";

export function registerEmailTools(server: McpServer): void {
  // getprospect.email.verify
  server.registerTool(
    "getprospect.email.verify",
    {
      title: "Verify Email",
      description: "Verify the deliverability of an email address.",
      inputSchema: z.object({
        email: z.string().describe("Email address to verify"),
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
        path: "/public/v1/email/verify",
        method: "GET",
        params: { email: args.email },
      });

      if (!result.success) return formatError(result.error);
      return formatSuccess(result.data);
    }
  );

  // getprospect.email.find
  server.registerTool(
    "getprospect.email.find",
    {
      title: "Find Email",
      description: "Find an email address by person name and company name.",
      inputSchema: z.object({
        name: z.string().describe("Full name of the person"),
        company: z.string().describe("Company name or domain"),
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
        path: "/public/v1/email/find",
        method: "GET",
        params: { name: args.name, company: args.company },
      });

      if (!result.success) return formatError(result.error);
      return formatSuccess(result.data);
    }
  );

  // getprospect.email.lookup
  server.registerTool(
    "getprospect.email.lookup",
    {
      title: "Lookup Contact by Email",
      description: "Look up contact information by email address.",
      inputSchema: z.object({
        email: z.string().describe("Email address to look up"),
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
        path: "/public/v1/email/lookup",
        method: "GET",
        params: { email: args.email },
      });

      if (!result.success) return formatError(result.error);
      return formatSuccess(result.data);
    }
  );
}
