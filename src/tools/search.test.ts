import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../getprospect/client-factory.js", () => ({
  getGetProspectClient: vi.fn(),
}));

import { getGetProspectClient } from "../getprospect/client-factory.js";
import { registerSearchTools } from "./search.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Search Tools", () => {
  const ctx = createToolTestContext();
  const mock = getGetProspectClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerSearchTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("getprospect.search.leads")).toBe(true);
    expect(ctx.tools.has("getprospect.search.companies")).toBe(true);
    expect(ctx.tools.has("getprospect.search.linkedin")).toBe(true);
    expect(ctx.tools.has("getprospect.search.fast")).toBe(true);
  });

  describe("getprospect.search.leads", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.search.leads", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("getprospect.search.leads", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with filters", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { contacts: [] });
      const result = await ctx.callTool("getprospect.search.leads", {
        title: "CTO",
        pageSize: 10,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/public/v1/insights/contacts",
          method: "POST",
          body: expect.objectContaining({ title: "CTO" }),
          params: expect.objectContaining({ pageSize: "10" }),
        })
      );
    });
  });

  describe("getprospect.search.companies", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.search.companies", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("getprospect.search.companies", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with filters", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { companies: [] });
      const result = await ctx.callTool("getprospect.search.companies", {
        name: "Acme",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/public/v1/insights/companies",
          method: "POST",
          body: expect.objectContaining({ name: "Acme" }),
          params: expect.objectContaining({}),
        })
      );
    });
  });

  describe("getprospect.search.linkedin", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.search.linkedin", {
        linkedinUrl: "https://linkedin.com/in/john",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "INSUFFICIENT_CREDITS", "no credits");
      const result = await ctx.callTool("getprospect.search.linkedin", {
        linkedinUrl: "https://linkedin.com/in/john",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send GET with linkedinUrl param", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { firstName: "John" });
      const result = await ctx.callTool("getprospect.search.linkedin", {
        linkedinUrl: "https://linkedin.com/in/john",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/public/v1/insights/contact",
          method: "GET",
          params: { linkedinUrl: "https://linkedin.com/in/john" },
        })
      );
    });
  });

  describe("getprospect.search.fast", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.search.fast", {
        search: "Acme",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("getprospect.search.fast", {
        search: "Acme",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send GET with search in path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { results: [] });
      const result = await ctx.callTool("getprospect.search.fast", {
        search: "Acme Corp",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/insights/search/fast-search/Acme%20Corp",
          method: "GET",
        })
      );
    });
  });
});
