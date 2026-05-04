const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type AuthResponse = {
  token: string;
  accountHash: string;
  email: string;
  name: string;
};

export type CurrentUser = {
  id: number;
  accountHash: string;
  email: string;
  name: string;
  roles: string[];
};

export type MessageResponse = {
  message: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const rawMessage = await response.text();
    let message = rawMessage;

    try {
      const parsed = JSON.parse(rawMessage) as { message?: string; error?: string };
      message = parsed.message ?? parsed.error ?? rawMessage;
    } catch {
      message = rawMessage;
    }

    throw new Error(message || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export function register(payload: { name: string; email: string; password: string }) {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyEmail(payload: { token: string }) {
  return request<AuthResponse>('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resendVerification(payload: { email: string }) {
  return request<MessageResponse>('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function forgotPassword(payload: { email: string }) {
  return request<MessageResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resetPassword(payload: { token: string; password: string }) {
  return request<MessageResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload: { email: string; password: string }) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function googleLogin(payload: { credential: string }) {
  return request<AuthResponse>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(token: string) {
  return request<CurrentUser>('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
