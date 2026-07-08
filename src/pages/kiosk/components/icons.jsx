// icons.jsx — минималистичные line-иконки в стиле Kandinsky
import React from 'react';

const Icon = ({ children, size = 32, stroke = 'currentColor', strokeWidth = 1.6, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IconKids = ({ size = 32 }) => (
  <Icon size={size}>
    <circle cx="12" cy="8" r="3" />
    <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="9" cy="7" r="0.5" fill="currentColor" />
    <circle cx="15" cy="7" r="0.5" fill="currentColor" />
    <path d="M10.5 10.5c.5.4 1 .6 1.5.6s1-.2 1.5-.6" />
  </Icon>
);

const IconCatalog = ({ size = 32 }) => (
  <Icon size={size}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Icon>
);

const IconSparkles = ({ size = 32 }) => (
  <Icon size={size}>
    <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
    <path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
  </Icon>
);

const IconArrowRight = ({ size = 32 }) => (
  <Icon size={size} strokeWidth={2}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

const IconArrowLeft = ({ size = 32 }) => (
  <Icon size={size} strokeWidth={2}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Icon>
);

const IconClose = ({ size = 32 }) => (
  <Icon size={size} strokeWidth={2}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Icon>
);

const IconCheck = ({ size = 32 }) => (
  <Icon size={size} strokeWidth={2}>
    <path d="M5 12l5 5L20 7" />
  </Icon>
);

const IconMic = ({ size = 32 }) => (
  <Icon size={size}>
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0014 0M12 18v3" />
  </Icon>
);

const IconPlus = ({ size = 32 }) => (
  <Icon size={size} strokeWidth={2}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

const IconMinus = ({ size = 32 }) => (
  <Icon size={size} strokeWidth={2}>
    <path d="M5 12h14" />
  </Icon>
);

const IconPrinter = ({ size = 32 }) => (
  <Icon size={size}>
    <path d="M7 8V3h10v5M7 18H5a2 2 0 01-2-2v-6a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
    <rect x="7" y="14" width="10" height="7" rx="1" />
  </Icon>
);

const IconWifi = ({ size = 24 }) => (
  <Icon size={size} strokeWidth={1.8}>
    <path d="M5 12.55a11 11 0 0114 0M8.5 16.5a6 6 0 017 0M12 20h.01" />
  </Icon>
);

const IconHeart = ({ size = 28 }) => (
  <Icon size={size}>
    <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.7A4 4 0 0119 11c0 5.5-7 10-7 10z" />
  </Icon>
);

const IconStar = ({ size = 28 }) => (
  <Icon size={size}>
    <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4 6.8 19.2l1-5.9L3.5 9.2l5.9-.8z" />
  </Icon>
);

const IconTrash = ({ size = 28 }) => (
  <Icon size={size}>
    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14" />
  </Icon>
);

const IconGlobe = ({ size = 24 }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
  </Icon>
);

const IconCube = ({ size = 32 }) => (
  <Icon size={size}>
    <path d="M12 3l9 5v8l-9 5-9-5V8z" />
    <path d="M3 8l9 5 9-5M12 13v10" />
  </Icon>
);

const IconRotate = ({ size = 28 }) => (
  <Icon size={size}>
    <path d="M21 12a9 9 0 11-3-6.7L21 8" />
    <path d="M21 3v5h-5" />
  </Icon>
);

const IconSpeaker = ({ size = 28 }) => (
  <Icon size={size}>
    <path d="M11 5L6 9H3v6h3l5 4V5zM16 8a5 5 0 010 8M19 5a9 9 0 010 14" />
  </Icon>
);

const IconHome = ({ size = 24 }) => (
  <Icon size={size} strokeWidth={1.8}>
    <path d="M3 11l9-8 9 8M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" />
  </Icon>
);

export {
  Icon, IconKids, IconCatalog, IconSparkles, IconArrowRight, IconArrowLeft,
  IconClose, IconCheck, IconMic, IconPlus, IconMinus, IconPrinter, IconWifi,
  IconHeart, IconStar, IconTrash, IconGlobe, IconCube, IconRotate, IconSpeaker,
  IconHome
};
