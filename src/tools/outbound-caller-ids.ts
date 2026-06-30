import { z } from "zod";
import {
  handler,
  listParams,
  listQuery,
  readOnly,
  write,
  type Registrar,
} from "./shared.js";

export const registerOutboundCallerIdTools: Registrar = (server, client) => {
  server.registerTool(
    "list_outbound_caller_ids",
    {
      title: "List outbound caller IDs",
      description: "List verified phone numbers usable as outbound caller IDs.",
      inputSchema: {
        account_id: listParams.account_id,
        page: listParams.page,
        per_page: listParams.per_page,
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/outbound_caller_ids.json`, {
        query: listQuery(args),
      });
    }),
  );

  server.registerTool(
    "create_outbound_caller_id",
    {
      title: "Create outbound caller ID (write)",
      description:
        "WRITE: Register a phone number as an outbound caller ID. CallRail sends a " +
        "verification call/code to the number before it can be used.",
      inputSchema: {
        account_id: listParams.account_id,
        phone_number: z.string().describe("The phone number to verify and register."),
      },
      annotations: write,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, ...body } = args;
      void account_id;
      return client.request("POST", `/a/${id}/outbound_caller_ids.json`, { body });
    }),
  );
};
