/**
 * Reads and validates configuration from the environment.
 *
 * Required:  CALLRAIL_API_KEY
 * Optional:  CALLRAIL_ACCOUNT_ID  (default account id used when a tool omits account_id)
 *            CALLRAIL_BASE_URL    (override the API base, mainly for testing)
 */
export interface Config {
  apiKey: string;
  defaultAccountId?: string;
  baseUrl: string;
}

const DEFAULT_BASE_URL = "https://api.callrail.com/v3";

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const apiKey = env.CALLRAIL_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "CALLRAIL_API_KEY is not set. Create an API v3 key in CallRail " +
        "(Settings → Integrations → API Keys) and expose it as CALLRAIL_API_KEY.",
    );
  }

  const defaultAccountId = env.CALLRAIL_ACCOUNT_ID?.trim() || undefined;
  const baseUrl = (env.CALLRAIL_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "");

  return { apiKey, defaultAccountId, baseUrl };
}
