import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallRailClient } from "../client.js";

/** A registrar is given the server + client and wires up its resource's tools. */
export type Registrar = (server: McpServer, client: CallRailClient) => void;

/**
 * Common pagination / sorting / filtering query params shared by most list
 * endpoints. Spread into a tool's input schema as needed.
 */
export const listParams = {
  account_id: z
    .string()
    .optional()
    .describe("CallRail account id. Defaults to CALLRAIL_ACCOUNT_ID if set."),
  page: z.number().int().positive().optional().describe("Page number (default 1)."),
  per_page: z
    .number()
    .int()
    .positive()
    .max(250)
    .optional()
    .describe("Results per page (default 100, max 250)."),
  sort: z.string().optional().describe("Field to sort by (resource-specific)."),
  order: z.enum(["asc", "desc"]).optional().describe("Sort direction."),
  fields: z
    .array(z.string())
    .optional()
    .describe("Optional additional fields to include in each record."),
  search: z.string().optional().describe("Free-text search filter."),
  date_range: z
    .string()
    .optional()
    .describe(
      "Predefined range: recent, today, yesterday, last_7_days, last_30_days, " +
        "this_month, last_month, this_year, last_year, all_time.",
    ),
  start_date: z.string().optional().describe("ISO 8601 start of a custom date range."),
  end_date: z.string().optional().describe("ISO 8601 end of a custom date range."),
} as const;

/** Build a query object from listParams-style args, dropping account_id. */
export function listQuery<T extends Record<string, unknown>>(
  args: T,
): Record<string, unknown> {
  const { account_id, ...rest } = args;
  void account_id;
  return rest;
}

/** Wrap any JSON-serializable value as a successful MCP tool result. */
export function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

/** Wrap a thrown error as an MCP error result (keeps the server alive). */
export function fail(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

/**
 * Wrap an async tool handler so any thrown error becomes an MCP error result
 * instead of crashing the request.
 */
export function handler<A>(fn: (args: A) => Promise<unknown>) {
  return async (args: A) => {
    try {
      return ok(await fn(args));
    } catch (err) {
      return fail(err);
    }
  };
}

/** Annotations for read-only tools. */
export const readOnly = { readOnlyHint: true } as const;
/** Annotations for write (create/update) tools. */
export const write = { readOnlyHint: false, destructiveHint: false } as const;
/** Annotations for destructive (delete) tools. */
export const destructive = { readOnlyHint: false, destructiveHint: true } as const;
