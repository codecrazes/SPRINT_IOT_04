import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '@theme/useTheme';
import { useTranslation } from 'react-i18next';

export default function ThemeToggle() {
  const { mode, setMode, theme } = useTheme();
  const { t } = useTranslation();

  const label = mode === 'light' ? t('theme.current.light') : t('theme.current.dark');

  return (
    <Pressable
      onPress={() => setMode(mode === 'light' ? 'dark' : 'light')}
      style={{
        paddingVertical: theme.spacing(2),
        paddingHorizontal: theme.spacing(3),
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignSelf: 'center',
        marginTop: theme.spacing(3),
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: theme.font.base }}>
        {t('theme.title')}: {label} ({t('theme.action.toggle')})
      </Text>
    </Pressable>
  );
}
