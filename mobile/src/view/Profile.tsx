import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@theme/useTheme';
import ThemeToggle from '@theme/ThemeToggle';
import Button from '@components/Button';
import { AuthContext } from '@context/AuthContext';
import { getProfileService, updateProfileService } from '@service/userService';
import LanguageToggle from '@i18n/LanguageToggle';

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const y = useMemo(() => new Animated.Value(-80), []);
  function show(text: string) {
    setMsg(text);
    Animated.spring(y, { toValue: 20, useNativeDriver: false }).start(() => {
      setTimeout(
        () =>
          Animated.timing(y, { toValue: -80, duration: 200, useNativeDriver: false }).start(() =>
            setMsg(null),
          ),
        1500,
      );
    });
  }
  return { msg, y, show };
}

type CardProps = { children: React.ReactNode; style?: object };

const Card: React.FC<CardProps> = ({ children, style }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  return <View style={[styles.card, style]}>{children}</View>;
};

const Profile: React.FC = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { t } = useTranslation();
  const { token, email: sessionEmail, fecharSessao } = useContext(AuthContext);

  const toast = useToast();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState(sessionEmail || '');
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [logoutVisible, setLogoutVisible] = useState(false);

  async function carregar() {
    if (!token) return;
    setLoading(true);
    const res = await getProfileService(token);
    setLoading(false);
    if (res.ok) {
      setNome(res.nome || '');
      setEmail(res.email);
      setErroGeral(null);
    } else {
      setErroGeral(res.erroGeral || t('profile.errors.load'));
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const salvar = async () => {
    if (!token) return;
    setSaving(true);
    const res = await updateProfileService(token, nome.trim());
    setSaving(false);
    if (res.ok) {
      setErroGeral(null);
      setMode('view');
      toast.show(t('profile.toast.updated'));
    } else {
      setErroGeral(res.erroGeral || t('profile.errors.save'));
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.bg }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const invalidNome = mode === 'edit' && nome.trim().length < 2;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.bg, padding: theme.spacing(4) }]}
    >
      {toast.msg && (
        <Animated.View style={[styles.toast, { top: toast.y }]}>
          <Text style={styles.toastText}>{toast.msg}</Text>
        </Animated.View>
      )}

      <Text style={styles.title}>{t('profile.title')}</Text>

      <Card>
        <Text style={styles.cardHeader}>{t('profile.session.title')}</Text>
        <Text style={styles.subtext}>
          {t('profile.session.loggedEmail', { email: email || '—' })}
        </Text>
        <Button title={t('profile.session.signOut')} onPress={() => setLogoutVisible(true)} />
      </Card>

      <Card style={{ marginTop: theme.spacing(4) }}>
        <Text style={styles.cardHeader}>{t('profile.data.title')}</Text>

        {mode === 'edit' ? (
          <>
            <TextInput
              style={[styles.input, invalidNome ? styles.inputError : undefined]}
              placeholder={t('profile.data.namePlaceholder')}
              placeholderTextColor={theme.colors.subtext}
              value={nome}
              onChangeText={setNome}
            />
            {invalidNome && (
              <Text style={styles.inputErrorText}>{t('profile.data.nameTooShort')}</Text>
            )}
            {!!erroGeral && <Text style={styles.inputErrorText}>{erroGeral}</Text>}
            <Button
              title={saving ? t('common.saving') : t('common.save')}
              onPress={salvar}
              disabled={saving || invalidNome}
            />
            <TouchableOpacity
              style={styles.centered}
              onPress={() => {
                setErroGeral(null);
                setMode('view');
              }}
            >
              <Text style={styles.linkCancel}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>{t('profile.data.nameLabel')}</Text>
            <Text style={styles.value}>{nome || '—'}</Text>
            <Text style={styles.label}>{t('profile.data.emailLabel')}</Text>
            <Text style={styles.value}>{email || '—'}</Text>
            {!!erroGeral && <Text style={styles.errorTop}>{erroGeral}</Text>}
            <Button title={t('profile.data.edit')} onPress={() => setMode('edit')} />
          </>
        )}
      </Card>

      <Card style={{ marginTop: theme.spacing(4) }}>
        <Text style={styles.cardHeader}>{t('profile.language.title')}</Text>
        <LanguageToggle />
      </Card>

      <Card style={{ marginTop: theme.spacing(4) }}>
        <Text style={styles.cardHeader}>{t('profile.appearance.title')}</Text>
        <ThemeToggle />
      </Card>

      <Modal transparent visible={logoutVisible} animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.card, borderRadius: theme.radius.sm },
            ]}
          >
            <Text style={styles.modalText}>{t('profile.session.signOutQuestion')}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setLogoutVisible(false)}>
                <Text style={styles.modalCancel}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setLogoutVisible(false);
                  fecharSessao();
                }}
              >
                <Text style={styles.modalExit}>{t('profile.session.signOut')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const makeStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
    container: { flex: 1 },
    toast: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 10,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing(3),
    },
    toastText: { color: theme.colors.text, textAlign: 'center' },
    title: {
      fontSize: theme.font.h1,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: theme.spacing(6),
      color: theme.colors.text,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing(4),
    },
    cardHeader: { color: theme.colors.text, fontWeight: '600', marginBottom: theme.spacing(2) },
    subtext: { color: theme.colors.subtext, marginBottom: theme.spacing(2) },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      fontSize: theme.font.base,
      height: 50,
      marginBottom: theme.spacing(3),
      paddingHorizontal: theme.spacing(3),
      color: theme.colors.text,
      backgroundColor: theme.colors.card,
    },
    inputError: { borderColor: theme.colors.error },
    inputErrorText: { color: theme.colors.error, marginBottom: theme.spacing(2) },
    centered: { alignItems: 'center', marginTop: theme.spacing(3) },
    linkCancel: { color: theme.colors.primary, fontSize: 16 },
    label: { fontSize: theme.font.base, color: theme.colors.text, fontWeight: '600' },
    value: { fontSize: 18, marginBottom: theme.spacing(2), color: theme.colors.text },
    errorTop: { color: theme.colors.error, marginTop: theme.spacing(2) },
    modalOverlay: { alignItems: 'center', flex: 1, justifyContent: 'center' },
    modalContent: { padding: 16, width: '80%' },
    modalText: { fontSize: 18, marginBottom: 16, textAlign: 'center', color: theme.colors.text },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-around' },
    modalButton: { padding: 12 },
    modalCancel: { color: theme.colors.primary, fontSize: 16 },
    modalExit: { color: theme.colors.error, fontSize: 16 },
  });

export default Profile;
