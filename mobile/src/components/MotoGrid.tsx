import React from 'react';
import { FlatList, TouchableOpacity, Image, Text, StyleSheet, Dimensions } from 'react-native';

import { useTheme } from '@theme/useTheme';
import { Moto } from '@model/moto';

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16 * 2 + 8;
const CARD_SIZE = (screenWidth - HORIZONTAL_PADDING) / 2;

interface Props {
  data: Moto[];
  onSelect: (m: Moto) => void;
}

const MotoGrid: React.FC<Props> = ({ data, onSelect }) => {
  const { theme } = useTheme();
  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(i) => i.id}
      renderItem={({ item, index }) => {
        const isBlackBg = index % 4 === 1 || index % 4 === 2;
        return (
          <TouchableOpacity
            style={[
              styles.card,
              {
                width: CARD_SIZE,
                height: CARD_SIZE,
                backgroundColor: isBlackBg ? theme.colors.black : theme.colors.primary,
                borderRadius: theme.radius.sm,
                padding: theme.spacing(2),
              },
            ]}
            onPress={() => onSelect(item)}
          >
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text
              style={[styles.title, { color: isBlackBg ? theme.colors.white : theme.colors.black }]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        );
      }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
    />
  );
};

const styles = StyleSheet.create({
  card: { alignItems: 'center', justifyContent: 'center', margin: 4 },
  image: { height: '60%', marginBottom: 8, width: '100%' },
  title: { fontWeight: 'bold', textAlign: 'center' },
});

export default MotoGrid;
