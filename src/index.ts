#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { CallRailClient } from "./client.js";
import { registerAllTools } from "./tools/index.js";

async function main(): Promise<void> {
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
