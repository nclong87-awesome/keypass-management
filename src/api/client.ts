import {
  CreateKeyPassRequest,
  KeyPass,
  OAuthTokenResponse,
  SearchResponse,
  UpdateKeyPassRequest,
} from '../types';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const getApiBaseUrl = (overrideUrl?: string): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const baseUrl = overrideUrl?.trim() || envUrl || 'http://localhost:5204';
  return baseUrl.replace(/\/+$/, '');
};

async function parseResponseError(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (data && typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }
      if (data && typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
    }
    const text = await response.text();
    if (text && text.trim()) {
      return text.trim();
    }
  } catch {
    // Ignore JSON/text parsing error
  }

  switch (response.status) {
    case 400:
      return 'Bad request. Please check input parameters.';
    case 401:
      return 'Unauthorized. Bearer token missing or invalid.';
    case 403:
      return 'Forbidden. You do not have permission to perform this action.';
    case 404:
      return 'Requested resource not found.';
    case 409:
      return 'Conflict. An entry with similar details already exists.';
    case 500:
      return 'Internal server error. Please try again later.';
    default:
      return `Request failed with status ${response.status}.`;
  }
}

export async function searchKeyPassEntries(
  query: string,
  top: number = 5,
  token: string,
  baseUrl?: string,
  signal?: AbortSignal
): Promise<KeyPass[]> {
  if (!query.trim()) {
    return [];
  }

  if (!token) {
    throw new ApiError('Authorization bearer token is required.', 401);
  }

  const base = getApiBaseUrl(baseUrl);
  const params = new URLSearchParams({
    query: query.trim(),
    top: String(top),
  });

  const url = `${base}/api/keypass/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      const errorMsg = await parseResponseError(response);
      throw new ApiError(errorMsg, response.status);
    }

    const data: SearchResponse = await response.json();
    return data.items || [];
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw err;
      }
      throw new ApiError(`Network error: ${err.message}`, 0);
    }
    throw new ApiError('An unexpected network error occurred.', 0);
  }
}

export async function createKeyPassEntry(
  data: CreateKeyPassRequest,
  token: string,
  baseUrl?: string,
  signal?: AbortSignal
): Promise<KeyPass> {
  if (!token) {
    throw new ApiError('Authorization bearer token is required.', 401);
  }

  const base = getApiBaseUrl(baseUrl);
  const url = `${base}/api/keypass`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        group: data.group || '',
        title: data.title,
        username: data.username || '',
        password: data.password || '',
        url: data.url || '',
        notes: data.notes || '',
      }),
      signal,
    });

    if (!response.ok) {
      const errorMsg = await parseResponseError(response);
      throw new ApiError(errorMsg, response.status);
    }

    const result: KeyPass = await response.json();
    return result;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw err;
      }
      throw new ApiError(`Network error: ${err.message}`, 0);
    }
    throw new ApiError('An unexpected network error occurred.', 0);
  }
}

export async function updateKeyPassEntry(
  id: string,
  data: UpdateKeyPassRequest,
  token: string,
  baseUrl?: string,
  signal?: AbortSignal
): Promise<KeyPass> {
  if (!token) {
    throw new ApiError('Authorization bearer token is required.', 401);
  }

  const base = getApiBaseUrl(baseUrl);
  const url = `${base}/api/keypass/${encodeURIComponent(id)}`;

  // Omitted or null fields preserve existing values.
  // Leave password field blank to preserve existing password.
  const payload: Record<string, string> = {};
  if (data.group !== undefined) payload.group = data.group;
  if (data.title !== undefined) payload.title = data.title;
  if (data.username !== undefined) payload.username = data.username;
  if (data.password !== undefined && data.password.trim() !== '') {
    payload.password = data.password;
  }
  if (data.url !== undefined) payload.url = data.url;
  if (data.notes !== undefined) payload.notes = data.notes;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const errorMsg = await parseResponseError(response);
      throw new ApiError(errorMsg, response.status);
    }

    const result: KeyPass = await response.json();
    return result;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw err;
      }
      throw new ApiError(`Network error: ${err.message}`, 0);
    }
    throw new ApiError('An unexpected network error occurred.', 0);
  }
}

export async function deleteKeyPassEntry(
  id: string,
  token: string,
  baseUrl?: string,
  signal?: AbortSignal
): Promise<void> {
  if (!token) {
    throw new ApiError('Authorization bearer token is required.', 401);
  }

  const base = getApiBaseUrl(baseUrl);
  const url = `${base}/api/keypass/${encodeURIComponent(id)}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      const errorMsg = await parseResponseError(response);
      throw new ApiError(errorMsg, response.status);
    }
    // HTTP 204 No Content
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw err;
      }
      throw new ApiError(`Network error: ${err.message}`, 0);
    }
    throw new ApiError('An unexpected network error occurred.', 0);
  }
}

export async function fetchOAuthToken(
  clientId: string,
  clientSecret: string,
  baseUrl?: string,
  signal?: AbortSignal
): Promise<OAuthTokenResponse> {
  const base = getApiBaseUrl(baseUrl);
  const url = `${base}/oauth/token`;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      signal,
    });

    if (!response.ok) {
      const errorMsg = await parseResponseError(response);
      throw new ApiError(errorMsg, response.status);
    }

    const data: OAuthTokenResponse = await response.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw err;
      }
      throw new ApiError(`Network error: ${err.message}`, 0);
    }
    throw new ApiError('Failed to fetch OAuth token.', 0);
  }
}
