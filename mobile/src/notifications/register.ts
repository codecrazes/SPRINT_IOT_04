import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveProjectId(): string | null {
  const envId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || null;
  const cfgId =
    (Constants?.expoConfig as any)?.extra?.eas?.projectId ||
    (Constants as any)?.easConfig?.projectId ||
    null;
  return envId || cfgId;
}

export type PushRegisterResult = {
  isDevice: boolean;
  permissionStatus: Notifications.PermissionStatus | null;
  projectId: string | null;
  token: string | null;
  error: string | null;
};

export async function registerForPushNotificationsAsync(): Promise<PushRegisterResult> {
  const result: PushRegisterResult = {
    isDevice: Device.isDevice,
    permissionStatus: null,
    projectId: resolveProjectId(),
    token: null,
    error: null
  };
  try {
    if (!result.isDevice) {
      result.error = 'not a physical device';
      return result;
    }
    const current = await Notifications.getPermissionsAsync();
    result.permissionStatus = current.status;
    if (current.status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      result.permissionStatus = req.status;
    }
    if (result.permissionStatus !== 'granted') {
      result.error = 'permission not granted';
      return result;
    }
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX
      });
    }
    if (!result.projectId) {
      result.error = 'missing projectId';
      return result;
    }
    const token = await Notifications.getExpoPushTokenAsync({ projectId: result.projectId });
    result.token = token.data ?? null;
    return result;
  } catch (e: any) {
    result.error = String(e?.message || e);
    return result;
  }
}
