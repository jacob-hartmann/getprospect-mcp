import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../getprospect/client-factory.js", () => ({
  getGetProspectClient: vi.fn(),
}));

import { getGetProspectClient } from "../getprospect/client-factory.js";
import { registerCompanyTools } from "./companies.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Company Tools", () => {
  const ctx = createToolTestContext();
  const mock = getGetProspectClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerCompanyTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("getprospect.companies.search")).toBe(true);
    expect(ctx.tools.has("getprospect.companies.get")).toBe(true);
    expect(ctx.tools.has("getprospect.companies.create")).toBe(true);
    expect(ctx.tools.has("getprospect.companies.update")).toBe(true);
    expect(ctx.tools.has("getprospect.companies.delete")).toBe(true);
  });

  describe("getprospect.companies.search", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.companies.search", {
        name: "Acme",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("getprospect.companies.search", {
        name: "Acme",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send GET with query params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { companies: [] });
      const result = await ctx.callTool("getprospect.companies.search", {
        name: "Acme",
        limit: 10,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/companies/company/search/query",
          method: "GET",
          params: expect.objectContaining({ name: "Acme", limit: "10" }),
        })
      );
    });
  });

  describe("getprospect.companies.get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.companies.get", {
        companyId: "co-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("getprospect.companies.get", {
        companyId: "co-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "co-1" });
      const result = await ctx.callTool("getprospect.companies.get", {
        companyId: "co-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/companies/company/co-1",
          method: "GET",
        })
      );
    });
  });

  describe("getprospect.companies.create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.companies.create", {
        properties: [],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("getprospect.companies.create", {
        properties: [],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with properties", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "co-new" });
      const props = [{ property: "name", value: "Acme" }];
      const result = await ctx.callTool("getprospect.companies.create", {
        properties: props,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/companies/company",
          method: "POST",
          body: { properties: props },
        })
      );
    });
  });

  describe("getprospect.companies.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.companies.update", {
        companyId: "co-1",
        properties: [],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("getprospect.companies.update", {
        companyId: "co-1",
        properties: [],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "co-1" });
      const props = [{ property: "name", value: "Acme Inc" }];
      const result = await ctx.callTool("getprospect.companies.update", {
        companyId: "co-1",
        properties: props,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/companies/company/co-1",
          method: "PATCH",
          body: { properties: props },
        })
      );
    });
  });

  describe("getprospect.companies.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.companies.delete", {
        companyId: "co-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("getprospect.companies.delete", {
        companyId: "co-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("getprospect.companies.delete", {
        companyId: "co-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/companies/company/co-1",
          method: "DELETE",
        })
      );
    });
  });
});
