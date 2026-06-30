import { z } from "zod";
import { handler, listParams, listQuery, readOnly, type Registrar } from "./shared.js";

export const registerUserTools: Registrar = (server, client) => {
  server.registerTool(
    "list_users",
    {
      title: "List users",
      description: "List users in an account, with their company associations.",
      inputSchema: {
        account_id: listParams.account_id,
        page: listParams.page,
        per_page: listParams.per_page,
        sort: listParams.sort,
        order: listParams.order,
        search: listParams.search,
        company_id: z.string().optional().describe("Filter to users of a company."),
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/users.json`, { query: listQuery(args) });
    }),
  );

  server.registerTool(
    "get_user",
    {
      title: "Get user",
      description: "Retrieve a single user by id.",
      inputSchema: {
        account_id: listParams.account_id,
        user_id: z.string().describe("The user id."),
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/users/${args.user_id}.json`);
    }),
  );
};
