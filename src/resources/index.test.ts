import { describe, it, expect, vi, beforeEach } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

vi.mock("../getprospect/client-factory.js", () => ({
  getGetProspectClientOrThrow: vi.fn(),
}));

vi.mock("@modelcontextprotocol/sdk/server/mcp.js", () => ({
  ResourceTemplate: class ResourceTemplate {
    constructor(
      public uri: string,
      public opts: any
    ) {}
  },
}));

import { registerResources } from "./index.js";
import { getGetProspectClientOrThrow } from "../getprospect/client-factory.js";

type ResourceHandler = (...args: any[]) => Promise<any>;

interface RegisteredResource {
  name: string;
  template: any;
  metadata: any;
  handler: ResourceHandler;
}

function setupResources() {
  const resources: RegisteredResource[] = [];

  const server = {
    registerResource: vi.fn((...args: any[]) => {
      resources.push({
        name: args[0],
        template: args[1],
        metadata: args[2],
        handler: args[3],
      });
    }),
  } as unknown as McpServer;

  registerResources(server);
  return { server, resources };
}

function createMockClient(requestResult: any) {
  const client = {
    request: vi.fn().mockResolvedValue(requestResult),
  };
  (getGetProspectClientOrThrow as ReturnType<typeof vi.fn>).mockReturnValue(
    client
  );
  return client;
}

describe("registerResources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register all 3 resources", () => {
    const { server } = setupResources();
    expect(server.registerResource).toHaveBeenCalledTimes(3);
  });

  describe("lists resource", () => {
    it("should return lists data on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "lists")!;

      createMockClient({ success: true, data: { lists: [] } });

      const result = await res.handler("getprospect://lists", {} as any);
      expect(result.contents[0].uri).toBe("getprospect://lists");
      expect(result.contents[0].mimeType).toBe("application/json");
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "lists")!;

      createMockClient({
        success: false,
        error: { code: "SERVER_ERROR", message: "fail" },
      });

      await expect(
        res.handler("getprospect://lists", {} as any)
      ).rejects.toThrow("GetProspect API Error");
    });
  });

  describe("list-contacts resource (template)", () => {
    it("should return list contacts on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "list-contacts")!;

      createMockClient({ success: true, data: { contacts: [] } });

      const result = await res.handler(
        "getprospect://lists/list-1/contacts",
        { id: "list-1" },
        {} as any
      );
      expect(result.contents[0].uri).toBe(
        "getprospect://lists/list-1/contacts"
      );
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "list-contacts")!;

      createMockClient({
        success: false,
        error: { code: "NOT_FOUND", message: "not found" },
      });

      await expect(
        res.handler(
          "getprospect://lists/list-1/contacts",
          { id: "list-1" },
          {} as any
        )
      ).rejects.toThrow("GetProspect API Error");
    });
  });

  describe("properties resource", () => {
    it("should return properties on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "properties")!;

      createMockClient({ success: true, data: { properties: [] } });

      const result = await res.handler("getprospect://properties", {} as any);
      expect(result.contents[0].uri).toBe("getprospect://properties");
      expect(result.contents[0].mimeType).toBe("application/json");
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "properties")!;

      createMockClient({
        success: false,
        error: { code: "SERVER_ERROR", message: "fail" },
      });

      await expect(
        res.handler("getprospect://properties", {} as any)
      ).rejects.toThrow("GetProspect API Error");
    });
  });
});
