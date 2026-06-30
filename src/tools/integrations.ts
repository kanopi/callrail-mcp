import { z } from "zod";
import { handler, listParams, listQuery, readOnly, type Registrar } from "./shared.js";

export const registerIntegrationTools: Registrar = (server, client) => {
  server.registerTool(
    "list_integrations",
    {
      title: "List integrations",
      description: "List third-party integrations configured for a company in an account.",
      inputSchema: {
        account_id: listParams.account_id,
        company_id: z.string().describe("The company id whose integrations to list."),
        page: listParams.page,
        per_page: listParams.per_page,
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, company_id, ...query } = args;
      void account_id;
      return client.request("GET", `/a/${id}/companies/${company_id}/integrations.json`, {
        query,
      });
    }),
  );
};
