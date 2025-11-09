import React, { useEffect } from 'react';
import { Animated, Text, View } from 'react-native';

import { useTheme } from '@theme/useTheme';

type Props = {
  visible: boolean;
  text: string;
  type?: 'success' | 'error' | 'info';
  onHide?: () => void;
  duration?: number;
};

export default function Toast({ visible, text, type = 'info', onHide, duration = 2200 }: Props) {
  const { theme } = useTheme();
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
      const t = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(
          onHide,
        );
      }, duration);
      return () => clearTimeout(t);
    });
  }, [visible]);

  if (!visible) return null;

  const bg =
    type === 'success'
      ? theme.colors.success
      : type === 'error'
        ? theme.colors.error
        : theme.colors.black;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 32,
        left: 16,
        right: 16,
        alignItems: 'center',
        opacity,
      }}
    >
      <View
        style={{
          backgroundColor: bg,
          paddingVertical: theme.spacing(3),
          paddingHorizontal: theme.spacing(4),
          borderRadius: theme.radius.lg,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text style={{ color: theme.colors.white, fontWeight: '600' }}>{text}</Text>
      </View>
    </Animated.View>
  );
}
