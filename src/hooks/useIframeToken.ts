import { useEffect, useState } from 'react';

export function useIframeToken() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('hostToken'));

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.authentication?.token) {
        console.log(':', event.data?.authentication?.token);
        setToken(event.data.authentication.token);
        sessionStorage.setItem('hostToken', event.data.authentication.token);
      }
    }
    window.addEventListener('message', handleMessage);

    const storedHostToken = sessionStorage.getItem('hostToken');
    if (storedHostToken) setToken(storedHostToken);

    function handleStorage(event: StorageEvent) {
      if (event.key === 'hostToken') {
        setToken(event.newValue);
      }
    }
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return token;
}
