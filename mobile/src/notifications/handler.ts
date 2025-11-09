import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-modules-core';
import { navigate } from '../navigation/navigationRef';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export function attachNotificationListeners() {
  const receivedListener: Subscription = Notifications.addNotificationReceivedListener(() => {});
  const responseListener: Subscription = Notifications.addNotificationResponseReceivedListener((res) => {
    const data = res.notification.request.content.data as Record<string, any> | undefined;
    const screen = data?.screen as string | undefined;
    const params = (data?.params as Record<string, any>) || undefined;
    if (screen) {
      navigate(screen, params);
    }
  });
  return { receivedListener, responseListener };
}

export function detachNotificationListeners(received: Subscription, response: Subscription) {
  received.remove();
  response.remove();
}
