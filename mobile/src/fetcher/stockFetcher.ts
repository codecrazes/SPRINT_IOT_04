import { Stock } from '@model/stock';

import { apiHttp, authHeaders } from './http';

export async function fetchListStocks(token?: string): Promise<Stock[]> {
  const { data } = await apiHttp.get<Stock[]>('/stocks', {
    headers: authHeaders(token),
  });
  return data;
}

export async function fetchCreateStock(
  token: string | undefined,
  input: Omit<Stock, 'id'>,
): Promise<Stock> {
  const { data } = await apiHttp.post<Stock>('/stocks', input, {
    headers: authHeaders(token),
  });
  return data;
}

export async function fetchUpdateStock(
  token: string | undefined,
  id: string,
  changes: Omit<Stock, 'id'>,
): Promise<Stock> {
  const { data } = await apiHttp.put<Stock>(`/stocks/${id}`, changes, {
    headers: authHeaders(token),
  });
  return data;
}

export async function fetchDeleteStock(token: string | undefined, id: string): Promise<void> {
  await apiHttp.delete(`/stocks/${id}`, { headers: authHeaders(token) });
}
