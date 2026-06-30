/** HTTP methods used by the CallRail API. */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

/** Options for a single API request. */
export interface RequestOptions {
  /** Query-string parameters. Arrays are joined with commas (CallRail's convention). */
  query?: Record<string, unknown>;
  /** JSON request body for POST/PUT. */
  body?: unknown;
}

/**
 * Error thrown when the CallRail API returns a non-2xx status. Carries the HTTP
 * status and the parsed response body so the tool layer can surface details.
 */
export class CallRailApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    public readonly retryAfter?: string,
  ) {
    super(CallRailApiError.formatMessage(status, statusText, body, retryAfter));
    this.name = "CallRailApiError";
  }

  private static formatMessage(
    status: number,
    statusText: string,
    body: unknown,
    retryAfter?: string,
  ): string {
    let detail: string;
    if (typeof body === "string") {
      detail = body;
    } else if (body && typeof body === "object") {
      detail = JSON.stringify(body);
    } else {
      detail = statusText;
    }

    let msg = `CallRail API error ${status} ${statusText}: ${detail}`;
    if (status === 429) {
      msg += retryAfter
        ? ` (rate limited; retry after ${retryAfter}s)`
        : " (rate limited)";
    }
    if (status === 401) {
      msg += " — check that CALLRAIL_API_KEY is a valid API v3 key.";
    }
    return msg;
  }
}
