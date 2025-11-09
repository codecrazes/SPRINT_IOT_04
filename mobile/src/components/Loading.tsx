import { Modal, ActivityIndicator, View } from 'react-native';

import { useTheme } from '@theme/useTheme';

export default function Loading({ visible }: { visible: boolean }) {
  const { theme } = useTheme();
  return (
    <Modal visible={visible} transparent>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.overlay,
        }}
      >
        <ActivityIndicator size={60} />
      </View>
    </Modal>
  );
}
