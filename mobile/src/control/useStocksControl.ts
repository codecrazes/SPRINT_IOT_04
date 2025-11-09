import { useCallback, useEffect, useMemo, useState } from 'react';
import { Stock } from '@model/stock';
import { createStock, deleteStock, listStocks, updateStock } from '@service/stockService';
import { useNotifications } from '@notifications/NotificationsProvider';
import { notifyNewStock } from '@notifications/pushGateway';

const safe = (v: unknown) => (typeof v === 'string' ? v : '');
const FLAGS = {
  pushEnabled: (process.env.EXPO_PUBLIC_PUSH_ENV || 'dev') !== 'off'
};

export function useStocksControl(token: string | null) {
  const [items, setItems] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { expoPushToken, requestToken } = useNotifications();

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await listStocks(token);
    setLoading(false);
    if (res.ok) {
      setItems(res.data || []);
      setError(null);
    } else {
      setError('erroGeral' in res ? res.erroGeral || 'Erro ao carregar estoques.' : 'Erro ao carregar estoques.');
    }
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const q = safe(search).toLowerCase();
  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const name = safe(i?.name).toLowerCase();
        const loc = safe(i?.location).toLowerCase();
        return name.includes(q) || loc.includes(q);
      }),
    [items, q]
  );

  async function addItem(input: Omit<Stock, 'id'>) {
    if (!token) return;
    setBusy(true);
    const res = await createStock(token, input);
    setBusy(false);
    if (res.ok) {
      setItems((prev) => [res.data, ...(prev || [])]);
      setError(null);
      if (FLAGS.pushEnabled) {
        let to = expoPushToken;
        if (!to) {
          to = await requestToken();
        }
        if (to) {
          await notifyNewStock(to, { id: res.data.id, name: res.data.name });
        }
      }
      return { ok: true as const };
    }
    setError(!res.ok && 'erroGeral' in res ? res.erroGeral || null : null);
    return res;
  }

  async function editItem(id: string, changes: Omit<Stock, 'id'>) {
    if (!token) return;
    setBusy(true);
    const res = await updateStock(token, id, changes);
    setBusy(false);
    if (res.ok) {
      setItems((prev) => (prev || []).map((i) => (i.id === id ? { ...i, ...res.data } : i)));
      setError(null);
      return { ok: true as const };
    }
    setError(!res.ok && 'erroGeral' in res ? res.erroGeral || null : null);
    return res;
  }

  async function removeItem(id: string) {
    if (!token) return;
    const snap = items || [];
    setItems(snap.filter((i) => i.id !== id));
    const res = await deleteStock(token, id);
    if (!res.ok) setItems(snap);
  }

  return {
    items,
    filtered,
    loading,
    busy,
    error,
    search,
    setSearch,
    addItem,
    editItem,
    removeItem,
    reload
  };
}
