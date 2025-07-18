import { useAuth } from '../contexts/AuthContext'

// Use the base API URL as provided in env
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function resolveApiUrl(endpoint: string) {
  // If endpoint starts with /auth, use /api/auth; if /products, use /api/products; else, use base
  if (endpoint.startsWith('/auth') || endpoint.startsWith('/users')) {
    return API_BASE_URL.replace(/\/products$/, '') + endpoint;
  }
  if (endpoint.startsWith('/products') || endpoint.startsWith('/orders') || endpoint.startsWith('/receipts')) {
    // Ensure /products is present
    if (!API_BASE_URL.endsWith('/products')) {
      return API_BASE_URL.replace(/\/$/, '') + '/products' + endpoint;
    }
    return API_BASE_URL + endpoint;
  }
  // fallback
  return API_BASE_URL + endpoint;
}

export const useApi = () => {
  const { token, logout } = useAuth()

  const request = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const url = resolveApiUrl(endpoint)
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      }
    }

    const response = await fetch(url, config)

    if (response.status === 401) {
      logout()
      throw new Error('Unauthorized')
    }

    return response
  }

  const get = (endpoint: string) => request(endpoint)
  
  const post = (endpoint: string, data: any) => 
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  
  const put = (endpoint: string, data: any) => 
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  
  const del = (endpoint: string) => 
    request(endpoint, {
      method: 'DELETE',
    })

  return { get, post, put, delete: del }
} 