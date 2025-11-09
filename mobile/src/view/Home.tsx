import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@theme/useTheme';
import { useAsyncStorage } from '@utils/useAsyncStorage';
import Carousel from '@components/Carousel';
import { useTranslation } from 'react-i18next';

const mottuPop = require('../../assets/mottu-pop.png');
const mottuE = require('../../assets/mottu-e.png');
const mottuSport = require('../../assets/mottu-sport.png');

function capitalizeFirstLetter(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const Home: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [name] = useAsyncStorage<string>('userName', '');

  const mockMotos = [
    { id: '1', title: 'Mottu Pop', subTitle: t('home.models.pop'), image: mottuPop },
    { id: '2', title: 'Mottu E', subTitle: t('home.models.e'), image: mottuE },
    { id: '3', title: 'Mottu Sport', subTitle: t('home.models.sport'), image: mottuSport },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.bg, paddingTop: theme.spacing(10) },
      ]}
    >
      <Text
        style={{
          fontSize: theme.font.h1,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: theme.spacing(12),
          color: theme.colors.text,
        }}
      >
        {t('home.welcome', { name: capitalizeFirstLetter(name) })}
      </Text>
      <Carousel data={mockMotos} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'flex-start' } });
export default Home;
