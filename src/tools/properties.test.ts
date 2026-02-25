import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../getprospect/client-factory.js", () => ({
  getGetProspectClient: vi.fn(),
}));

import { getGetProspectClient } from "../getprospect/client-factory.js";
import { registerPropertyTools } from "./properties.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Property Tools", () => {
  const ctx = createToolTestContext();
  const mock = getGetProspectClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerPropertyTools(ctx.server);
  });

  it("should register the tool", () => {
    expect(ctx.tools.has("getprospect.properties.list")).toBe(true);
  });

  describe("getprospect.properties.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.properties.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("getprospect.properties.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { properties: [] });
      const result = await ctx.callTool("getprospect.properties.list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({ path: "/api/v1/properties", method: "GET" })
      );
    });
  });
});
