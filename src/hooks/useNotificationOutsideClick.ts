import { useEffect } from 'react';
import { notification } from 'antd';

export const useNotificationOutsideClick = () => {
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const notices = document.querySelectorAll('.ant-notification-notice');
      if (notices.length === 0) return;

      const target = e.target as Node;
      const clickedInside = Array.from(notices).some((el) => el.contains(target));
      if (!clickedInside) {
        notification.destroy();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);
};
