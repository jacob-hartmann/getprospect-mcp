import { describe, it, expect, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

vi.mock("./validate.js", () => ({ registerValidateTool: vi.fn() }));
vi.mock("./email.js", () => ({ registerEmailTools: vi.fn() }));
vi.mock("./search.js", () => ({ registerSearchTools: vi.fn() }));
vi.mock("./contacts.js", () => ({ registerContactTools: vi.fn() }));
vi.mock("./companies.js", () => ({ registerCompanyTools: vi.fn() }));
vi.mock("./lists.js", () => ({ registerListTools: vi.fn() }));
vi.mock("./properties.js", () => ({ registerPropertyTools: vi.fn() }));

import { registerTools } from "./index.js";
import { registerValidateTool } from "./validate.js";
import { registerEmailTools } from "./email.js";
import { registerSearchTools } from "./search.js";
import { registerContactTools } from "./contacts.js";
import { registerCompanyTools } from "./companies.js";
import { registerListTools } from "./lists.js";
import { registerPropertyTools } from "./properties.js";

describe("registerTools", () => {
  it("should call all registration functions with the server", () => {
    const server = {} as unknown as McpServer;
    registerTools(server);

    expect(registerValidateTool).toHaveBeenCalledWith(server);
    expect(registerEmailTools).toHaveBeenCalledWith(server);
    expect(registerSearchTools).toHaveBeenCalledWith(server);
    expect(registerContactTools).toHaveBeenCalledWith(server);
    expect(registerCompanyTools).toHaveBeenCalledWith(server);
    expect(registerListTools).toHaveBeenCalledWith(server);
    expect(registerPropertyTools).toHaveBeenCalledWith(server);
  });
});
