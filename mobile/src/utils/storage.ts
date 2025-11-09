import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setItem(key: string, value: unknown) {
  if (value === null || value === undefined) {
    await AsyncStorage.removeItem(key);
    return;
  }
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getItem<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed === null ? null : (parsed as T);
  } catch {
    if (raw.trim() === '' || raw.trim().toLowerCase() === 'null') return null;
    return raw as unknown as T;
  }
}

export async function removeItem(key: string) {
  await AsyncStorage.removeItem(key);
}
