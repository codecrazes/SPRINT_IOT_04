import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@theme/useTheme';

const LanguageToggle: React.FC = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { i18n } = useTranslation();

  const [current, setCurrent] = useState<string>(i18n.language || 'pt');

  useEffect(() => {
    const handler = (lng: string) => setCurrent(lng);
    i18n.on('languageChanged', handler);
    setCurrent(i18n.language || 'pt');
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, [i18n]);

  async function choose(lang: 'pt' | 'es') {
    if (lang === current) return;
    await AsyncStorage.setItem('appLang', lang);
    await i18n.changeLanguage(lang);
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => choose('pt')}
        style={[
          styles.option,
          current.startsWith('pt') ? styles.optionActive : styles.optionInactive,
        ]}
      >
        <Text
          style={[
            styles.optionText,
            current.startsWith('pt') ? styles.textActive : styles.textInactive,
          ]}
        >
          PT
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => choose('es')}
        style={[
          styles.option,
          current.startsWith('es') ? styles.optionActive : styles.optionInactive,
        ]}
      >
        <Text
          style={[
            styles.optionText,
            current.startsWith('es') ? styles.textActive : styles.textInactive,
          ]}
        >
          ES
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignSelf: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      overflow: 'hidden',
    },
    option: {
      paddingVertical: theme.spacing(2),
      paddingHorizontal: theme.spacing(4),
      minWidth: 84,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionActive: { backgroundColor: theme.colors.primary },
    optionInactive: { backgroundColor: theme.colors.card },
    optionText: { fontWeight: '600' },
    textActive: { color: theme.colors.primaryText },
    textInactive: { color: theme.colors.text },
  });

export default LanguageToggle;
