import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, RefreshControl, FlatList, Animated, Text } from 'react-native';
import { useTheme } from '@theme/useTheme';
import { AuthContext } from '@context/AuthContext';
import InventoryTopBar from '@components/TopBar';
import CategoryFilter from '@components/CategoryFilter';
import MotoGrid from '@components/MotoGrid';
import MotoListView from '@components/MotoListView';
import AddMotoForm from '@components/AddMotoForm';
import MotoDetailModal from '@components/MotoDetailModal';
import { useInventoryControl } from '@control/useInventoryControl';
import { useStocksControl } from '@control/useStocksControl';
import { Moto } from '@model/moto';
import { Stock } from '@model/stock';
import { useTranslation } from 'react-i18next';
import EmptyState from '@components/EmptyState';
import Loading from '@components/Loading';

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const y = useMemo(() => new Animated.Value(-80), []);
  function show(text: string) {
    setMsg(text);
    Animated.spring(y, { toValue: 20, useNativeDriver: false }).start(() => {
      setTimeout(
        () =>
          Animated.timing(y, { toValue: -80, duration: 200, useNativeDriver: false }).start(() =>
            setMsg(null)
          ),
        1500
      );
    });
  }
  return { msg, y, show };
}

const Inventory: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { token } = useContext(AuthContext);
  const toast = useToast();

  const {
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
    removeItem
  } = useInventoryControl(token);

  const { items: stockItems, reload: reloadStocks } = useStocksControl(token);

  const [selectedMoto, setSelectedMoto] = useState<Moto | null>(null);
  const selectedStock: Stock | undefined = useMemo(
    () => stockItems.find((s) => s.id === selectedMoto?.stockId),
    [stockItems, selectedMoto?.stockId]
  );

  useEffect(() => {
    if (error) {
      toast.show(error);
    }
  }, [error]);

  useEffect(() => {
    reloadStocks();
  }, [reloadStocks]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  const isEmpty = filtered.length === 0;

  const content = (
    <>
      {isEmpty ? (
        <EmptyState
          title={t('inventory.emptyTitle')}
          subtitle={viewMode === 'grid' ? t('inventory.emptyHintGrid') : t('inventory.emptyHintList')}
          actionLabel={t('common.reload')}
          onAction={() => {
            reload();
            reloadStocks();
          }}
          testID="inventory-empty"
        />
      ) : viewMode === 'grid' ? (
        <MotoGrid data={filtered} onSelect={setSelectedMoto} />
      ) : (
        <MotoListView
          data={filtered}
          onRemove={async (id) => {
            await removeItem(id);
            toast.show(t('common.removed'));
          }}
        />
      )}

      {viewMode === 'list' && (
        <AddMotoForm
          busy={busy}
          stockOptions={stockItems.map((s) => ({ id: s.id, name: s.name }))}
          onAdd={async (input) => {
            const res = await addItem(input as any);
            if (res?.ok) toast.show(t('common.ok'));
            return res as any;
          }}
        />
      )}

      <MotoDetailModal
        moto={selectedMoto}
        stock={selectedStock}
        onClose={() => setSelectedMoto(null)}
      />
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {toast.msg && (
        <Animated.View
          style={{
            position: 'absolute',
            top: toast.y,
            left: 16,
            right: 16,
            zIndex: 10,
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.sm,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: theme.spacing(3)
          }}
        >
          <Text style={{ color: theme.colors.text, textAlign: 'center' }}>{toast.msg}</Text>
        </Animated.View>
      )}

      <InventoryTopBar
        search={search}
        onSearch={setSearch}
        viewMode={viewMode}
        toggleView={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
      />
      <CategoryFilter categories={categories} active={category} onChange={setCategory} />

      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={(i) => i.key}
        renderItem={() => content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              reload();
              reloadStocks();
            }}
          />
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <Loading visible={busy} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });
export default Inventory;
