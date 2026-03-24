/**
 * Shared test utilities for tool tests.
 */

import { vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GetProspectClient } from "../../getprospect/client.js";
import type { GetProspectClientResult } from "../../getprospect/client-factory.js";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToolHandler = (
  args: Record<string, unknown>,
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>
) => Promise<Record<string, unknown>> | Record<string, unknown>;

export interface ToolTestContext {
  server: McpServer;
  mockClient: GetProspectClient;
  tools: Map<string, ToolHandler>;
  callTool: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<Record<string, unknown>> | Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a test context with a mock server that captures registerTool calls.
 */
export function createToolTestContext(): ToolTestContext {
  const tools = new Map<string, ToolHandler>();

  const mockClient = {
    request: vi.fn(),
  } as unknown as GetProspectClient;

  const server = {
    registerTool: vi.fn(
      (name: string, _config: unknown, handler: ToolHandler) => {
        tools.set(name, handler);
      }
    ),
  } as unknown as McpServer;

  const mockExtra = {} as RequestHandlerExtra<
    ServerRequest,
    ServerNotification
  >;

  const callTool = (
    name: string,
    args: Record<string, unknown>
  ): Promise<Record<string, unknown>> | Record<string, unknown> => {
    const handler = tools.get(name);
    if (!handler) throw new Error(`Tool "${name}" not registered`);
    return handler(args, mockExtra);
  };

  return { server, mockClient, tools, callTool };
}

// ---------------------------------------------------------------------------
// Mock Helpers
// ---------------------------------------------------------------------------

/**
 * Mock getGetProspectClient to return success with the context's mock client.
 */
export function mockClientSuccess(
  getGetProspectClientMock: ReturnType<typeof vi.fn>,
  ctx: ToolTestContext
): void {
  getGetProspectClientMock.mockReturnValue({
    success: true,
    client: ctx.mockClient,
  } satisfies GetProspectClientResult);
}

/**
 * Mock getGetProspectClient to return an auth failure.
 */
export function mockClientAuthFailure(
  getGetProspectClientMock: ReturnType<typeof vi.fn>
): void {
  getGetProspectClientMock.mockReturnValue({
    success: false,
    error: "Missing API key",
  } satisfies GetProspectClientResult);
}

/**
 * Mock client.request to resolve with success data.
 */
export function mockRequestSuccess(ctx: ToolTestContext, data: unknown): void {
  (ctx.mockClient.request as ReturnType<typeof vi.fn>).mockResolvedValue({
    success: true,
    data,
  });
}

/**
 * Mock client.request to resolve with an error.
 */
export function mockRequestError(
  ctx: ToolTestContext,
  code: string,
  message: string
): void {
  (ctx.mockClient.request as ReturnType<typeof vi.fn>).mockResolvedValue({
    success: false,
    error: { code, message },
  });
}
