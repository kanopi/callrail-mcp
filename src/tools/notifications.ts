import { handler, listParams, listQuery, readOnly, type Registrar } from "./shared.js";

export const registerNotificationTools: Registrar = (server, client) => {
  server.registerTool(
    "list_notifications",
    {
      title: "List notifications",
      description: "List notification settings configured for the account's users.",
      inputSchema: {
        account_id: listParams.account_id,
        page: listParams.page,
        per_page: listParams.per_page,
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/notifications.json`, {
        query: listQuery(args),
      });
    }),
  );
};
