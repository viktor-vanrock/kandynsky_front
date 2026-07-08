import { useEffect } from 'react';

type Props = {
  off?: boolean;
};

const SettingStand = ({ off }: Props) => {
  useEffect(() => {
    if (off) {
      localStorage.removeItem('demonstration');
    } else {
      localStorage.setItem('demonstration', 'true');
      localStorage.setItem('notframecansee', 'true');
    }

    window.location.replace('/');
  }, [off]);

  return <h1>success</h1>;
};

export default SettingStand;
