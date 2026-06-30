import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallRailClient } from "../client.js";
import { registerAccountTools } from "./accounts.js";
import { registerCompanyTools } from "./companies.js";
import { registerCallTools } from "./calls.js";
import { registerTrackerTools } from "./trackers.js";
import { registerConversationTools } from "./conversations.js";
import { registerFormSubmissionTools } from "./form-submissions.js";
import { registerUserTools } from "./users.js";
import { registerTagTools } from "./tags.js";
import { registerIntegrationTools } from "./integrations.js";
import { registerNotificationTools } from "./notifications.js";
import { registerOutboundCallerIdTools } from "./outbound-caller-ids.js";

/** Register every CallRail tool on the server. */
export function registerAllTools(server: McpServer, client: CallRailClient): void {
  registerAccountTools(server, client);
  registerCompanyTools(server, client);
  registerCallTools(server, client);
  registerTrackerTools(server, client);
  registerConversationTools(server, client);
  registerFormSubmissionTools(server, client);
  registerUserTools(server, client);
  registerTagTools(server, client);
  registerIntegrationTools(server, client);
  registerNotificationTools(server, client);
  registerOutboundCallerIdTools(server, client);
}
