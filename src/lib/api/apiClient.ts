const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://project-tracker-backend-d85g.onrender.com/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...restOptions } = options;

  const headers = new Headers(customHeaders);
  if (!headers.has('Content-Type') && !(restOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${BASE_URL}/${path.replace(/^\//, '')}`, {
      ...restOptions,
      headers,
    });

    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'An error occurred during request execution');
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Network error occurred');
  }
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'GET' });
  },
  post<T>(path: string, body: any, options?: RequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  put<T>(path: string, body: any, options?: RequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
};
