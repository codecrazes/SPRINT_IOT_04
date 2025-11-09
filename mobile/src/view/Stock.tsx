import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Modal, Animated } from 'react-native';
import { useTheme } from '@theme/useTheme';
import { AuthContext } from '@context/AuthContext';
import { useStocksControl } from '@control/useStocksControl';
import { Stock } from '@model/stock';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import EmptyState from '@components/EmptyState';
import ErrorMessage from '@components/ErrorMessage';
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

export default function Stocks() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { token } = useContext(AuthContext);
  const {
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
  } = useStocksControl(token);
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Stock | null>(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<string>('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const listRef = useRef<FlatList<Stock>>(null);

  useEffect(() => {
    if (error) toast.show(error);
  }, [error]);

  const schema = useMemo(
    () =>
      yup.object({
        name: yup.string().trim().required(t('stocks.errors.nameRequired')),
        quantity: yup
          .number()
          .typeError(t('stocks.errors.quantityNumber'))
          .min(0, t('stocks.errors.quantityMin'))
          .required(t('stocks.errors.quantityRequired')),
        location: yup.string().trim()
      }),
    [t]
  );

  function openCreate() {
    setEditing(null);
    setName('');
    setQuantity('');
    setLocation('');
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(item: Stock) {
    setEditing(item);
    setName(item.name);
    setQuantity(String(item.quantity));
    setLocation(item.location || '');
    setErrors({});
    setModalOpen(true);
  }

  async function submit() {
    try {
      setErrors({});
      const valid = await schema.validate(
        { name, quantity: Number(quantity), location },
        { abortEarly: false }
      );
      if (editing) {
        const res = await editItem(editing.id, valid);
        if (res?.ok) {
          setModalOpen(false);
          toast.show(t('stocks.toast.updated'));
        }
      } else {
        const res = await addItem(valid);
        if (res?.ok) {
          setModalOpen(false);
          toast.show(t('stocks.toast.created'));
          setSearch('');
          requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));
        }
      }
    } catch (err: any) {
      const mapped: Record<string, string> = {};
      err.inner?.forEach((x: any) => {
        if (x.path && !mapped[x.path]) mapped[x.path] = x.message;
      });
      setErrors(mapped);
    }
  }

  const invalidForm =
    !name.trim() ||
    quantity === '' ||
    Number.isNaN(Number(quantity)) ||
    Number(quantity) < 0 ||
    !!errors.name ||
    !!errors.quantity;

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  const isEmpty = filtered.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: theme.spacing(4) }}>
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

      <Text
        style={{
          color: theme.colors.text,
          fontWeight: 'bold',
          fontSize: theme.font.xl,
          marginBottom: theme.spacing(3)
        }}
      >
        {t('stocks.title')}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(3) }}>
        <TextInput
          placeholder={t('stocks.searchPlaceholder')}
          placeholderTextColor={theme.colors.subtext}
          value={search}
          onChangeText={setSearch}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.sm,
            paddingHorizontal: theme.spacing(3),
            paddingVertical: theme.spacing(3),
            backgroundColor: theme.colors.card,
            color: theme.colors.text
          }}
        />
        <TouchableOpacity
          onPress={openCreate}
          disabled={busy}
          style={{
            marginLeft: theme.spacing(2),
            backgroundColor: busy ? theme.colors.border : theme.colors.primary,
            borderRadius: theme.radius.sm,
            padding: theme.spacing(3),
            minHeight: 48,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={{ color: theme.colors.primaryText, fontWeight: '600' }}>
            {t('stocks.newButton')}
          </Text>
        </TouchableOpacity>
      </View>

      {isEmpty ? (
        <EmptyState
          title={t('stocks.emptyTitle')}
          subtitle={t('stocks.emptyHint')}
          actionLabel={t('common.reload')}
          onAction={reload}
          testID="stocks-empty"
        />
      ) : (
        <FlatList
          ref={listRef}
          data={filtered}
          extraData={items}
          keyExtractor={(i) => `${i.id}-${i.quantity}-${i.location ?? ''}`}
          onRefresh={reload}
          refreshing={loading}
          renderItem={({ item }) => (
            <View
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.card,
                padding: theme.spacing(3),
                marginBottom: theme.spacing(2),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <View style={{ flex: 1, paddingRight: theme.spacing(2) }}>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{item.name}</Text>
                <Text style={{ color: theme.colors.subtext }}>
                  {t('stocks.labels.quantity', { qty: item.quantity })}
                </Text>
                {!!item.location && (
                  <Text style={{ color: theme.colors.subtext }}>
                    {t('stocks.labels.location', { location: item.location })}
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => openEdit(item)}
                  disabled={busy}
                  style={{ marginRight: theme.spacing(2), minHeight: 48, justifyContent: 'center' }}
                >
                  <Text style={{ color: busy ? theme.colors.mutedText : theme.colors.primary, fontWeight: '600' }}>
                    {t('common.edit')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    await removeItem(item.id);
                    toast.show(t('common.removed'));
                  }}
                  disabled={busy}
                  style={{ minHeight: 48, justifyContent: 'center' }}
                >
                  <Text style={{ color: busy ? theme.colors.mutedText : theme.colors.error, fontWeight: '600' }}>
                    {t('common.remove')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal transparent visible={modalOpen} animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.overlay,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <View
            style={{
              width: '85%',
              backgroundColor: theme.colors.card,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: theme.spacing(4)
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: '700',
                fontSize: theme.font.lg,
                marginBottom: theme.spacing(3)
              }}
            >
              {editing ? t('stocks.modal.titleEdit') : t('stocks.modal.titleNew')}
            </Text>

            <TextInput
              placeholder={t('stocks.modal.name')}
              placeholderTextColor={theme.colors.subtext}
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (errors.name) setErrors((e) => {
                  const { name: _, ...rest } = e;
                  return rest;
                });
              }}
              style={{
                borderWidth: 1,
                borderColor: errors.name ? theme.colors.error : theme.colors.border,
                borderRadius: theme.radius.sm,
                padding: theme.spacing(3),
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                marginBottom: theme.spacing(1)
              }}
            />
            <ErrorMessage text={errors.name} />

            <TextInput
              placeholder={t('stocks.modal.quantity')}
              placeholderTextColor={theme.colors.subtext}
              keyboardType="number-pad"
              value={quantity}
              onChangeText={(v) => {
                setQuantity(v);
                if (errors.quantity) setErrors((e) => {
                  const { quantity: _, ...rest } = e;
                  return rest;
                });
              }}
              style={{
                borderWidth: 1,
                borderColor: errors.quantity ? theme.colors.error : theme.colors.border,
                borderRadius: theme.radius.sm,
                padding: theme.spacing(3),
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(1)
              }}
            />
            <ErrorMessage text={errors.quantity} />

            <TextInput
              placeholder={t('stocks.modal.location')}
              placeholderTextColor={theme.colors.subtext}
              value={location}
              onChangeText={setLocation}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.sm,
                padding: theme.spacing(3),
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(4)
              }}
            />

            <TouchableOpacity
              disabled={busy || invalidForm}
              onPress={submit}
              style={{
                alignItems: 'center',
                backgroundColor: busy || invalidForm ? theme.colors.border : theme.colors.primary,
                borderRadius: theme.radius.sm,
                padding: theme.spacing(3),
                minHeight: 48,
                justifyContent: 'center'
              }}
            >
              <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>
                {busy ? t('common.saving') : t('common.save')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalOpen(false)}
              style={{ alignItems: 'center', marginTop: theme.spacing(3), minHeight: 44, justifyContent: 'center' }}
            >
              <Text style={{ color: theme.colors.primary }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Loading visible={busy} />
    </View>
  );
}
