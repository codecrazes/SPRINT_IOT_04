import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthControl } from '@control/useAuthControl';
import { useTheme } from '@theme/useTheme';
import Input from '@components/Input';
import Button from '@components/Button';
import ErrorMessage from '@components/ErrorMessage';
import Loading from '@components/Loading';
import { useTranslation } from 'react-i18next';

function useToast() {
  const [msg, setMsg] = React.useState<string | null>(null);
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

const Register: React.FC = () => {
  const nav = useNavigation<any>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { usuario, erros, erroGeral, loading, onChange, onRegister } = useAuthControl();
  const toast = useToast();

  const canSubmit = !!usuario.email && !!usuario.senha && !erros.email && !erros.senha && !loading;
  React.useEffect(() => {
    if (erroGeral) toast.show(erroGeral);
  }, [erroGeral]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.bg, padding: theme.spacing(4) }]}
    >
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
            padding: theme.spacing(3),
          }}
        >
          <Text style={{ color: theme.colors.text, textAlign: 'center' }}>{toast.msg}</Text>
        </Animated.View>
      )}

      <Text
        style={{
          fontSize: theme.font.h1,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: theme.spacing(6),
          color: theme.colors.text,
        }}
      >
        {t('register.title')}
      </Text>

      <Input
        placeholder={t('register.email')}
        autoCapitalize="none"
        keyboardType="email-address"
        value={usuario.email}
        onChangeText={(tval) => onChange('email', tval)}
        style={{ borderColor: erros.email ? theme.colors.error : theme.colors.border }}
      />
      <ErrorMessage text={erros.email} />

      <View style={{ height: theme.spacing(3) }} />

      <Input
        placeholder={t('register.password')}
        secureTextEntry
        value={usuario.senha}
        onChangeText={(tval) => onChange('senha', tval)}
        style={{ borderColor: erros.senha ? theme.colors.error : theme.colors.border }}
      />
      <ErrorMessage text={erros.senha} />

      <View style={{ height: theme.spacing(6) }} />
      <Button title={t('actions.signUp')} onPress={onRegister} disabled={!canSubmit} />

      <View style={{ height: theme.spacing(4) }} />
      <Text
        onPress={() => nav.navigate('Login')}
        style={{ color: theme.colors.primary, textAlign: 'center' }}
      >
        {t('register.haveAccount')}
      </Text>

      <Loading visible={loading} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, marginTop: 300, marginBottom: 300 } });
export default Register;
