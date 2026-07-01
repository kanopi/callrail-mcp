#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { CallRailClient } from "./client.js";
import { registerAllTools } from "./tools/index.js";

/**
 * Best-effort load of a local .env file so running the server directly picks up
 * credentials. MCP clients normally pass env via their config; this is additive
 * and silently skipped if there's no .env or the runtime lacks loadEnvFile.
 */
function loadDotEnv(): void {
  try {
    (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(".env");
  } catch {
    // no .env file present — ignore
  }
}

async function main(): Promise<void> {
  loadDotEnv();
  const config = loadConfig();
  const client = new CallRailClient(config);

  const server = new McpServer({
    name: "call-rail-mcp",
    version: "0.1.0",
  });

  registerAllTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // stdout is reserved for the MCP protocol; log to stderr only.
  console.error("call-rail-mcp server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting call-rail-mcp:", err);
  process.exit(1);
});
