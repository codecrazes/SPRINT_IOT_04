import axios from 'axios';

export const authHttp = axios.create({
  baseURL: 'https://identitytoolkit.googleapis.com/v1',
  timeout: 15000,
});

export const apiHttp = axios.create({
  baseURL: process.env.EXPO_PUBLIC_URL || 'http://0.0.0.0:8000',
  timeout: 15000,
});

export const dbHttp = axios.create({
  baseURL: process.env.EXPO_PUBLIC_DB_URL || '',
  timeout: 15000,
});

export function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function isRTDB() {
  const base = process.env.EXPO_PUBLIC_DB_URL || '';
  return base.includes('firebaseio.com');
}

export function rtdbUrl(path: string, token?: string) {
  const base = (process.env.EXPO_PUBLIC_DB_URL || '').replace(/\/+$/, '');
  const p = path.replace(/^\//, '');
  const auth = token ? `?auth=${encodeURIComponent(token)}` : '';
  return `${base}/${p}.json${auth}`;
}
