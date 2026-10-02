
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
export const getToken = () => sessionStorage.getItem('wba_api_token');
export const setToken = token => token ? sessionStorage.setItem('wba_api_token', token) : sessionStorage.removeItem('wba_api_token');
export const refreshData = () => window.dispatchEvent(new Event('wba-data-changed'));

export async function apiRequest(endpoint, { method = 'GET', body } = {}) {
  const token = getToken();
  const response = await fetch(API_BASE_URL + '/' + endpoint.replace(/^\//, ''), {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      setToken(null);
      window.dispatchEvent(new Event('wba-auth-expired'));
    }
    throw new Error(Object.values(data.errors || {}).flat()[0] || data.message || 'Request failed. Please try again.');
  }
  return data;
}
export const authApi = {
  login: async credentials => {
    const result = await apiRequest('auth/login', { method: 'POST', body: credentials });
    setToken(result.token);
    return result.user;
  },
  me: async () => (await apiRequest('auth/me')).user,
  logout: () => apiRequest('auth/logout', { method: 'POST' }),
};
