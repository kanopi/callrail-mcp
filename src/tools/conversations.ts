import { z } from "zod";
import {
  handler,
  listParams,
  listQuery,
  readOnly,
  write,
  type Registrar,
} from "./shared.js";

export const registerConversationTools: Registrar = (server, client) => {
  server.registerTool(
    "list_conversations",
    {
      title: "List text conversations",
      description: "List SMS/MMS text-message conversations in an account.",
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
        company_id: z.string().optional(),
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/conversations.json`, {
        query: listQuery(args),
      });
    }),
  );

  server.registerTool(
    "get_conversation",
    {
      title: "Get text conversation",
      description: "Retrieve a single text conversation, including its messages.",
      inputSchema: {
        account_id: listParams.account_id,
        conversation_id: z.string().describe("The conversation id."),
        fields: listParams.fields,
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, conversation_id, ...query } = args;
      void account_id;
      return client.request("GET", `/a/${id}/conversations/${conversation_id}.json`, {
        query,
      });
    }),
  );

  server.registerTool(
    "send_text_message",
    {
      title: "Send text message (write)",
      description:
        "WRITE: Send an SMS/MMS reply in a conversation. Outbound texts must include " +
        "opt-out instructions per compliance rules. Provide media_url for MMS.",
      inputSchema: {
        account_id: listParams.account_id,
        conversation_id: z.string().describe("The conversation id to reply in."),
        content: z.string().describe("Message text."),
        media_url: z
          .string()
          .optional()
          .describe("Public URL of a media file to attach (MMS)."),
      },
      annotations: write,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, conversation_id, ...body } = args;
      void account_id;
      return client.request(
        "POST",
        `/a/${id}/conversations/${conversation_id}/messages.json`,
        { body },
      );
    }),
  );
};
