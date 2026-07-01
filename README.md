# @kanopi/callrail-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for the
[CallRail API v3](https://apidocs.callrail.com/). It exposes CallRail's call tracking,
text messaging, form submissions, trackers, companies, tags and more as MCP tools so an
LLM client (Claude Desktop, Claude Code, etc.) can read from and write to your CallRail
account.

- **Transport:** stdio (local)
- **Auth:** CallRail API v3 key via environment variable
- **Coverage:** 34 tools across 11 resources (full read + write)

## Prerequisites

- Node.js 18+ (uses the global `fetch`)
- A CallRail **API v3 key** — in CallRail go to **Settings → Integrations → API Keys →
  Create New API v3 Key**. Keys are user-scoped; the server can only see what that user can.

## Usage

No install needed — run the published package directly with `npx`:

```bash
npx -y @kanopi/callrail-mcp
```

`npx` fetches `@kanopi/callrail-mcp` and runs its `callrail-mcp` binary over stdio. This
is what you point your MCP client at (see [Connecting to a client](#connecting-to-a-client)).

### Build from source (for development)

```bash
git clone <repo-url> && cd call-rail-mcp
npm install
npm run build
```

This compiles TypeScript to `dist/`. The entrypoint is `dist/index.js`.

## Configuration

The server reads credentials from environment variables:

| Variable | Required | Description |
|---|---|---|
| `CALLRAIL_API_KEY` | ✅ | Your CallRail API v3 key. |
| `CALLRAIL_ACCOUNT_ID` | optional | Default account id. When set, tools may omit `account_id`. Find it with the `list_accounts` tool. |
| `CALLRAIL_BASE_URL` | optional | Override the API base URL (default `https://api.callrail.com/v3`). Mainly for testing. |

Copy `.env.example` to `.env` for local reference (the server reads from the process
environment; your MCP client passes these in — see below).

## Connecting to a client

### Claude Code

```bash
claude mcp add callrail \
  --env CALLRAIL_API_KEY=your_api_key_here \
  --env CALLRAIL_ACCOUNT_ID=your_account_id \
  -- npx -y @kanopi/callrail-mcp
```

### Claude Desktop / other clients (JSON config)

Add to the `mcpServers` block of the client's config
(e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "callrail": {
      "command": "npx",
      "args": ["-y", "@kanopi/callrail-mcp"],
      "env": {
        "CALLRAIL_API_KEY": "your_api_key_here",
        "CALLRAIL_ACCOUNT_ID": "your_account_id"
      }
    }
  }
}
```

To run a local checkout instead of the published package, point at the built entrypoint —
`"command": "node", "args": ["/absolute/path/to/call-rail-mcp/dist/index.js"]` — or the
TypeScript source via tsx: `"command": "npx", "args": ["tsx", "/abs/path/src/index.ts"]`.

## Tools

Write tools are prefixed with `WRITE:` in their descriptions and carry MCP annotations
(`readOnlyHint`/`destructiveHint`) so clients can prompt for confirmation. Most tools accept
an optional `account_id` that falls back to `CALLRAIL_ACCOUNT_ID`. List tools share common
params: `page`, `per_page` (max 250), `sort`, `order`, `search`, `date_range`/`start_date`/
`end_date`, and `fields` for optional extra fields.

| Resource | Tools |
|---|---|
| **Accounts** | `list_accounts`, `get_account` |
| **Companies** | `list_companies`, `get_company`, `create_company` ✏️, `update_company` ✏️, `delete_company` 🗑️ |
| **Calls** | `list_calls`, `get_call`, `create_outbound_call` ✏️, `update_call` ✏️, `get_calls_summary`, `get_calls_timeseries` |
| **Trackers** | `list_trackers`, `get_tracker`, `create_tracker` ✏️, `update_tracker` ✏️, `delete_tracker` 🗑️ |
| **Text messages** | `list_conversations`, `get_conversation`, `send_text_message` ✏️ |
| **Form submissions** | `list_form_submissions`, `get_form_submission`, `update_form_submission` ✏️ |
| **Users** | `list_users`, `get_user` |
| **Tags** | `list_tags`, `create_tag` ✏️, `update_tag` ✏️, `delete_tag` 🗑️ |
| **Integrations** | `list_integrations` (per company) |
| **Notifications** | `list_notifications` |
| **Outbound caller IDs** | `list_outbound_caller_ids`, `create_outbound_caller_id` ✏️ |

✏️ = write (create/update) · 🗑️ = destructive (delete)

### Notes & caveats

- **Premium data:** transcription, sentiment, call summaries and highlights require a
  CallRail Premium Conversation Intelligence subscription. Request them via the `fields`
  argument on `get_call` / `list_calls`.
- **SMS compliance:** outbound texts must include opt-out instructions; CallRail enforces this.
- **Rate limits:** ~1,000 requests/hour by default. The server surfaces HTTP 429 (with
  `Retry-After` when provided) as a tool error rather than crashing.
- **Data retention:** communication records are retained ~25 months; older date ranges error.
- **Pagination is manual:** pass `page` to walk results; the server does not auto-page.

## Development

```bash
npm run dev     # run from source with tsx
npm run build   # type-check + emit dist/
npm start       # run the built server
```

## Project layout

```
src/
  index.ts            entrypoint (stdio transport)
  config.ts           env loading + validation
  client.ts           CallRail HTTP client (auth, query, errors, account resolution)
  types.ts            shared types + CallRailApiError
  tools/
    index.ts          registers all tools
    shared.ts         common zod params, response/error helpers, annotations
    <resource>.ts     one file per CallRail resource
```

## License

MIT
