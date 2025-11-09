import { Usuario } from '@model/usuario';
import { authHttp } from './http';

type AuthResponse = {
  idToken: string;
  email: string;
  refreshToken?: string;
  localId?: string;
  displayName?: string;
};

type LookupResponse = {
  users: Array<{
    localId: string;
    email: string;
    displayName?: string;
    photoUrl?: string;
  }>;
};

function withKey(params?: Record<string, unknown>) {
  return { params: { key: process.env.EXPO_PUBLIC_APIKEY, ...(params || {}) } };
}

export async function postLogin(u: Usuario): Promise<AuthResponse> {
  const payload = { email: u.email, password: u.senha, returnSecureToken: true };
  const { data } = await authHttp.post<AuthResponse>(
    '/accounts:signInWithPassword',
    payload,
    withKey(),
  );
  return data;
}

export async function postRegister(u: Usuario): Promise<AuthResponse> {
  const payload = { email: u.email, password: u.senha, returnSecureToken: true };
  const { data } = await authHttp.post<AuthResponse>('/accounts:signUp', payload, withKey());
  return data;
}

export async function lookupProfile(idToken: string): Promise<LookupResponse> {
  const { data } = await authHttp.post<LookupResponse>('/accounts:lookup', { idToken }, withKey());
  return data;
}

type UpdateProfileRes = { displayName?: string };

export async function updateProfile(
  idToken: string,
  displayName: string,
): Promise<UpdateProfileRes> {
  const { data } = await authHttp.post<UpdateProfileRes>(
    '/accounts:update',
    { idToken, displayName, returnSecureToken: false },
    withKey(),
  );
  return data;
}
