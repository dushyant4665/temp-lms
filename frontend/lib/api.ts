export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

type ApiResult<T> = {
  status: number;
  success: boolean;
  data?: T;
  message?: string;
  user?: { id: string; email: string; name?: string | null } | null;
};

export function backendUrl(path: string) {
  return `${BACKEND_URL}${path}`;
}

export async function fetchJson<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  const response = await fetch(backendUrl(path), {
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  });

  const payload = await response.json();
  return {
    status: response.status,
    ...(payload as Omit<ApiResult<T>, 'status'>)
  };
}

export async function fetchJsonWithCookies<T>(
  path: string,
  cookieHeader?: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined)
  };

  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }

  const response = await fetch(backendUrl(path), {
    cache: 'no-store',
    ...init,
    headers
  });

  const payload = await response.json();
  return {
    status: response.status,
    ...(payload as Omit<ApiResult<T>, 'status'>)
  };
}
