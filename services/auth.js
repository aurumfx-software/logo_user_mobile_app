import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from './api';

const API_V1 = `${API_BASE_URL}/api/v1`;

const STORAGE_KEYS = {
  accessToken: 'logo_access_token',
  refreshToken: 'logo_refresh_token',
  user: 'logo_user',
};

async function storageSet(key, value) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function storageGet(key) {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function storageDelete(key) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

function parseError(json, status) {
  if (Array.isArray(json?.detail)) {
    return json.detail.map((d) => (typeof d === 'string' ? d : JSON.stringify(d))).join('\n');
  }
  if (typeof json?.detail === 'string') return json.detail;
  if (Array.isArray(json?.errors)) return json.errors.join('\n');
  return json?.message || `Request failed (${status})`;
}

async function authRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_V1}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok || json?.success === false) {
    throw new Error(parseError(json, res.status));
  }
  return json;
}

export async function getStoredAccessToken() {
  return storageGet(STORAGE_KEYS.accessToken);
}

export async function clearSession() {
  await Promise.all([
    storageDelete(STORAGE_KEYS.accessToken),
    storageDelete(STORAGE_KEYS.refreshToken),
    storageDelete(STORAGE_KEYS.user),
  ]);
}

async function saveSession({ access_token, refresh_token, user }) {
  if (access_token) await storageSet(STORAGE_KEYS.accessToken, access_token);
  if (refresh_token) await storageSet(STORAGE_KEYS.refreshToken, refresh_token);
  if (user) await storageSet(STORAGE_KEYS.user, JSON.stringify(user));
}

export async function login({ email, password }) {
  const json = await authRequest('/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });
  const user = json.user || null;
  await saveSession({
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    user,
  });
  return user;
}

export async function register({ name, email, password, phone }) {
  await authRequest('/auth/register', {
    method: 'POST',
    body: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      ...(phone?.trim() ? { phone: phone.trim() } : {}),
    },
  });
  return login({ email, password });
}

export async function fetchCurrentUser() {
  const token = await getStoredAccessToken();
  if (!token) return null;

  try {
    const user = await authRequest('/auth/me', { token });
    await storageSet(STORAGE_KEYS.user, JSON.stringify(user));
    return user;
  } catch {
    await clearSession();
    return null;
  }
}

export async function getCachedUser() {
  const raw = await storageGet(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
