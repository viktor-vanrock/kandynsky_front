import { DefaultModeIcon, GameDevModeIcon, LockedModeIcon, PrintingModeIcon } from "../components/Icons";
import { textWarning, textPositive } from "@salutejs/plasma-themes/tokens";

export const SUGGESTIONS = [
  'Кофейная чашка',
  'Киберпанк-город',
  'Абстрактная скрипка из стекла',
  'Робот-питомец',
  'Футуристический велосипед',
  'Левитирующая лампа',
];

const STANDARD_MODE_TOOLTIP = 'Быстро получить 3D-модель с базовыми настройками';
const GAMEDEV_MODE_TOOLTIP = 'Настроить количество полигонов, LOD, топологию и PBR';
const PRINTING_MODE_TOOLTIP = 'Оптимизировано для печати на 3D-принтерах';
const CAD_MODE_TOOLTIP = 'В разработке';


export const MODES = [
  { id: 'standard', label: 'Обычный', IconComponent: DefaultModeIcon, tooltip: STANDARD_MODE_TOOLTIP, iconColor: '#3f81fd' },
  { id: 'gamedev', label: 'GameDev', badge: 'NEW', IconComponent: GameDevModeIcon, tooltip: GAMEDEV_MODE_TOOLTIP, iconColor: textWarning },
  { id: '3dprint', label: '3D-печать', badge: 'NEW', IconComponent: PrintingModeIcon, tooltip: PRINTING_MODE_TOOLTIP, iconColor: textPositive },
  { id: 'cad', label: 'CAD', IconComponent: LockedModeIcon, badge: 'NEW' },
];

export const LOADING_TEXTS = [
  'Трудимся над Вашей моделью, нужно немного подождать',
  'Наши алгоритмы усердно создают 3D-модель, наберитесь терпения',
  'Создаём геометрию, запекаем текстуру, почти готово',
  'Сглаживаем сетку, генерируем форматы, пожалуйста, подождите',
  'Выполняем Ваш запрос, подождите, пожалуйста',
  'Пару минут — и 3D-модель будет готова',
  'Ещё чуть-чуть — и ваш запрос будет выполнен',
];

export const SUPPORT_EMAIL = 'kandinsky3D@sberbank.ru';