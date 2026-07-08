import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

if (typeof globalThis.TextEncoder === 'undefined') {
  // @ts-expect-error: добавляем в jsdom
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
}

globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
  setTimeout(() => cb(performance.now()), 0) as unknown as number;
globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = MockResizeObserver;

HTMLElement.prototype.scrollIntoView = HTMLElement.prototype.scrollIntoView || jest.fn();

// Мок для import.meta.env
if (typeof globalThis.import === 'undefined') {
  Object.defineProperty(globalThis, 'import', {
    value: {
      meta: {
        env: {
          VITE_SERVER_URL: '/api',
        },
      },
    },
    writable: true,
    configurable: true,
  });
}

// Мок для getComputedStyle для селекторов в styled-components
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = jest.fn((element: Element | null) => {
  if (!element) {
    return {} as CSSStyleDeclaration;
  }
  try {
    return originalGetComputedStyle(element);
  } catch (error) {
    // Если возникает ошибка с селектором, возвращаем безопасный объект
    const mockStyle = {
      getPropertyValue: (prop: string) => {
        if (prop === 'line-height' || prop === 'height') return '20px';
        if (prop === 'padding-top' || prop === 'padding-bottom') return '0px';
        if (prop === 'border-top-width' || prop === 'border-bottom-width') return '0px';
        if (prop === 'box-sizing') return 'content-box';
        return '';
      },
      setProperty: () => {},
      removeProperty: () => '',
      item: () => '',
      length: 0,
      parentRule: null,
      cssText: '',
      lineHeight: '20px',
      height: '20px',
      paddingTop: '0px',
      paddingBottom: '0px',
      borderTopWidth: '0px',
      borderBottomWidth: '0px',
      boxSizing: 'content-box',
    } as unknown as CSSStyleDeclaration;
    return mockStyle;
  }
});

export function resizeTo(width: number, height = 800) {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
}

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
