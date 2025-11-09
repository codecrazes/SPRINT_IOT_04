import React from 'react';
import { View, FlatList, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@theme/useTheme';
import { iconMap } from '@utils/iconMap';
import { useTranslation } from 'react-i18next';

interface Props {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

const CategoryFilter: React.FC<Props> = ({ categories, active, onChange }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const cats = categories.filter((c) => c !== 'All');

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: theme.spacing(4), marginBottom: theme.spacing(2) },
      ]}
    >
      <View style={[styles.headerRow, { marginBottom: theme.spacing(2) }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.subtext }]}>
          {t('categories.title')}
        </Text>
        <TouchableOpacity onPress={() => onChange('All')}>
          <Text
            style={[
              styles.allText,
              {
                color: theme.colors.subtext,
                textDecorationLine: active === 'All' ? 'underline' : 'none',
                fontWeight: active === 'All' ? 'bold' : 'normal',
              },
            ]}
          >
            {t('categories.all')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cats}
        horizontal
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 0 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.circle,
              {
                backgroundColor: theme.colors.inputBg,
                borderRadius: 35,
                borderWidth: active === item ? 2 : 0,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => onChange(item)}
          >
            <Image source={iconMap[item as keyof typeof iconMap]} style={styles.icon} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  allText: { fontSize: 16 },
  circle: {
    alignItems: 'center',
    height: 70,
    justifyContent: 'center',
    marginRight: 12,
    width: 70,
  },
  container: {},
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  icon: { height: 40, width: 40 },
});

export default CategoryFilter;
