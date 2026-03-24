/**
 * MCP Prompts Registration
 *
 * Registers all available prompts with the MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "find-leads",
    {
      title: "Find Leads",
      description: "Guided workflow for searching leads",
      argsSchema: {
        title: z
          .string()
          .optional()
          .describe("Job title to search for (e.g., 'CTO')"),
        company: z.string().optional().describe("Company name to filter by"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Help me find leads using GetProspect.\n\n` +
              (args.title ? `Job title: ${args.title}\n` : "") +
              (args.company ? `Company: ${args.company}\n` : "") +
              `\nSteps:\n` +
              `1. ${args.title ? "Skip" : "Ask me what job titles or roles I'm looking for"}\n` +
              `2. ${args.company ? "Skip" : "Ask me about company, industry, or location filters"}\n` +
              `3. Use getprospect.search.leads to search with the specified filters\n` +
              `4. Present the results and offer to save interesting leads\n` +
              `5. Use getprospect.email.find to discover email addresses for selected leads`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "enrich-contact",
    {
      title: "Enrich Contact",
      description:
        "Guided workflow for contact enrichment via LinkedIn or email",
      argsSchema: {
        linkedin_url: z
          .string()
          .optional()
          .describe("LinkedIn profile URL to enrich"),
        email: z.string().optional().describe("Email address to look up"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Help me enrich a contact using GetProspect.\n\n` +
              (args.linkedin_url
                ? `LinkedIn URL: ${args.linkedin_url}\n`
                : "") +
              (args.email ? `Email: ${args.email}\n` : "") +
              `\nSteps:\n` +
              `1. ${args.linkedin_url || args.email ? "Skip" : "Ask me for a LinkedIn URL or email address"}\n` +
              `2. ${args.linkedin_url ? "Use getprospect.search.linkedin to enrich by LinkedIn URL" : args.email ? "Use getprospect.email.lookup to look up the contact" : "Use the appropriate enrichment tool based on what was provided"}\n` +
              `3. Present the enriched contact data\n` +
              `4. Offer to save the contact to the CRM using getprospect.contacts.create`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "setup-api-key",
    {
      title: "Set Up API Key",
      description: "Instructions for configuring the GetProspect API key",
      argsSchema: {},
    },
    (_args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Help me set up my GetProspect API key for the MCP server.\n\n` +
              `Steps:\n` +
              `1. Log in to your GetProspect account at https://app.getprospect.com\n` +
              `2. Navigate to Settings > API (https://app.getprospect.com/settings/api)\n` +
              `3. Create or copy your API key\n` +
              `4. Set the GETPROSPECT_API_KEY environment variable:\n` +
              `   - For Claude Desktop: Add to your MCP server config in claude_desktop_config.json\n` +
              `   - For development: Create a .env file with GETPROSPECT_API_KEY=your_key_here\n` +
              `5. Restart the MCP server\n` +
              `6. Use getprospect.validate to verify the connection`,
          },
        },
      ],
    })
  );
}
