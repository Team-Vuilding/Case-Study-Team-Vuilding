
import { createResponseCache } from './responseCache';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const responses = createResponseCache();
let cacheToken = null;
export const getToken = () => sessionStorage.getItem('wba_api_token');
export const setToken = token => {
  responses.clear();
  cacheToken = token || null;
  if (token) sessionStorage.setItem('wba_api_token', token);
  else sessionStorage.removeItem('wba_api_token');
};
export const refreshData = () => {
  responses.clear();
  window.dispatchEvent(new Event('wba-data-changed'));
};

const canCache = (endpoint, token) => token && !endpoint.startsWith('auth/') && !endpoint.startsWith('items/sku-preview');
const syncCacheSession = token => {
  if (cacheToken !== token) { responses.clear(); cacheToken = token; }
};
export const getCachedApiData = endpoint => {
  if (typeof window === 'undefined') return undefined;
  const token = getToken();
  syncCacheSession(token);
  const path = endpoint.replace(/^\//, '');
  return canCache(path, token) ? responses.peek(path) : undefined;
};

export async function apiRequest(endpoint, { method = 'GET', body, cache = 'default' } = {}) {
  const token = getToken();
  syncCacheSession(token);
  const path = endpoint.replace(/^\//, '');
  method = method.toUpperCase();
  if (method !== 'GET') responses.clear();
  const request = async () => {
    const response = await fetch(API_BASE_URL + '/' + path, {
      method,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 && token === getToken()) {
        setToken(null);
        window.dispatchEvent(new Event('wba-auth-expired'));
      }
      const message = Object.values(data.errors || {}).flat()[0] || data.message || 'Request failed. Please try again.';
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    if (method !== 'GET') responses.clear();
    return data;
  };
  return method === 'GET' && canCache(path, token) ? responses.load(path, request, cache === 'reload') : request();
}

export const authApi = {
  login: async credentials => {
    const result = await apiRequest('auth/login', { method: 'POST', body: credentials });
    setToken(result.token);
    return result.user;
  },
  reactivate: async credentials => {
    const result = await apiRequest('auth/reactivate', { method: 'POST', body: credentials });
    setToken(result.token);
    return result;
  },
  deactivate: async password => {
    return await apiRequest('auth/deactivate', { method: 'POST', body: { password } });
  },
  me: async () => (await apiRequest('auth/me')).user,
  logout: () => apiRequest('auth/logout', { method: 'POST' }),
};
