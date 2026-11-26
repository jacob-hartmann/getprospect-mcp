# GetProspect MCP Server

[![CI](https://github.com/jacob-hartmann/getprospect-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/jacob-hartmann/getprospect-mcp/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/jacob-hartmann/getprospect-mcp/badge)](https://scorecard.dev/viewer/?uri=github.com/jacob-hartmann/getprospect-mcp)
[![npm version](https://img.shields.io/npm/v/getprospect-mcp.svg)](https://www.npmjs.com/package/getprospect-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for the [GetProspect](https://getprospect.com) lead generation platform. Enables AI assistants like Claude to search for leads, find emails, manage contacts, and interact with your GetProspect CRM.

## Features

- **Email Discovery** — Verify emails, find emails by name + company, lookup contacts by email
- **Lead Search** — Search leads and companies with rich filters (title, seniority, industry, location)
- **Contact Management** — Full CRUD for CRM contacts with property support
- **Company Management** — Full CRUD for CRM companies
- **List Management** — Create, update, delete lists; add contacts to lists; view list sizes and contents
- **LinkedIn Enrichment** — Enrich contacts by LinkedIn URL
- **Workspace Properties** — Browse all custom properties in your workspace
- **Dual Transport** — Supports both stdio and HTTP (StreamableHTTP) transports

## Installation

Requires [Node.js](https://nodejs.org/) 22 or later.

### Using npx (recommended)

```bash
npx getprospect-mcp
```

### Using npm

```bash
npm install -g getprospect-mcp
getprospect-mcp
```

## Configuration

### Environment Variables

| Variable              | Required | Description                                                                   |
| --------------------- | -------- | ----------------------------------------------------------------------------- |
| `GETPROSPECT_API_KEY` | Yes      | API key from [GetProspect settings](https://app.getprospect.com/settings/api) |
| `MCP_TRANSPORT`       | No       | Transport mode: `stdio` (default) or `http`                                   |
| `MCP_SERVER_HOST`     | No       | HTTP server host (default: `127.0.0.1`)                                       |
| `MCP_SERVER_PORT`     | No       | HTTP server port (default: `3000`)                                            |

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "getprospect": {
      "command": "npx",
      "args": ["-y", "getprospect-mcp"],
      "env": {
        "GETPROSPECT_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Tools

| Tool                                | Description                         |
| ----------------------------------- | ----------------------------------- |
| `getprospect.validate`              | Validate API key and connectivity   |
| `getprospect.email.verify`          | Verify email deliverability         |
| `getprospect.email.find`            | Find email by name and company      |
| `getprospect.email.lookup`          | Lookup contact by email address     |
| `getprospect.search.leads`          | Search leads with filters           |
| `getprospect.search.companies`      | Search companies with filters       |
| `getprospect.search.linkedin`       | Enrich contact by LinkedIn URL      |
| `getprospect.search.fast`           | Quick search contacts and companies |
| `getprospect.contacts.search`       | Search CRM contacts                 |
| `getprospect.contacts.get`          | Get a specific contact              |
| `getprospect.contacts.create`       | Create a new contact                |
| `getprospect.contacts.update`       | Update a contact                    |
| `getprospect.contacts.delete`       | Delete a contact                    |
| `getprospect.contacts.addCompanies` | Link companies to a contact         |
| `getprospect.companies.search`      | Search CRM companies                |
| `getprospect.companies.get`         | Get a specific company              |
| `getprospect.companies.create`      | Create a new company                |
| `getprospect.companies.update`      | Update a company                    |
| `getprospect.companies.delete`      | Delete a company                    |
| `getprospect.lists.list`            | List all contact lists              |
| `getprospect.lists.create`          | Create a new list                   |
| `getprospect.lists.update`          | Update a list                       |
| `getprospect.lists.delete`          | Delete lists                        |
| `getprospect.lists.sizes`           | Get contact counts per list         |
| `getprospect.lists.addContacts`     | Add contacts to a list              |
| `getprospect.lists.contacts`        | Get contacts in a list              |
| `getprospect.properties.list`       | List all workspace properties       |

## Resources

| Resource      | URI                                 | Description                 |
| ------------- | ----------------------------------- | --------------------------- |
| Lists         | `getprospect://lists`               | All contact lists           |
| List Contacts | `getprospect://lists/{id}/contacts` | Contacts in a specific list |
| Properties    | `getprospect://properties`          | All workspace properties    |

## Prompts

| Prompt           | Description                            |
| ---------------- | -------------------------------------- |
| `find-leads`     | Guided workflow for searching leads    |
| `enrich-contact` | Guided workflow for contact enrichment |
| `setup-api-key`  | Instructions for configuring API key   |

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode (stdio)
pnpm run dev

# Run in development mode (HTTP)
pnpm run dev:http

# Run checks
pnpm run check

# Build
pnpm run build
```

### Debugging

You can use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to debug the server:

```bash
# Run from source
pnpm inspect

# Run from built output
pnpm inspect:dist
```

`pnpm inspect` loads `.env` automatically via `dotenv` (see `.env.example`).

## Troubleshooting

### Missing API Key

If you see an authentication error, ensure `GETPROSPECT_API_KEY` is set correctly in your environment or MCP client configuration. You can generate a key at [GetProspect API settings](https://app.getprospect.com/settings/api).

### Insufficient Credits

GetProspect operations like lead search and email finding consume credits. If requests fail with a credits error, check your remaining balance in the GetProspect dashboard and upgrade your plan if needed.

### Rate Limiting

The GetProspect API enforces rate limits. If you receive `429` responses, reduce the frequency of requests. The server will return the error details so you can retry after the indicated wait period.

### Debugging with MCP Inspector

If tools are not behaving as expected, use the MCP Inspector to send requests directly and inspect raw responses:

```bash
pnpm inspect
```

This launches an interactive UI where you can call individual tools, view request/response payloads, and diagnose issues.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Security

See [SECURITY.md](./SECURITY.md) for security policy and reporting vulnerabilities.

## Support

This is a community project provided "as is" with **no guaranteed support**. See [SUPPORT.md](./SUPPORT.md) for details.

## License

MIT © Jacob Hartmann
