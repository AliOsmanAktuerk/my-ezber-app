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

export type Course = {
  id: number;
  publicCourse: boolean;
  name: string;
  description: string;
};

export type CoursePayload = {
  publicCourse: boolean;
  name: string;
  description: string;
};

export type CourseItem = {
  id: number;
  name: string;
  state: boolean;
  kursId: number;
};

export type CourseItemPayload = {
  name: string;
  state: boolean;
  kursId: number;
};

export type Room = {
  id: number;
  ownerId: number;
  ownerEmail: string;
  description: string;
};

export type RoomPayload = {
  ownerId: number;
  description: string;
};

export type Account = {
  id: number;
  email: string;
  name: string;
  hash: string;
  rolleId: number;
  rolleName: string;
};

export type AccountPayload = {
  email: string;
  password: string;
  rolleId: number;
};

export type Role = {
  id: number;
  name: string;
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

export function getCourses(token: string) {
  return request<Course[]>('/api/courses', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createCourse(token: string, payload: CoursePayload) {
  return request<Course>('/api/courses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateCourse(token: string, id: number, payload: CoursePayload) {
  return request<Course>(`/api/courses/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function getCourseItems(token: string, courseId?: number) {
  const query = courseId ? `?kursId=${courseId}` : '';

  return request<CourseItem[]>(`/api/course-items${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createCourseItem(token: string, payload: CourseItemPayload) {
  return request<CourseItem>('/api/course-items', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateCourseItem(token: string, id: number, payload: CourseItemPayload) {
  return request<CourseItem>(`/api/course-items/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function getRooms(token: string) {
  return request<Room[]>('/api/rooms', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createRoom(token: string, payload: RoomPayload) {
  return request<Room>('/api/rooms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateRoom(token: string, id: number, payload: RoomPayload) {
  return request<Room>(`/api/rooms/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function getAccounts(token: string) {
  return request<Account[]>('/api/accounts', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createAccount(token: string, payload: AccountPayload) {
  return request<Account>('/api/accounts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateAccount(token: string, id: number, payload: AccountPayload) {
  return request<Account>(`/api/accounts/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function getRoles(token: string) {
  return request<Role[]>('/api/roles', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
