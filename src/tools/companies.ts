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

export const registerCompanyTools: Registrar = (server, client) => {
  server.registerTool(
    "list_companies",
    {
      title: "List companies",
      description: "List companies in an account. Companies contain trackers and calls.",
      inputSchema: {
        account_id: listParams.account_id,
        page: listParams.page,
        per_page: listParams.per_page,
        sort: listParams.sort,
        order: listParams.order,
        search: listParams.search,
        status: z.enum(["active", "disabled"]).optional().describe("Filter by status."),
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/companies.json`, { query: listQuery(args) });
    }),
  );

  server.registerTool(
    "get_company",
    {
      title: "Get company",
      description: "Retrieve a single company by id.",
      inputSchema: {
        account_id: listParams.account_id,
        company_id: z.string().describe("The company id."),
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("GET", `/a/${id}/companies/${args.company_id}.json`);
    }),
  );

  server.registerTool(
    "create_company",
    {
      title: "Create company (write)",
      description:
        "WRITE: Create a new company in an account. Requires a name; other fields optional.",
      inputSchema: {
        account_id: listParams.account_id,
        name: z.string().describe("Company name (required)."),
        time_zone: z.string().optional().describe("IANA time zone, e.g. America/New_York."),
        swap_cookie_duration: z
          .number()
          .int()
          .optional()
          .describe("Cookie swap duration in days."),
        callscore_enabled: z.boolean().optional(),
        keyword_spotting_enabled: z.boolean().optional(),
      },
      annotations: write,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, ...body } = args;
      void account_id;
      return client.request("POST", `/a/${id}/companies.json`, { body });
    }),
  );

  server.registerTool(
    "update_company",
    {
      title: "Update company (write)",
      description: "WRITE: Update fields on an existing company.",
      inputSchema: {
        account_id: listParams.account_id,
        company_id: z.string().describe("The company id to update."),
        name: z.string().optional(),
        time_zone: z.string().optional(),
        swap_cookie_duration: z.number().int().optional(),
        callscore_enabled: z.boolean().optional(),
        keyword_spotting_enabled: z.boolean().optional(),
      },
      annotations: write,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, company_id, ...body } = args;
      void account_id;
      return client.request("PUT", `/a/${id}/companies/${company_id}.json`, { body });
    }),
  );

  server.registerTool(
    "delete_company",
    {
      title: "Delete company (destructive)",
      description: "WRITE/DESTRUCTIVE: Permanently delete a company. This cannot be undone.",
      inputSchema: {
        account_id: listParams.account_id,
        company_id: z.string().describe("The company id to delete."),
      },
      annotations: destructive,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      return client.request("DELETE", `/a/${id}/companies/${args.company_id}.json`);
    }),
  );
};
