const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000'

export async function apiRequest(path, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }
  )

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`
    )
  }

  return response.json()
}

export const api = {
  dashboard: () =>
    apiRequest('/api/dashboard'),

  transactions: (params = {}) => {
    const query =
      new URLSearchParams(params).toString()

    return apiRequest(
      `/api/transactions${
        query ? `?${query}` : ''
      }`
    )
  },

  transaction: (id) =>
    apiRequest(`/api/transactions/${id}`),

  customers: (params = {}) => {
    const query =
      new URLSearchParams(params).toString()

    return apiRequest(
      `/api/customers${
        query ? `?${query}` : ''
      }`
    )
  },

  recoveries: () =>
    apiRequest('/api/recoveries'),

  analytics: () =>
    apiRequest('/api/analytics'),

  activity: () =>
    apiRequest('/api/agent-activity'),

  settings: () =>
    apiRequest('/api/settings'),

  executeRecovery: (id) =>
    apiRequest(
      `/api/recovery/${id}/execute`,
      {
        method: 'POST'
      }
    ),

  batchRecovery: () =>
    apiRequest(
      '/api/recovery/batch',
      {
        method: 'POST'
      }
    ),

  generateTransactionAI: (id) =>
    apiRequest(
      `/api/transactions/${id}/ai`,
      {
        method: 'POST'
      }
    ),

  processEvent: (payload) =>
    apiRequest(
      '/api/events',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    )
}