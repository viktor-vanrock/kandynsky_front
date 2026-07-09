import { DefaultModeIcon, GameDevModeIcon, LockedModeIcon, PrintingModeIcon } from "../components/Icons";
import { textWarning, textPositive } from "@salutejs/plasma-themes/tokens";
import type { Translations } from "../context/LocaleContext";

export const SUGGESTIONS_KEYS: (keyof Translations)[] = [
  'coffeeCup',
  'cyberpunkCity',
  'abstractViolin',
  'robotPet',
  'futuristicBike',
  'levitatingLamp',
];

export const getLocalizedSuggestions = (t: Translations): string[] =>
  SUGGESTIONS_KEYS.map((key) => t[key] as string);

const MODE_DEFS = [
  { id: 'standard', labelKey: 'standard' as keyof Translations, tooltipKey: 'standardDesc' as keyof Translations, IconComponent: DefaultModeIcon, iconColor: '#3f81fd' },
  { id: 'gamedev', labelKey: 'gameDev' as keyof Translations, tooltipKey: 'gameDevDesc' as keyof Translations, badge: 'NEW', IconComponent: GameDevModeIcon, iconColor: textWarning },
  { id: '3dprint', labelKey: 'printing3d' as keyof Translations, tooltipKey: 'printing3dDesc' as keyof Translations, badge: 'NEW', IconComponent: PrintingModeIcon, iconColor: textPositive },
  { id: 'cad', labelKey: 'inDevelopment' as keyof Translations, tooltipKey: 'inDevelopment' as keyof Translations, label: 'CAD', IconComponent: LockedModeIcon, badge: 'NEW' },
];

export const getLocalizedModes = (t: Translations) =>
  MODE_DEFS.map((m) => ({
    ...m,
    label: m.id === 'cad' ? 'CAD' : (t[m.labelKey] as string),
    tooltip: m.id === 'cad' ? '' : t[m.tooltipKey] as string,
  }));

export const MODES = getLocalizedModes({
  standard: 'Обычный',
  standardDesc: 'Быстро получить 3D-модель с базовыми настройками',
  gameDev: 'GameDev',
  gameDevDesc: 'Настроить количество полигонов, LOD, топологию и PBR',
  printing3d: '3D-печать',
  printing3dDesc: 'Оптимизировано для печати на 3D-принтерах',
  inDevelopment: 'В разработке',
} as unknown as Translations);

const LOADING_TEXT_KEYS: (keyof Translations)[] = [
  'loadingText1', 'loadingText2', 'loadingText3',
  'loadingText4', 'loadingText5', 'loadingText6', 'loadingText7',
];

export const getLocalizedLoadingTexts = (t: Translations): string[] =>
  LOADING_TEXT_KEYS.map((key) => t[key]);

export const SUPPORT_EMAIL = 'kandinsky3D@sberbank.ru';

export const FEATURE_FLAGS = {
  SHOW_3D_TEMPLATES: false,
  SHOW_QR_CODE: false,
  SHOW_FOOTER_LOGO: false,
};
