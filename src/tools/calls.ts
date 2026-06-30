import { z } from "zod";
import {
  handler,
  listParams,
  listQuery,
  readOnly,
  write,
  type Registrar,
} from "./shared.js";

export const registerCallTools: Registrar = (server, client) => {
  server.registerTool(
    "list_calls",
    {
      title: "List calls",
      description:
        "List calls in an account with filtering, sorting, search and field selection.",
      inputSchema: {
        account_id: listParams.account_id,
        page: listParams.page,
        per_page: listParams.per_page,
        sort: listParams.sort,
        order: listParams.order,
        fields: listParams.fields,
        search: listParams.search,
        date_range: listParams.date_range,
        start_date: listParams.start_date,
        end_date: listParams.end_date,
        company_id: z.string().optional().describe("Filter to a single company."),
        tracker_id: z.string().optional().describe("Filter to a single tracker."),
        answered: z.boolean().optional().describe("Filter by answered status."),
        direction: z.enum(["inbound", "outbound"]).optional(),
        tags: z.array(z.string()).optional().describe("Filter by tag names."),
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/calls.json`, { query: listQuery(args) });
    }),
  );

  server.registerTool(
    "get_call",
    {
      title: "Get call",
      description:
        "Retrieve a single call by id, optionally with extra fields (transcription, " +
        "keywords, sentiment, etc — some require Premium Conversation Intelligence).",
      inputSchema: {
        account_id: listParams.account_id,
        call_id: z.string().describe("The call id."),
        fields: listParams.fields,
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, call_id, ...query } = args;
      void account_id;
      return client.request("GET", `/a/${id}/calls/${call_id}.json`, { query });
    }),
  );

  server.registerTool(
    "create_outbound_call",
    {
      title: "Create outbound call (write)",
      description:
        "WRITE: Place an outbound call that connects an agent number to a customer number.",
      inputSchema: {
        account_id: listParams.account_id,
        company_id: z.string().describe("Company placing the call."),
        caller_id: z.string().describe("The tracking/caller-id phone number to dial from."),
        customer_phone_number: z.string().describe("The customer's phone number to call."),
        agent_phone_number: z
          .string()
          .describe("The agent's phone number that rings first."),
        recording_enabled: z.boolean().optional(),
        outbound_greeting_recording_url: z.string().optional(),
        outbound_greeting_text: z.string().optional(),
      },
      annotations: write,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, ...body } = args;
      void account_id;
      return client.request("POST", `/a/${id}/calls.json`, { body });
    }),
  );

  server.registerTool(
    "update_call",
    {
      title: "Update call (write)",
      description:
        "WRITE: Update a call's notes, tags, lead status, customer name, value, or spam flag.",
      inputSchema: {
        account_id: listParams.account_id,
        call_id: z.string().describe("The call id to update."),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional().describe("Tag names (new tags auto-created)."),
        lead_status: z.enum(["good_lead", "not_a_lead"]).optional(),
        customer_name: z.string().optional(),
        value: z.string().optional().describe("Lead value, e.g. \"100.00\"."),
        spam: z.boolean().optional().describe("Flag/unflag the call as spam."),
        append_tags: z
          .boolean()
          .optional()
          .describe("If true, add the given tags instead of replacing."),
      },
      annotations: write,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, call_id, ...body } = args;
      void account_id;
      return client.request("PUT", `/a/${id}/calls/${call_id}.json`, { body });
    }),
  );

  server.registerTool(
    "get_calls_summary",
    {
      title: "Get calls summary",
      description:
        "Summarize call data grouped by a dimension (source, keywords, campaign, " +
        "referrer, landing_page, or company).",
      inputSchema: {
        account_id: listParams.account_id,
        group_by: z
          .enum(["source", "keywords", "campaign", "referrer", "landing_page", "company"])
          .optional(),
        date_range: listParams.date_range,
        start_date: listParams.start_date,
        end_date: listParams.end_date,
        company_id: z.string().optional(),
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/calls/summary.json`, {
        query: listQuery(args),
      });
    }),
  );

  server.registerTool(
    "get_calls_timeseries",
    {
      title: "Get calls timeseries",
      description: "Retrieve call analytics grouped by a time interval.",
      inputSchema: {
        account_id: listParams.account_id,
        group_by: z.enum(["hour", "day", "week", "month", "year"]).optional(),
        date_range: listParams.date_range,
        start_date: listParams.start_date,
        end_date: listParams.end_date,
        company_id: z.string().optional(),
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/calls/timeseries.json`, {
        query: listQuery(args),
      });
    }),
  );
};
