import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Home from '@view/Home';
import Inventory from '@view/Inventory';
import Profile from '@view/Profile';
import Stocks from '@view/Stock';
import About from '@view/About';
import IoT from '@view/IoT'; // 👈 tela IoT (default export)

import homeIcon from '../../assets/home.png';
import homeOutline from '../../assets/home-outline.png';
import compass from '../../assets/compass.png';
import compassOutline from '../../assets/compass-outline.png';
import person from '../../assets/person.png';
import personOutline from '../../assets/person-outline.png';
import Info from '../../assets/info.png';
import InfoOutline from '../../assets/info-outline.png';

export type TabParamList = {
  Home: undefined;
  Inventory: undefined;
  Stocks: undefined;
  IoT: undefined;
  Profile: undefined;
  About: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const ICON_SIZE = 24;

const iconMap: Record<
  Exclude<keyof TabParamList, 'Stocks' | 'IoT'>,
  { focused: ImageSourcePropType; unfocused: ImageSourcePropType }
> = {
  Home: { focused: homeIcon, unfocused: homeOutline },
  Inventory: { focused: compass, unfocused: compassOutline },
  Profile: { focused: person, unfocused: personOutline },
  About: { focused: Info, unfocused: InfoOutline },
};

function renderTabIcon(routeName: keyof TabParamList, focused: boolean, color: string) {
  if (routeName === 'Stocks') {
    return <Ionicons name={focused ? 'cube' : 'cube-outline'} size={ICON_SIZE} color={color} />;
  }

  if (routeName === 'IoT') {
    return (
      <Ionicons
        name={focused ? 'hardware-chip' : 'hardware-chip-outline'}
        size={ICON_SIZE}
        color={color}
      />
    );
  }

  const icon = iconMap[routeName as Exclude<keyof TabParamList, 'Stocks' | 'IoT'>][
    focused ? 'focused' : 'unfocused'
  ];

  return (
    <Image
      source={icon}
      style={{ width: ICON_SIZE, height: ICON_SIZE }}
      resizeMode="contain"
    />
  );
}

export default function BottomTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#4FAC45', height: 70 },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#000000',
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, color }) => renderTabIcon(route.name, focused, color),
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ tabBarLabel: t('tabs.home'), title: t('tabs.home') }}
      />
      <Tab.Screen
        name="Inventory"
        component={Inventory}
        options={{ tabBarLabel: t('tabs.inventory'), title: t('tabs.inventory') }}
      />
      <Tab.Screen
        name="Stocks"
        component={Stocks}
        options={{ tabBarLabel: t('tabs.stocks'), title: t('tabs.stocks') }}
      />
      <Tab.Screen
        name="IoT"
        component={IoT}
        options={{ tabBarLabel: 'IoT', title: 'IoT' }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ tabBarLabel: t('tabs.profile'), title: t('tabs.profile') }}
      />
      <Tab.Screen
        name="About"
        component={About}
        options={{ tabBarLabel: t('tabs.about'), title: t('tabs.about') }}
      />
    </Tab.Navigator>
  );
}
