import { useEffect } from 'react';

const SettingFrameSwitch = () => {
  useEffect(() => {
    // const isSet = localStorage.getItem('notframecansee');
    // if (isSet) {
    // localStorage.removeItem('notframecansee');
    // } else {
    localStorage.setItem('notframecansee', 'true');
    // }

    window.location.replace('/');
  }, []);

  return <h1>success</h1>;
};

export default SettingFrameSwitch;
