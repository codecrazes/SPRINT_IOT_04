import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '@theme/useTheme';
import { Stock } from '@model/stock';
import { useTranslation } from 'react-i18next';

type Moto = {
  id: string;
  title: string;
  subTitle: string;
  plate: string;
  image?: any;
  stockId?: string | null;
};
interface Props {
  moto: Moto | null;
  stock?: Stock;
  onClose: () => void;
}

const { width: sw } = Dimensions.get('window');

const MotoDetailModal: React.FC<Props> = ({ moto, stock, onClose }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  if (!moto) return null;

  const onLocate = () => {
    if (!stock) {
      Alert.alert(t('actions.locate'), t('motoDetail.noStock'));
      return;
    }
    const loc = stock.location
      ? `\n${t('motoDetail.stockAddress', { address: stock.location })}`
      : '';
    Alert.alert(
      t('motoDetail.stockTitle'),
      `${t('motoDetail.stockName', { name: stock.name })}${loc}`,
    );
  };

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[
            styles.content,
            {
              width: sw * 0.8,
              backgroundColor: theme.colors.card,
              borderRadius: theme.radius.md,
              padding: theme.spacing(4),
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>{moto.title}</Text>
          <Text style={[styles.sub, { color: theme.colors.text }]}>{moto.subTitle}</Text>
          <Text style={[styles.sub, { color: theme.colors.text }]}>
            {t('motoDetail.plate', { plate: moto.plate })}
          </Text>

          <Image
            source={moto.image}
            style={[
              styles.img,
              { backgroundColor: theme.colors.inputBg, borderRadius: theme.radius.sm },
            ]}
          />

          <TouchableOpacity
            style={[
              styles.locate,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.sm,
                padding: theme.spacing(3),
              },
            ]}
            onPress={onLocate}
          >
            <Text style={{ color: theme.colors.primaryText, fontWeight: 'bold' }}>
              {t('actions.locate')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: theme.spacing(3) }} onPress={onClose}>
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              {t('actions.close')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: { alignItems: 'center', height: 'auto' },
  img: { height: 150, marginVertical: 8, resizeMode: 'contain', width: '100%' },
  locate: {},
  overlay: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  sub: { fontSize: 16, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
});

export default MotoDetailModal;
