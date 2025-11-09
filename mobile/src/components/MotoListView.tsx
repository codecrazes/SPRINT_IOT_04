import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@theme/useTheme';

type Moto = { id: string; title: string; subTitle: string; plate: string };
interface Props {
  data: Moto[];
  onRemove: (id: string) => void;
}

const MotoListView: React.FC<Props> = ({ data, onRemove }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <FlatList
      data={data}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <View
          style={[
            styles.item,
            { borderBottomColor: theme.colors.border, padding: theme.spacing(3) },
          ]}
        >
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[styles.sub, { color: theme.colors.mutedText }]}>{item.subTitle}</Text>
            <Text style={[styles.sub, { color: theme.colors.mutedText }]}>
              {t('list.plate', { plate: item.plate })}
            </Text>
          </View>

          <TouchableOpacity onPress={() => onRemove(item.id)}>
            <Text style={{ color: theme.colors.error, fontWeight: '600' }}>{t('list.remove')}</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  item: { borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between' },
  sub: { fontSize: 14 },
  title: { fontSize: 16, fontWeight: '600' },
});

export default MotoListView;
