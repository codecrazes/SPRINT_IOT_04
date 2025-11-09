import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

import { useTheme } from '@theme/useTheme';
import logo from '../../assets/logo.png';

const Header: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.black, paddingHorizontal: theme.spacing(4), height: 60 },
      ]}
    >
      <Image source={logo} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  logo: { height: 100, width: 100 },
});

export default Header;
