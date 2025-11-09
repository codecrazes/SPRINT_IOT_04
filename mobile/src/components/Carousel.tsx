import React, { useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  ImageSourcePropType,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/useTheme';

const { width: screenWidth } = Dimensions.get('window');
const SLIDE_WIDTH = screenWidth * 0.8;
const ITEM_SPACING = 16;

type CarouselItem = {
  id: string;
  title: string;
  subTitle?: string;
  image: ImageSourcePropType;
  description?: string;
};

interface CarouselProps {
  data: CarouselItem[];
}

const Carousel: React.FC<CarouselProps> = ({ data }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CarouselItem | null>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (SLIDE_WIDTH + ITEM_SPACING));
    setActiveIndex(index);
  };

  const openModal = (item: CarouselItem) => {
    setSelected(item);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
  };

  const getDescription = (item?: CarouselItem | null) => {
    if (!item) return '';
    if (item.description) return item.description;
    const sub = item.subTitle ? item.subTitle.toLowerCase() : undefined;
    return t('carousel.autoDescription', {
      title: item.title,
      dashSubTitle: item.subTitle ? ` — ${item.subTitle.toLowerCase()}` : '',
    });
  };

  return (
    <View>
      <FlatList
        data={data}
        horizontal
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width: SLIDE_WIDTH, marginRight: ITEM_SPACING }}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.black,
                  borderRadius: theme.radius.lg,
                  padding: theme.spacing(4),
                },
              ]}
            >
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.colors.white }]}>{item.title}</Text>
                {!!item.subTitle && (
                  <Text style={[styles.cardSubtitle, { color: theme.colors.white }]}>
                    {item.subTitle}
                  </Text>
                )}
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl },
                  ]}
                  onPress={() => openModal(item)}
                >
                  <Text style={{ color: theme.colors.primaryText, fontWeight: '600' }}>
                    {t('common.learnMore')}
                  </Text>
                </TouchableOpacity>
              </View>
              <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>
          </View>
        )}
        decelerationRate="fast"
        snapToInterval={SLIDE_WIDTH + ITEM_SPACING}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: (screenWidth - SLIDE_WIDTH) / 2 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      <View style={[styles.pagination, { marginTop: theme.spacing(5) }]}>
        {data.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              {
                backgroundColor: idx === activeIndex ? theme.colors.primary : theme.colors.dot,
                width: idx === activeIndex ? 25 : 8,
              },
            ]}
          />
        ))}
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderRadius: theme.radius.md,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    padding: theme.spacing(4),
                    width: '85%',
                  },
                ]}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: '700',
                    fontSize: theme.font.lg,
                    marginBottom: theme.spacing(2),
                    textAlign: 'center',
                  }}
                >
                  {selected?.title}
                </Text>
                {!!selected?.subTitle && (
                  <Text
                    style={{
                      color: theme.colors.subtext,
                      fontSize: theme.font.sm,
                      textAlign: 'center',
                      marginBottom: theme.spacing(3),
                    }}
                  >
                    {selected?.subTitle}
                  </Text>
                )}
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: theme.font.base,
                    marginBottom: theme.spacing(4),
                    textAlign: 'center',
                  }}
                >
                  {getDescription(selected)}
                </Text>

                <TouchableOpacity
                  onPress={closeModal}
                  style={{
                    alignSelf: 'center',
                    backgroundColor: theme.colors.primary,
                    paddingVertical: theme.spacing(3),
                    paddingHorizontal: theme.spacing(6),
                    borderRadius: theme.radius.sm,
                  }}
                >
                  <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>
                    {t('common.close')}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12 },
  card: { alignItems: 'center', height: 550, overflow: 'hidden' },
  cardContent: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  cardSubtitle: { fontSize: 14, marginTop: 4 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  dot: { borderRadius: 4, height: 8, marginHorizontal: 4 },
  image: { height: 300, width: '100%' },
  pagination: { flexDirection: 'row', marginLeft: 35 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalCard: { maxWidth: 520 },
});

export default Carousel;
