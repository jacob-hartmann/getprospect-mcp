import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../getprospect/client-factory.js", () => ({
  getGetProspectClient: vi.fn(),
}));

import { getGetProspectClient } from "../getprospect/client-factory.js";
import { registerListTools } from "./lists.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("List Tools", () => {
  const ctx = createToolTestContext();
  const mock = getGetProspectClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerListTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("getprospect.lists.list")).toBe(true);
    expect(ctx.tools.has("getprospect.lists.create")).toBe(true);
    expect(ctx.tools.has("getprospect.lists.update")).toBe(true);
    expect(ctx.tools.has("getprospect.lists.delete")).toBe(true);
    expect(ctx.tools.has("getprospect.lists.sizes")).toBe(true);
    expect(ctx.tools.has("getprospect.lists.addContacts")).toBe(true);
    expect(ctx.tools.has("getprospect.lists.contacts")).toBe(true);
  });

  describe("getprospect.lists.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.lists.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("getprospect.lists.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with pagination", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { lists: [] });
      const result = await ctx.callTool("getprospect.lists.list", {
        pageSize: 10,
        pageNumber: 2,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/lists",
          method: "GET",
          params: expect.objectContaining({ pageSize: "10", pageNumber: "2" }),
        })
      );
    });

    it("should pass sort and order params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { lists: [] });
      const result = await ctx.callTool("getprospect.lists.list", {
        sort: "name",
        order: "asc",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/lists",
          method: "GET",
          params: expect.objectContaining({ sort: "name", order: "asc" }),
        })
      );
    });
  });

  describe("getprospect.lists.create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.lists.create", {
        name: "My List",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("getprospect.lists.create", {
        name: "My List",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with name", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "list-1" });
      const result = await ctx.callTool("getprospect.lists.create", {
        name: "My List",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/lists",
          method: "POST",
          body: { name: "My List" },
        })
      );
    });
  });

  describe("getprospect.lists.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.lists.update", {
        listId: "list-1",
        name: "New Name",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("getprospect.lists.update", {
        listId: "list-1",
        name: "New Name",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with name", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "list-1" });
      const result = await ctx.callTool("getprospect.lists.update", {
        listId: "list-1",
        name: "New Name",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/lists/list-1",
          method: "PATCH",
          body: { name: "New Name" },
        })
      );
    });
  });

  describe("getprospect.lists.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.lists.delete", {
        listIds: ["list-1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("getprospect.lists.delete", {
        listIds: ["list-1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE with listIds body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("getprospect.lists.delete", {
        listIds: ["list-1", "list-2"],
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/lists",
          method: "DELETE",
          body: { listIds: ["list-1", "list-2"] },
        })
      );
    });
  });

  describe("getprospect.lists.sizes", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.lists.sizes", {
        listIds: ["list-1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("getprospect.lists.sizes", {
        listIds: ["list-1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with listIds", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { sizes: {} });
      const result = await ctx.callTool("getprospect.lists.sizes", {
        listIds: ["list-1"],
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/lists/lists-sizes",
          method: "POST",
          body: { listIds: ["list-1"] },
        })
      );
    });
  });

  describe("getprospect.lists.addContacts", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.lists.addContacts", {
        listId: "list-1",
        contactsIds: ["c-1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("getprospect.lists.addContacts", {
        listId: "list-1",
        contactsIds: ["c-1"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with contactsIds", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { added: true });
      const result = await ctx.callTool("getprospect.lists.addContacts", {
        listId: "list-1",
        contactsIds: ["c-1", "c-2"],
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/lists/list-1/add",
          method: "POST",
          body: { contactsIds: ["c-1", "c-2"] },
        })
      );
    });
  });

  describe("getprospect.lists.contacts", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("getprospect.lists.contacts", {
        listId: "list-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("getprospect.lists.contacts", {
        listId: "list-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send GET with pagination", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { contacts: [] });
      const result = await ctx.callTool("getprospect.lists.contacts", {
        listId: "list-1",
        pageSize: 25,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/lists/list-1/contacts/search",
          method: "GET",
        })
      );
    });

    it("should pass sort and order params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { contacts: [] });
      const result = await ctx.callTool("getprospect.lists.contacts", {
        listId: "list-1",
        sort: "email",
        order: "desc",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/v1/contacts/lists/list-1/contacts/search",
          method: "GET",
          params: expect.objectContaining({ sort: "email", order: "desc" }),
        })
      );
    });
  });
});
