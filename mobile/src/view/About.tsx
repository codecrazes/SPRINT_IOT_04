import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/useTheme';

function getVersionLabel() {
  const nativeVersion = Application.nativeApplicationVersion ?? '0.0.0';
  const nativeBuild = Application.nativeBuildVersion ?? '-';
  const expoVersion = Constants?.expoConfig?.version ?? '0.0.0';
  const runtime = __DEV__ ? 'development' : 'production';
  return { nativeVersion, nativeBuild, expoVersion, runtime };
}

export default function About({ navigation }: any) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const appName = Application.applicationName ?? Constants?.expoConfig?.name ?? 'App';
  const { nativeVersion, nativeBuild, expoVersion, runtime } = getVersionLabel();
  const gitSha = process.env.EXPO_PUBLIC_GIT_SHA ?? 'unknown';
  const pushEnv = process.env.EXPO_PUBLIC_PUSH_ENV ?? 'unknown';
  const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'unknown';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.bg }]} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('about.title')}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t('about.appName')}</Text>
        <Text style={styles.value}>{appName}</Text>

        <Text style={styles.label}>{t('about.gitSha')}</Text>
        <Text style={styles.value}>{gitSha}</Text>

        <Text style={styles.label}>{t('about.expoVersion')}</Text>
        <Text style={styles.value}>{expoVersion}</Text>

        <Text style={styles.label}>{t('about.nativeVersion')}</Text>
        <Text style={styles.value}>{nativeVersion}</Text>

        <Text style={styles.label}>{t('about.buildNumber')}</Text>
        <Text style={styles.value}>{nativeBuild}</Text>

        <Text style={styles.label}>{t('about.runtime')}</Text>
        <Text style={styles.value}>{runtime}</Text>

        <Text style={styles.label}>{t('about.apiBase')}</Text>
        <Text style={styles.value}>{apiBase}</Text>

        <Text style={styles.label}>{t('about.pushEnv')}</Text>
        <Text style={styles.value}>{pushEnv}</Text>
      </View>

      <Pressable style={styles.button} onPress={() => navigation?.goBack?.()}>
        <Text style={styles.buttonText}>{t('about.close')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: { flex: 1 },
    content: { padding: theme.spacing(4), gap: theme.spacing(4) },
    title: {
      fontSize: theme.font.h1,
      fontWeight: 'bold',
      textAlign: 'center',
      color: theme.colors.text
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing(4),
      gap: theme.spacing(2)
    },
    label: { fontSize: theme.font.sm, color: theme.colors.subtext },
    value: { fontSize: theme.font.base, color: theme.colors.text, fontWeight: '600' },
    button: {
      alignSelf: 'flex-start',
      paddingVertical: theme.spacing(3),
      paddingHorizontal: theme.spacing(4),
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card
    },
    buttonText: { fontSize: theme.font.base, fontWeight: '600', color: theme.colors.text }
  });
