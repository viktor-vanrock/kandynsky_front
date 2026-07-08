import { useEffect, useState } from 'react';

export function useInIframe() {
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    try {
      setInIframe(window.self !== window.top);
    } catch (e) {
      setInIframe(true);
    }
  }, []);

  return inIframe;
}
