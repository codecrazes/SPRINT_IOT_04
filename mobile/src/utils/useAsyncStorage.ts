import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SetValue<T> = (value: T) => Promise<void>;

export function useAsyncStorage<T>(key: string, initialValue: T): [T, SetValue<T>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item) as T);
        }
      } catch (error) {
        console.warn(`AsyncStorage get error for key "${key}":`, error);
      } finally {
        setLoading(false);
      }
    })();
  }, [key]);

  const setValue: SetValue<T> = async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`AsyncStorage set error for key "${key}":`, error);
    }
  };

  return [storedValue, setValue, loading];
}
