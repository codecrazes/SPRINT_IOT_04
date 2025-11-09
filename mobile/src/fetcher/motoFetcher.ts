import { Moto } from '@model/moto';
import { apiHttp, authHeaders } from './http';

export async function fetchListMotos(token?: string): Promise<Moto[]> {
  const { data } = await apiHttp.get<Moto[]>('/motos', {
    headers: authHeaders(token),
  });
  return data;
}

export async function fetchCreateMoto(
  token: string | undefined,
  input: Omit<Moto, 'id' | 'image'>,
): Promise<Moto> {
  const { data } = await apiHttp.post<Moto>('/motos', input, {
    headers: authHeaders(token),
  });
  return data;
}

export async function fetchUpdateMoto(
  token: string | undefined,
  id: string,
  changes: Partial<Omit<Moto, 'id'>>,
): Promise<Moto> {
  const { data } = await apiHttp.put<Moto>(`/motos/${id}`, changes, {
    headers: authHeaders(token),
  });
  return data;
}

export async function fetchDeleteMoto(token: string | undefined, id: string): Promise<void> {
  await apiHttp.delete(`/motos/${id}`, { headers: authHeaders(token) });
}
