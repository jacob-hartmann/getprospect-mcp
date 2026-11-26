# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Unreleased

First functional release. The previously published `0.0.0` was a name
placeholder without a `bin` entry, so `npx getprospect-mcp` did not work.

### Added

- MCP server for the [GetProspect](https://getprospect.com) API over stdio
  (default) and Streamable HTTP (`MCP_TRANSPORT=http`).
- 27 tools:
  - Connectivity: `getprospect.validate`
  - Email: `getprospect.email.verify`, `getprospect.email.find`,
    `getprospect.email.lookup`
  - Lead search: `getprospect.search.leads`, `getprospect.search.companies`,
    `getprospect.search.linkedin`, `getprospect.search.fast`
  - Contacts: `getprospect.contacts.search`, `.get`, `.create`, `.update`,
    `.delete`, `.addCompanies`
  - Companies: `getprospect.companies.search`, `.get`, `.create`, `.update`,
    `.delete`
  - Lists: `getprospect.lists.list`, `.create`, `.update`, `.delete`,
    `.sizes`, `.addContacts`, `.contacts`
  - Properties: `getprospect.properties.list`
- Resources: `getprospect://lists`, `getprospect://properties`, and the
  `getprospect://lists/{id}/contacts` template.
- Prompts: `find-leads`, `enrich-contact`, `setup-api-key`.
- HTTP mode hardening: Helmet security headers, CORS restrictions, and rate
  limiting on `/mcp`; binds to `127.0.0.1` by default.

### Dependencies

- `@modelcontextprotocol/sdk` 1.32.2, `zod` 4.6.7, `express` 5.3,
  `express-rate-limit` 8.7, `helmet` 8.3.
- Requires Node.js 22 or later.

[0.1.0]: https://github.com/jacob-hartmann/getprospect-mcp/releases/tag/v0.1.0
