import { describe, it, expect, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPrompts } from "./index.js";

type PromptHandler = (args: Record<string, string | undefined>) => any;

interface RegisteredPrompt {
  name: string;
  config: any;
  handler: PromptHandler;
}

function setupPrompts() {
  const prompts: RegisteredPrompt[] = [];

  const server = {
    registerPrompt: vi.fn(
      (name: string, config: any, handler: PromptHandler) => {
        prompts.push({ name, config, handler });
      }
    ),
  } as unknown as McpServer;

  registerPrompts(server);
  return { server, prompts };
}

describe("registerPrompts", () => {
  it("should register all 3 prompts", () => {
    const { server } = setupPrompts();
    expect(server.registerPrompt).toHaveBeenCalledTimes(3);
  });

  describe("find-leads", () => {
    it("should include title and company when provided", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "find-leads")!;

      const result = prompt.handler({ title: "CTO", company: "Acme" });

      const text = result.messages[0].content.text;
      expect(text).toContain("CTO");
      expect(text).toContain("Acme");
      expect(text).toContain("Skip");
    });

    it("should ask for filters when not provided", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "find-leads")!;

      const result = prompt.handler({ title: undefined, company: undefined });

      const text = result.messages[0].content.text;
      expect(text).toContain("getprospect.search.leads");
    });
  });

  describe("enrich-contact", () => {
    it("should include linkedin URL when provided", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "enrich-contact")!;

      const result = prompt.handler({
        linkedin_url: "https://linkedin.com/in/john",
        email: undefined,
      });

      const text = result.messages[0].content.text;
      expect(text).toContain("linkedin.com/in/john");
      expect(text).toContain("getprospect.search.linkedin");
    });

    it("should include email when provided", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "enrich-contact")!;

      const result = prompt.handler({
        linkedin_url: undefined,
        email: "john@example.com",
      });

      const text = result.messages[0].content.text;
      expect(text).toContain("john@example.com");
      expect(text).toContain("getprospect.email.lookup");
    });

    it("should ask for input when neither provided", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "enrich-contact")!;

      const result = prompt.handler({
        linkedin_url: undefined,
        email: undefined,
      });

      const text = result.messages[0].content.text;
      expect(text).toContain("Ask me for a LinkedIn URL or email");
    });
  });

  describe("setup-api-key", () => {
    it("should include setup instructions", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "setup-api-key")!;

      const result = prompt.handler({});

      const text = result.messages[0].content.text;
      expect(text).toContain("GETPROSPECT_API_KEY");
      expect(text).toContain("app.getprospect.com");
      expect(text).toContain("getprospect.validate");
    });
  });
});
