/**
 * Centralised API client for the Sinterior backend.
 *
 * - Access token is held in memory (never written to localStorage).
 * - Refresh token lives in an httpOnly cookie managed by the server.
 * - On a 401 the client automatically attempts one token refresh, then
 *   retries the original request. If the refresh also fails the token is
 *   cleared and the caller receives the original error.
 */

const BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ── In-memory token store ─────────────────────────────────────────────────────
let _accessToken: string | null = null;

export const setToken = (token: string | null) => {
  _accessToken = token;
};

export const getToken = () => _accessToken;

/**
 * Fired on `window` when a request returns 401 and the refresh cookie is also
 * expired or missing. Listeners (e.g. AuthGuard in Providers) redirect to /login.
 */
function dispatchUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function apiFetch(
  path: string,
  options: RequestInit = {},
  isRetry = false
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (_accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: "include", // send the httpOnly refresh-token cookie
  });

  if (res.status === 401) {
    // /auth/refresh returning 401 means no valid session — signal and bail
    if (path.includes("/auth/refresh")) {
      return res;
    }

    if (!isRetry) {
      // First 401: try to silently get a new access token via the refresh cookie
      const refreshed = await tryRefresh();
      if (refreshed) {
        return apiFetch(path, options, true);
      }
      // Refresh failed — session is dead, broadcast to the app
      dispatchUnauthorized();
    } else {
      // Still 401 after refresh — session unrecoverable
      dispatchUnauthorized();
    }
  }

  return res;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      _accessToken = null;
      return false;
    }
    const json = await res.json();
    _accessToken = json.data?.accessToken ?? null;
    return !!_accessToken;
  } catch {
    _accessToken = null;
    return false;
  }
}

// ── Typed helpers ─────────────────────────────────────────────────────────────
async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Request failed");
  }
  return json as T;
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await apiFetch(path, { method: "GET" });
  return parseResponse<T>(res);
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown
): Promise<T> {
  const res = await apiFetch(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(res);
}

export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown
): Promise<T> {
  const res = await apiFetch(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(res);
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const res = await apiFetch(path, { method: "DELETE" });
  return parseResponse<T>(res);
}

/** Upload a file via multipart/form-data (skips JSON Content-Type header). */
export async function apiUpload<T = unknown>(
  path: string,
  formData: FormData
): Promise<T> {
  const headers: Record<string, string> = {};
  if (_accessToken) headers["Authorization"] = `Bearer ${_accessToken}`;

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });
  return parseResponse<T>(res);
}
