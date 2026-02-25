import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  loadGetProspectConfig,
  isGetProspectConfigured,
  GetProspectAuthError,
} from "./auth.js";

describe("GetProspect Auth", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("loadGetProspectConfig", () => {
    it("should throw GetProspectAuthError when GETPROSPECT_API_KEY is missing", () => {
      delete process.env["GETPROSPECT_API_KEY"];

      expect(() => loadGetProspectConfig()).toThrow(GetProspectAuthError);
      expect(() => loadGetProspectConfig()).toThrow("GETPROSPECT_API_KEY");
    });

    it("should have correct error code when GETPROSPECT_API_KEY is missing", () => {
      delete process.env["GETPROSPECT_API_KEY"];

      try {
        loadGetProspectConfig();
      } catch (err) {
        expect(err).toBeInstanceOf(GetProspectAuthError);
        expect((err as GetProspectAuthError).code).toBe("NO_API_KEY");
      }
    });

    it("should return config when GETPROSPECT_API_KEY is set", () => {
      process.env["GETPROSPECT_API_KEY"] = "test-key";

      const config = loadGetProspectConfig();

      expect(config.apiKey).toBe("test-key");
      expect(config.baseUrl).toBe("https://api.getprospect.com");
    });

    it("should respect custom GETPROSPECT_API_BASE_URL", () => {
      process.env["GETPROSPECT_API_KEY"] = "test-key";
      process.env["GETPROSPECT_API_BASE_URL"] = "https://custom.api.com";

      const config = loadGetProspectConfig();

      expect(config.baseUrl).toBe("https://custom.api.com");
    });
  });

  describe("isGetProspectConfigured", () => {
    it("should return false when GETPROSPECT_API_KEY is missing", () => {
      delete process.env["GETPROSPECT_API_KEY"];

      expect(isGetProspectConfigured()).toBe(false);
    });

    it("should return true when GETPROSPECT_API_KEY is set", () => {
      process.env["GETPROSPECT_API_KEY"] = "test-key";

      expect(isGetProspectConfigured()).toBe(true);
    });
  });
});
