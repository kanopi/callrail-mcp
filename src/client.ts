import type { Config } from "./config.js";
import { CallRailApiError, type HttpMethod, type RequestOptions } from "./types.js";

/**
 * Thin HTTP client for the CallRail API v3.
 *
 * Responsibilities:
 *  - attach token auth + JSON headers
 *  - build query strings (arrays → comma-joined, the CallRail convention)
 *  - resolve the account id from an argument or the configured default
 *  - parse responses and raise CallRailApiError on non-2xx
 */
export class CallRailClient {
  constructor(private readonly config: Config) {}

  /** Resolve an account id from a tool argument, falling back to the env default. */
  resolveAccountId(accountId?: string): string {
    const id = accountId?.trim() || this.config.defaultAccountId;
    if (!id) {
      throw new Error(
        "No account_id provided and CALLRAIL_ACCOUNT_ID is not set. " +
          "Pass account_id, or call list_accounts to find one and set the env var.",
      );
    }
    return id;
  }

  /**
   * Perform a request against `${baseUrl}${path}`.
   * `path` should start with "/" (e.g. "/a.json" or `/a/${id}/calls.json`).
   */
  async request<T = unknown>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = this.buildUrl(path, options.query);

    const headers: Record<string, string> = {
      Authorization: `Token token="${this.config.apiKey}"`,
      Accept: "application/json",
    };

    const init: RequestInit = { method, headers };
    if (options.body !== undefined && method !== "GET") {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, init);
    return this.parseResponse<T>(response);
  }

  /** Build a full URL, appending defined query params (arrays comma-joined). */
  private buildUrl(path: string, query?: Record<string, unknown>): string {
    const url = new URL(`${this.config.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          if (value.length === 0) continue;
          url.searchParams.set(key, value.map(String).join(","));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  /** Parse a fetch Response, raising CallRailApiError on non-2xx. */
  private async parseResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    let parsed: unknown = undefined;
    if (text.length > 0) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text; // non-JSON body (rare) — keep raw text
      }
    }

    if (!response.ok) {
      const retryAfter = response.headers.get("retry-after") ?? undefined;
      throw new CallRailApiError(
        response.status,
        response.statusText,
        parsed,
        retryAfter,
      );
    }

    // 204 No Content (e.g. DELETE) → return a small success marker.
    if (response.status === 204 || parsed === undefined) {
      return { success: true, status: response.status } as T;
    }
    return parsed as T;
  }
}
