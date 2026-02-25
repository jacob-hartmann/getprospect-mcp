import { describe, it, expect, vi, beforeEach } from "vitest";
import type { GetProspectClientResult } from "./client-factory.js";
import type { GetProspectClient } from "./client.js";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types.js";

type GetClientFn = (
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>
) => GetProspectClientResult;

type GetClientOrThrowFn = (
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>
) => GetProspectClient;

describe("client-factory", () => {
  const mockExtra = {} as any;

  let getGetProspectClient: GetClientFn;
  let getGetProspectClientOrThrow: GetClientOrThrowFn;
  let mockLoadGetProspectConfig: ReturnType<typeof vi.fn>;
  let clientInstances: any[];

  beforeEach(async () => {
    vi.resetModules();
    clientInstances = [];

    mockLoadGetProspectConfig = vi.fn().mockReturnValue({
      apiKey: "key",
      baseUrl: "https://api.getprospect.com",
    });

    vi.doMock("./auth.js", () => {
      class GetProspectAuthError extends Error {
        code: string;
        constructor(message: string, code: string) {
          super(message);
          this.name = "GetProspectAuthError";
          this.code = code;
        }
      }
      return {
        loadGetProspectConfig: mockLoadGetProspectConfig,
        GetProspectAuthError,
      };
    });

    vi.doMock("./client.js", () => {
      return {
        GetProspectClient: class MockGetProspectClient {
          constructor(_config: any) {
            clientInstances.push(this);
          }
          request = vi.fn();
        },
      };
    });

    const mod = await import("./client-factory.js");
    getGetProspectClient = mod.getGetProspectClient;
    getGetProspectClientOrThrow = mod.getGetProspectClientOrThrow;

    process.env["GETPROSPECT_API_KEY"] = "key";
    delete process.env["GETPROSPECT_API_BASE_URL"];
  });

  it("should create a client on first call (cache miss)", () => {
    const result = getGetProspectClient(mockExtra);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.client).toBeDefined();
    }
    expect(clientInstances).toHaveLength(1);
  });

  it("should return cached client on second call (cache hit)", () => {
    const result1 = getGetProspectClient(mockExtra);
    const result2 = getGetProspectClient(mockExtra);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    if (result1.success && result2.success) {
      expect(result1.client).toBe(result2.client);
    }
    expect(clientInstances).toHaveLength(1);
  });

  it("should invalidate cache when env vars change", () => {
    getGetProspectClient(mockExtra);
    expect(clientInstances).toHaveLength(1);

    process.env["GETPROSPECT_API_KEY"] = "new-key";
    getGetProspectClient(mockExtra);
    expect(clientInstances).toHaveLength(2);
  });

  it("should handle missing env vars in config hash (nullish coalescing)", () => {
    delete process.env["GETPROSPECT_API_KEY"];
    delete process.env["GETPROSPECT_API_BASE_URL"];

    const result = getGetProspectClient(mockExtra);
    expect(result.success).toBe(true);
    expect(clientInstances).toHaveLength(1);
  });

  it("should include GETPROSPECT_API_BASE_URL in config hash", () => {
    getGetProspectClient(mockExtra);
    expect(clientInstances).toHaveLength(1);

    process.env["GETPROSPECT_API_BASE_URL"] = "https://custom.api.com";
    getGetProspectClient(mockExtra);
    expect(clientInstances).toHaveLength(2);
  });

  it("should return error when GetProspectAuthError is thrown", async () => {
    const { GetProspectAuthError } = await import("./auth.js");
    mockLoadGetProspectConfig.mockImplementation(() => {
      throw new GetProspectAuthError("Missing API key", "NO_API_KEY");
    });

    const result = getGetProspectClient(mockExtra);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Missing API key");
    }
  });

  it("should return error when generic Error is thrown", () => {
    mockLoadGetProspectConfig.mockImplementation(() => {
      throw new Error("Something went wrong");
    });

    const result = getGetProspectClient(mockExtra);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Something went wrong");
    }
  });

  it("should return 'Unknown auth error' when non-Error is thrown", () => {
    mockLoadGetProspectConfig.mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw "string error";
    });

    const result = getGetProspectClient(mockExtra);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Unknown auth error");
    }
  });

  it("should invalidate cache on error", () => {
    getGetProspectClient(mockExtra);
    expect(clientInstances).toHaveLength(1);

    mockLoadGetProspectConfig.mockImplementation(() => {
      throw new Error("fail");
    });

    process.env["GETPROSPECT_API_KEY"] = "changed";
    const result = getGetProspectClient(mockExtra);
    expect(result.success).toBe(false);

    mockLoadGetProspectConfig.mockReturnValue({
      apiKey: "changed",
      baseUrl: "https://api.getprospect.com",
    });
    const result2 = getGetProspectClient(mockExtra);
    expect(result2.success).toBe(true);
    expect(clientInstances).toHaveLength(2);
  });

  it("getGetProspectClientOrThrow should return client on success", () => {
    const client = getGetProspectClientOrThrow(mockExtra);
    expect(client).toBeDefined();
  });

  it("getGetProspectClientOrThrow should throw on failure", () => {
    mockLoadGetProspectConfig.mockImplementation(() => {
      throw new Error("fail");
    });

    expect(() => getGetProspectClientOrThrow(mockExtra)).toThrow("fail");
  });
});
