import { z } from "zod";
import {
  destructive,
  handler,
  listParams,
  listQuery,
  readOnly,
  write,
  type Registrar,
} from "./shared.js";

export const registerTrackerTools: Registrar = (server, client) => {
  server.registerTool(
    "list_trackers",
    {
      title: "List trackers",
      description: "List tracking numbers (trackers) in an account.",
      inputSchema: {
        account_id: listParams.account_id,
        page: listParams.page,
        per_page: listParams.per_page,
        sort: listParams.sort,
        order: listParams.order,
        search: listParams.search,
        company_id: z.string().optional().describe("Filter to a single company."),
        status: z.enum(["active", "disabled"]).optional(),
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/trackers.json`, { query: listQuery(args) });
    }),
  );

  server.registerTool(
    "get_tracker",
    {
      title: "Get tracker",
      description: "Retrieve a single tracker by id.",
      inputSchema: {
        account_id: listParams.account_id,
        tracker_id: z.string().describe("The tracker id."),
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/trackers/${args.tracker_id}.json`);
    }),
  );

  server.registerTool(
    "create_tracker",
    {
      title: "Create tracker (write)",
      description:
        "WRITE: Create a tracking number. `type` is source or session; provisions a number " +
        "in the given company. Use a JSON object for source-specific config.",
      inputSchema: {
        account_id: listParams.account_id,
        company_id: z.string().describe("Company to create the tracker in."),
        type: z.enum(["source", "session"]).describe("Tracker type."),
        name: z.string().describe("Tracker name."),
        destination_number: z.string().describe("Number calls forward to."),
        area_code: z.string().optional().describe("Preferred area code for the new number."),
        toll_free: z.boolean().optional(),
        call_flow: z
          .record(z.unknown())
          .optional()
          .describe("Optional call-flow configuration object."),
        source: z
          .record(z.unknown())
          .optional()
          .describe("Source configuration object (for source trackers)."),
        swap_targets: z
          .array(z.string())
          .optional()
          .describe("Phone numbers to swap on the website (for session trackers)."),
      },
      annotations: write,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, ...body } = args;
      void account_id;
      return client.request("POST", `/a/${id}/trackers.json`, { body });
    }),
  );

  server.registerTool(
    "update_tracker",
    {
      title: "Update tracker (write)",
      description: "WRITE: Update fields on an existing tracker.",
      inputSchema: {
        account_id: listParams.account_id,
        tracker_id: z.string().describe("The tracker id to update."),
        name: z.string().optional(),
        destination_number: z.string().optional(),
        call_flow: z.record(z.unknown()).optional(),
        source: z.record(z.unknown()).optional(),
        swap_targets: z.array(z.string()).optional(),
        disabled: z.boolean().optional().describe("Disable/enable the tracker."),
      },
      annotations: write,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, tracker_id, ...body } = args;
      void account_id;
      return client.request("PUT", `/a/${id}/trackers/${tracker_id}.json`, { body });
    }),
  );

  server.registerTool(
    "delete_tracker",
    {
      title: "Delete tracker (destructive)",
      description: "WRITE/DESTRUCTIVE: Permanently delete a tracker. This cannot be undone.",
      inputSchema: {
        account_id: listParams.account_id,
        tracker_id: z.string().describe("The tracker id to delete."),
      },
      annotations: destructive,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("DELETE", `/a/${id}/trackers/${args.tracker_id}.json`);
    }),
  );
};
