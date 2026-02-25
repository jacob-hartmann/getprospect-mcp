import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../getprospect/client-factory.js", () => ({
  getGetProspectClient: vi.fn(),
}));

import { getGetProspectClient } from "../getprospect/client-factory.js";
import { registerEmailTools } from "./email.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Email Tools", () => {
  const ctx = createToolTestContext();
  const mock = getGetProspectClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerEmailTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("getprospect.email.verify")).toBe(true);
    expect(ctx.tools.has("getprospect.email.find")).toBe(true);
    expect(ctx.tools.has("getprospect.email.lookup")).toBe(true);
  });

  describe("getprospect.email.verify", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.email.verify", {
        email: "test@example.com",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("getprospect.email.verify", {
        email: "test@example.com",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { valid: true });
      const result = await ctx.callTool("getprospect.email.verify", {
        email: "test@example.com",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/public/v1/email/verify",
          method: "GET",
          params: { email: "test@example.com" },
        })
      );
    });
  });

  describe("getprospect.email.find", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.email.find", {
        name: "John Doe",
        company: "Acme",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "INSUFFICIENT_CREDITS", "no credits");
      const result = await ctx.callTool("getprospect.email.find", {
        name: "John Doe",
        company: "Acme",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { email: "john@acme.com" });
      const result = await ctx.callTool("getprospect.email.find", {
        name: "John Doe",
        company: "Acme",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/public/v1/email/find",
          method: "GET",
          params: { name: "John Doe", company: "Acme" },
        })
      );
    });
  });

  describe("getprospect.email.lookup", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.email.lookup", {
        email: "john@acme.com",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("getprospect.email.lookup", {
        email: "john@acme.com",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { firstName: "John" });
      const result = await ctx.callTool("getprospect.email.lookup", {
        email: "john@acme.com",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/public/v1/email/lookup",
          params: { email: "john@acme.com" },
        })
      );
    });
  });
});
