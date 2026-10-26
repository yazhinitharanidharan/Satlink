const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
const DEFAULT_TIMEOUT_MS = 15000;
const TOKEN_STORAGE_KEY = 'satlink_access_token';

const getStoredToken = () => {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  } catch {
    return null;
  }
};

const hasHeader = (headers, name) =>
  Object.keys(headers).some((key) => key.toLowerCase() === name.toLowerCase());

const isPlainObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  !(value instanceof FormData) &&
  !(value instanceof URLSearchParams) &&
  !(value instanceof Blob);

class ApiClient {
  constructor(baseURL = API_BASE_URL, { timeout = DEFAULT_TIMEOUT_MS } = {}) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  async request(endpoint, options = {}) {
    const {
      timeout = this.timeout,
      signal: externalSignal,
      headers: optionHeaders = {},
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const controller = new AbortController();
    let timedOut = false;

    const timeoutId = timeout > 0
      ? setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, timeout)
      : null;

    const handleExternalAbort = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener('abort', handleExternalAbort, { once: true });
      }
    }

    const headers = { ...optionHeaders };

    try {
      if (isPlainObject(fetchOptions.body)) {
        fetchOptions.body = JSON.stringify(fetchOptions.body);
        if (!hasHeader(headers, 'Content-Type')) {
          headers['Content-Type'] = 'application/json';
        }
      }

      const token = getStoredToken();
      if (token && !hasHeader(headers, 'Authorization')) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        if (
          response.status === 401 &&
          getStoredToken() &&
          typeof window !== 'undefined'
        ) {
          window.dispatchEvent(new CustomEvent('satlink:unauthorized'));
        }

        const text = await response.text().catch(() => '');
        let errorData = {};

        if (text) {
          try {
            errorData = JSON.parse(text);
          } catch {
            errorData = {};
          }
        }

        let message = errorData.detail || errorData.message || text || `HTTP error! status: ${response.status}`;
        if (Array.isArray(message)) {
          message = message.map((item) => item.msg || String(item)).join('; ');
        } else if (message && typeof message === 'object') {
          message = JSON.stringify(message);
        }

        throw {
          status: response.status,
          message,
          errors: errorData.errors,
        };
      }

      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const text = await response.text();
        if (!text) return null;

        try {
          return JSON.parse(text);
        } catch {
          throw {
            status: response.status,
            message: 'Backend returned an invalid JSON response.',
            isInvalidJson: true,
          };
        }
      }

      return null;
    } catch (error) {
      if (error && error.status) {
        throw error;
      }

      if (timedOut) {
        throw {
          status: 0,
          message: `Request timed out after ${timeout} ms. Please ensure the backend server is running.`,
          isTimeout: true,
          isNetworkError: true,
        };
      }

      if (error && error.name === 'AbortError') {
        throw {
          status: 0,
          message: 'Request was cancelled.',
          isCancelled: true,
          isNetworkError: true,
        };
      }

      throw {
        status: 0,
        message: 'Network error. Please check your connection and ensure the backend server is running.',
        isNetworkError: true,
      };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', handleExternalAbort);
      }
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    ).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', body: data });
  }

  put(endpoint, data) {
    return this.request(endpoint, { method: 'PUT', body: data });
  }

  patch(endpoint, data) {
    return this.request(endpoint, { method: 'PATCH', body: data });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  setAuthToken(token) {
    try {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      return;
    }
  }

  clearAuthToken() {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      return;
    }
  }
}

export const apiClient = new ApiClient();
export { API_BASE_URL };
