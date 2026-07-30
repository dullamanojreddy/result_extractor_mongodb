import API_URL from '../config/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  collegeId: string;
  collegeName: string;
}

export async function register(name: string, email: string, password: string, college: string): Promise<{ token: string; user: AuthUser }> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, college })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Registration failed');
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Login failed');
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const token = sessionStorage.getItem('token');
  if (token) {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = sessionStorage.getItem('token');
  if (!token) return null;

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    return null;
  }

  return response.json();
}

export function getToken(): string | null {
  return sessionStorage.getItem('token');
}

export function getStoredUser(): AuthUser | null {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setAuthData(token: string, user: AuthUser): void {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem('token');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}