import { z } from "zod";
import {
  handler,
  listParams,
  listQuery,
  readOnly,
  write,
  type Registrar,
} from "./shared.js";

export const registerFormSubmissionTools: Registrar = (server, client) => {
  server.registerTool(
    "list_form_submissions",
    {
      title: "List form submissions",
      description: "List form submissions captured in an account.",
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
      return client.request("GET", `/a/${id}/form_submissions.json`, {
        query: listQuery(args),
      });
    }),
  );

  server.registerTool(
    "get_form_submission",
    {
      title: "Get form submission",
      description: "Retrieve a single form submission by id.",
      inputSchema: {
        account_id: listParams.account_id,
        form_submission_id: z.string().describe("The form submission id."),
        fields: listParams.fields,
      },
      annotations: readOnly,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, form_submission_id, ...query } = args;
      void account_id;
      return client.request("GET", `/a/${id}/form_submissions/${form_submission_id}.json`, {
        query,
      });
    }),
  );

  server.registerTool(
    "update_form_submission",
    {
      title: "Update form submission (write)",
      description:
        "WRITE: Update a form submission's notes, tags, lead status, value, or spam flag.",
      inputSchema: {
        account_id: listParams.account_id,
        form_submission_id: z.string().describe("The form submission id to update."),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional(),
        lead_status: z.enum(["good_lead", "not_a_lead"]).optional(),
        value: z.string().optional(),
        spam: z.boolean().optional(),
        append_tags: z.boolean().optional(),
      },
      annotations: write,
    },
    handler(async (args) => {
      const id = client.resolveAccountId(args.account_id);
      const { account_id, form_submission_id, ...body } = args;
      void account_id;
      return client.request("PUT", `/a/${id}/form_submissions/${form_submission_id}.json`, {
        body,
      });
    }),
  );
};
