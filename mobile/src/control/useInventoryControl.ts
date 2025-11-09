import { useCallback, useEffect, useMemo, useState } from 'react';
import { Moto } from '@model/moto';
import { createMoto, deleteMoto, listMotos, updateMoto } from '@service/motoService';
import { canonicalCategory } from '@utils/motoCategory';

type ViewMode = 'grid' | 'list';

export function useInventoryControl(token: string | null) {
  const [items, setItems] = useState<Moto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await listMotos(token);
    setLoading(false);
    if (res.ok) {
      setItems(res.data);
      setError(null);
    } else {
      const msg = 'erroGeral' in res ? (res.erroGeral ?? 'Erro ao carregar') : 'Erro ao carregar';
      setError(msg);
    }
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (items || []).forEach((i) => set.add(canonicalCategory(i.subTitle)));
    return ['All', ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const byCat = category === 'All' || canonicalCategory(i.subTitle) === category;
        const q = search.toLowerCase().trim();
        return byCat && (i.title.toLowerCase().includes(q) || i.plate.toLowerCase().includes(q));
      }),
    [items, category, search],
  );

  async function addItem(input: Omit<Moto, 'id' | 'image'>) {
    if (!token) return;
    setBusy(true);
    const res = await createMoto(token, input);
    setBusy(false);
    if (res.ok) {
      setItems((prev) => [res.data, ...prev]);
      setError(null);
      return { ok: true as const };
    } else {
      const msg = 'erroGeral' in res ? (res.erroGeral ?? null) : null;
      setError(msg);
      return res;
    }
  }

  async function removeItem(id: string) {
    if (!token) return;
    const snapshot = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    const res = await deleteMoto(token, id);
    if (!res.ok) {
      setItems(snapshot);
      const msg = 'erroGeral' in res ? (res.erroGeral ?? null) : null;
      setError(msg);
    }
  }

  async function editItem(id: string, changes: Partial<Omit<Moto, 'id'>>) {
    if (!token) return;
    setBusy(true);
    const res = await updateMoto(token, id, changes);
    setBusy(false);
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === id ? res.data : i)));
      setError(null);
      return { ok: true as const };
    } else {
      const msg = 'erroGeral' in res ? (res.erroGeral ?? null) : null;
      setError(msg);
      return res;
    }
  }

  return {
    items,
    filtered,
    categories,
    loading,
    busy,
    error,
    search,
    setSearch,
    category,
    setCategory,
    viewMode,
    setViewMode,
    reload,
    addItem,
    removeItem,
    editItem,
  };
}
