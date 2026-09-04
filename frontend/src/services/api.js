const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response.json()
}

export const api = {
  dashboard: () => apiRequest('/api/dashboard'),
  transactions: () => apiRequest('/api/transactions'),
  transaction: (id) => apiRequest(`/api/transactions/${id}`),
  customers: () => apiRequest('/api/customers'),
  recoveries: () => apiRequest('/api/recoveries'),
  analytics: () => apiRequest('/api/analytics'),
  activity: () => apiRequest('/api/agent-activity'),
  processEvent: (payload) => apiRequest('/api/events', { method: 'POST', body: JSON.stringify(payload) }),
}
