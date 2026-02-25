/**
 * MCP Tools Registration
 *
 * Registers all available tools with the MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerValidateTool } from "./validate.js";
import { registerEmailTools } from "./email.js";
import { registerSearchTools } from "./search.js";
import { registerContactTools } from "./contacts.js";
import { registerCompanyTools } from "./companies.js";
import { registerListTools } from "./lists.js";
import { registerPropertyTools } from "./properties.js";

export function registerTools(server: McpServer): void {
  registerValidateTool(server);
  registerEmailTools(server);
  registerSearchTools(server);
  registerContactTools(server);
  registerCompanyTools(server);
  registerListTools(server);
  registerPropertyTools(server);
}
