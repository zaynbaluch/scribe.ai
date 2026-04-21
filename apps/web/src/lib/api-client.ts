const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Typed fetch wrapper with JWT auth, auto-refresh, and error handling.
 */
async function apiClient<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  // Only set Content-Type for non-FormData bodies
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  let response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Auto-refresh on 401
  if (response.status === 401 && !skipAuth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      response = await fetch(url, { ...fetchOptions, headers });
    }
  }

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMessage = data.error?.message || `API error: ${response.status}`;
    throw new ApiError(errorMessage, response.status, data.error?.code);
  }

  return data.data as T;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// ─── Token management ───────────────────────────────────────────────────────

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('scribe_access_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('scribe_refresh_token');
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('scribe_access_token', accessToken);
  localStorage.setItem('scribe_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('scribe_access_token');
  localStorage.removeItem('scribe_refresh_token');
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.success && data.data.accessToken) {
      localStorage.setItem('scribe_access_token', data.data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Convenience methods ────────────────────────────────────────────────────

export const api = {
  get: <T = any>(endpoint: string, options?: ApiOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: ApiOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),

  /**
   * Upload a file (multipart/form-data). Does NOT set Content-Type header
   * since the browser needs to set the boundary automatically.
   */
  upload: <T = any>(endpoint: string, formData: FormData, options?: ApiOptions) => {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData as any,
      headers,
    });
  },
};

export default api;
