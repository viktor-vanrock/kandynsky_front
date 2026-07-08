import { FC, useEffect, useState } from 'react';
import { Frame1, Frame2, Frame3, Frame4 } from './AnimationFrames.tsx';
import { motion } from 'framer-motion';
import styles from './IconsRotator.module.css';

interface IconRotatorProps {
  startWith?: number;
  color?: string;
  mode?: 'loop' | 'pingpong';
}

const frames = [() => <Frame1 />, () => <Frame2 />, () => <Frame3 />, () => <Frame4 />];

export const IconRotator: FC<IconRotatorProps> = ({ startWith = 1, mode = 'loop' }) => {
  const [currentIndex, setCurrentIndex] = useState(startWith - 1);

  useEffect(() => {
    let direction = 1;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (mode === 'loop') {
          return (prev + 1) % frames.length;
        } else if (mode === 'pingpong') {
          if (prev === frames.length - 1) {
            direction = -1;
          } else if (prev === 0) {
            direction = 1;
          }
          return prev + direction;
        }
        return prev;
      });
    }, 350 + 50);

    return () => clearInterval(interval);
  }, [mode]);

  const CurrentFrame = frames[currentIndex];

  return (
    <motion.div
      className={styles.iconRotatorContainer}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{
        type: 'spring',
        mass: 1,
        stiffness: 235.1,
        damping: 34.29,
        duration: 0.35,
      }}
    >
      <CurrentFrame />
    </motion.div>
  );
};

export default IconRotator;
