import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<Record<string, object | undefined>>();

export function navigate(name: string, params?: Record<string, any>) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}
