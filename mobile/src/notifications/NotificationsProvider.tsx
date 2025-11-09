import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-modules-core';
import { registerForPushNotificationsAsync, PushRegisterResult } from './register';
import { navigate } from '../navigation/navigationRef';

type Ctx = {
  expoPushToken: string | null;
  permissionStatus: string | null;
  projectId: string | null;
  isDevice: boolean;
  lastError: string | null;
  lastSendResult: string | null;
  requestToken: () => Promise<string | null>;
  setLastSendResult: (v: string | null) => void;
};

const NotificationsContext = createContext<Ctx>({
  expoPushToken: null,
  permissionStatus: null,
  projectId: null,
  isDevice: false,
  lastError: null,
  lastSendResult: null,
  requestToken: async () => null,
  setLastSendResult: () => {}
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

function InnerNotificationsProvider({ children }: { children: React.ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isDevice, setIsDevice] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSendResult, setLastSendResult] = useState<string | null>(null);

  useEffect(() => {
    const rcv: Subscription = Notifications.addNotificationReceivedListener(() => {});
    const rsp: Subscription = Notifications.addNotificationResponseReceivedListener((res) => {
      const data = res.notification.request.content.data as Record<string, any> | undefined;
      const screen = data?.screen as string | undefined;
      const params = (data?.params as Record<string, any>) || undefined;
      if (screen) navigate(screen, params);
    });
    return () => {
      rcv.remove();
      rsp.remove();
    };
  }, []);

  const requestToken = async (): Promise<string | null> => {
    setLastError(null);
    const info: PushRegisterResult = await registerForPushNotificationsAsync();
    setIsDevice(info.isDevice);
    setPermissionStatus(info.permissionStatus || null);
    setProjectId(info.projectId);
    if (info.error) {
      setLastError(info.error);
      setExpoPushToken(null);
      return null;
    }
    setExpoPushToken(info.token);
    return info.token;
  };

  useEffect(() => {
    requestToken();
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      expoPushToken,
      permissionStatus,
      projectId,
      isDevice,
      lastError,
      lastSendResult,
      requestToken,
      setLastSendResult
    }),
    [expoPushToken, permissionStatus, projectId, isDevice, lastError, lastSendResult]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  return <InnerNotificationsProvider>{children}</InnerNotificationsProvider>;
}

export default NotificationsProvider;

export function useNotifications() {
  return useContext(NotificationsContext);
}
