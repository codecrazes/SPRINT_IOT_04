import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from './index';

type Props = { children: React.ReactNode };

export default function I18nProvider({ children }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('appLang');
        const device = Localization.getLocales?.()[0]?.languageCode === 'es' ? 'es' : 'pt';
        const initial = stored || device || 'pt';
        if (i18n.language !== initial) {
          await i18n.changeLanguage(initial);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
