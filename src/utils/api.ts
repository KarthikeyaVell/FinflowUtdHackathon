import { projectId, publicAnonKey } from './supabase/info';
import { getAccessToken } from './supabase/client';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-355f0d62`;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`API Error (${endpoint}):`, error);
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

// Transactions API
export const transactionsAPI = {
  getAll: () => fetchAPI('/transactions'),
  add: (transaction: { name: string; amount: number; category: string; date?: string }) =>
    fetchAPI('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),
};

// Loans API
export const loansAPI = {
  getAll: () => fetchAPI('/loans'),
  create: (loan: { amount: string; duration: string; purpose: string }) =>
    fetchAPI('/loans', {
      method: 'POST',
      body: JSON.stringify(loan),
    }),
};

// Chat API
export const chatAPI = {
  getHistory: () => fetchAPI('/chat/history'),
  sendMessage: (message: string, apiKey?: string, model?: string) => {
    const body: any = { message };
    if (apiKey) {
      body.apiKey = apiKey;
    }
    if (model) {
      body.model = model;
    }
    return fetchAPI('/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

// Documents API
export const documentsAPI = {
  getAll: () => fetchAPI('/documents'),
  upload: (document: { name: string; size: number }) =>
    fetchAPI('/documents', {
      method: 'POST',
      body: JSON.stringify(document),
    }),
  delete: (id: string) =>
    fetchAPI(`/documents/${id}`, {
      method: 'DELETE',
    }),
};

// Auth API
export const authAPI = {
  signup: (email: string, password: string, name: string) =>
    fetchAPI('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
};
