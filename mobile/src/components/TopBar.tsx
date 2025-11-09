import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme/useTheme';
import { useTranslation } from 'react-i18next';

type Props = {
  search: string;
  onSearch: (v: string) => void;
  viewMode: 'grid' | 'list';
  toggleView: () => void;
};

const TopBar: React.FC<Props> = ({ search, onSearch, viewMode, toggleView }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { padding: theme.spacing(4) }]}>
      <TextInput
        value={search}
        onChangeText={onSearch}
        placeholder={t('topBar.searchPlaceholder')}
        placeholderTextColor={theme.colors.subtext}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
      />
      <TouchableOpacity
        onPress={toggleView}
        style={[styles.toggle, { borderColor: theme.colors.border }]}
      >
        <Text style={{ color: theme.colors.text }}>
          {viewMode === 'grid' ? t('topBar.list') : t('topBar.grid')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 0 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  toggle: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});

export default TopBar;
