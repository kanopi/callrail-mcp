import { z } from "zod";
import { handler, listParams, listQuery, readOnly, type Registrar } from "./shared.js";

export const registerAccountTools: Registrar = (server, client) => {
  server.registerTool(
    "list_accounts",
    {
      title: "List accounts",
      description:
        "List all CallRail accounts accessible to the API key. Use this to discover account ids.",
      inputSchema: {
        page: listParams.page,
        per_page: listParams.per_page,
        sort: listParams.sort,
        order: listParams.order,
        company_name: z.string().optional().describe("Filter by account/company name."),
      },
      annotations: readOnly,
    },
    handler(async (args) =>
      client.request("GET", "/a.json", { query: args as Record<string, unknown> }),
    ),
  );

  server.registerTool(
    "get_account",
    {
      title: "Get account",
      description: "Retrieve details for a single CallRail account.",
      inputSchema: {
        account_id: listParams.account_id,
        fields: listParams.fields,
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}.json`, { query: listQuery(args) });
    }),
  );
};
