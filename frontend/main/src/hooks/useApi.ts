/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useApi = () => {
  const request = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };
    return fetch(url, config);
  };

  const get = (endpoint: string) => request(endpoint);
  const post = (endpoint: string, data: any) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  const put = (endpoint: string, data: any) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  const del = (endpoint: string) =>
    request(endpoint, {
      method: 'DELETE',
    });

  return { get, post, put, delete: del };
}; 