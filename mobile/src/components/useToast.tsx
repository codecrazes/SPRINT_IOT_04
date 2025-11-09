import { useState, useCallback } from 'react';

export function useToast() {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'info'>('info');

  const show = useCallback((msg: string, t: 'success' | 'error' | 'info' = 'info') => {
    setText(msg);
    setType(t);
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  return { visible, text, type, show, hide };
}
