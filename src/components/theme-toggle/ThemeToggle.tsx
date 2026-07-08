import classNames from 'classnames';
import { MoonIcon, SunIcon } from '../Icons';
import styles from './ThemeToggle.module.css';

type Props = {
  isChecked: boolean;
  handleChange: () => void;
  theme: string;
  className?: string;
}

const ThemeToggle = ({ handleChange, isChecked, theme, className }: Props) => {

  return (
    <div className={classNames(styles.toggleContainer, className ?? '')} data-theme={theme}>
      <input id="themeCheck" type="checkbox" className={styles.toggle} checked={isChecked} onChange={handleChange}></input>
      <label htmlFor="themeCheck">{
        theme === 'dark' ?
          <MoonIcon className={styles.toggle__icon} /> :
          <SunIcon className={styles.toggle__icon} />
      }</label>
    </div >
  )
};

export default ThemeToggle;
