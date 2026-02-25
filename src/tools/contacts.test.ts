import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../getprospect/client-factory.js", () => ({
  getGetProspectClient: vi.fn(),
}));

import { getGetProspectClient } from "../getprospect/client-factory.js";
import { registerContactTools } from "./contacts.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Contact Tools", () => {
  const ctx = createToolTestContext();
  const mock = getGetProspectClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerContactTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("getprospect.contacts.search")).toBe(true);
    expect(ctx.tools.has("getprospect.contacts.get")).toBe(true);
    expect(ctx.tools.has("getprospect.contacts.create")).toBe(true);
    expect(ctx.tools.has("getprospect.contacts.update")).toBe(true);
    expect(ctx.tools.has("getprospect.contacts.delete")).toBe(true);
    expect(ctx.tools.has("getprospect.contacts.addCompanies")).toBe(true);
  });

  describe("getprospect.contacts.search", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.contacts.search", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("getprospect.contacts.search", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with filters and pagination as query params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { contacts: [] });
      const filters = [
        { operator: "is", property: "firstName", value: "John" },
      ];
      const result = await ctx.callTool("getprospect.contacts.search", {
        filters,
        pageSize: 10,
        pageNumber: 1,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/contact/search",
          method: "POST",
          body: { filters },
          params: { pageSize: "10", pageNumber: "1" },
        })
      );
    });
  });

  describe("getprospect.contacts.get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.contacts.get", {
        contactId: "c-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("getprospect.contacts.get", {
        contactId: "c-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "c-1" });
      const result = await ctx.callTool("getprospect.contacts.get", {
        contactId: "c-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/contact/c-1",
          method: "GET",
        })
      );
    });
  });

  describe("getprospect.contacts.create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.contacts.create", {
        properties: [],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("getprospect.contacts.create", {
        properties: [],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with properties", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "c-new" });
      const props = [{ property: "firstName", value: "John" }];
      const result = await ctx.callTool("getprospect.contacts.create", {
        properties: props,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/contact",
          method: "POST",
          body: { properties: props },
        })
      );
    });
  });

  describe("getprospect.contacts.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.contacts.update", {
        contactId: "c-1",
        properties: [],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("getprospect.contacts.update", {
        contactId: "c-1",
        properties: [],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "c-1" });
      const props = [{ property: "firstName", value: "Jane" }];
      const result = await ctx.callTool("getprospect.contacts.update", {
        contactId: "c-1",
        properties: props,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/contact/c-1",
          method: "PATCH",
          body: { properties: props },
        })
      );
    });
  });

  describe("getprospect.contacts.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.contacts.delete", {
        contactId: "c-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("getprospect.contacts.delete", {
        contactId: "c-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("getprospect.contacts.delete", {
        contactId: "c-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/contact/c-1",
          method: "DELETE",
        })
      );
    });
  });

  describe("getprospect.contacts.addCompanies", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.contacts.addCompanies", {
        contactId: "c-1",
        companies: [{ companyId: "co-1" }],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("getprospect.contacts.addCompanies", {
        contactId: "c-1",
        companies: [{ companyId: "co-1" }],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with companies", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { success: true });
      const companies = [{ companyId: "co-1" }, { companyId: "co-2" }];
      const result = await ctx.callTool("getprospect.contacts.addCompanies", {
        contactId: "c-1",
        companies,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/contact/c-1/companies",
          method: "POST",
          body: { companies },
        })
      );
    });
  });
});
