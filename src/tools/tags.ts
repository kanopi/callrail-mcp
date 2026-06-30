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

export const registerTagTools: Registrar = (server, client) => {
  server.registerTool(
    "list_tags",
    {
      title: "List tags",
      description: "List tags defined in an account.",
      inputSchema: {
        account_id: listParams.account_id,
        page: listParams.page,
        per_page: listParams.per_page,
        company_id: z.string().optional().describe("Filter to a single company."),
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/tags.json`, { query: listQuery(args) });
    }),
  );

  server.registerTool(
    "create_tag",
    {
      title: "Create tag (write)",
      description: "WRITE: Create a new tag in an account.",
      inputSchema: {
        account_id: listParams.account_id,
        name: z.string().describe("Tag name (required)."),
        company_id: z.string().optional().describe("Scope the tag to a company."),
        color: z
          .string()
          .optional()
          .describe("Tag color, e.g. gray1, blue1, green1 (CallRail palette)."),
        tag_level: z.enum(["company", "account"]).optional(),
      },
      annotations: write,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, ...body } = args;
      void account_id;
      return client.request("POST", `/a/${id}/tags.json`, { body });
    }),
  );

  server.registerTool(
    "update_tag",
    {
      title: "Update tag (write)",
      description: "WRITE: Update an existing tag's name or color.",
      inputSchema: {
        account_id: listParams.account_id,
        tag_id: z.string().describe("The tag id to update."),
        name: z.string().optional(),
        color: z.string().optional(),
      },
      annotations: write,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, tag_id, ...body } = args;
      void account_id;
      return client.request("PUT", `/a/${id}/tags/${tag_id}.json`, { body });
    }),
  );

  server.registerTool(
    "delete_tag",
    {
      title: "Delete tag (destructive)",
      description: "WRITE/DESTRUCTIVE: Permanently delete a tag. This cannot be undone.",
      inputSchema: {
        account_id: listParams.account_id,
        tag_id: z.string().describe("The tag id to delete."),
      },
      annotations: destructive,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("DELETE", `/a/${id}/tags/${args.tag_id}.json`);
    }),
  );
};
