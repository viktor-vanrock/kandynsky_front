import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|avif|mp4|mp3|woff2?)$': '<rootDir>/test/__mocks__/fileMock.ts',
    '\\.svg\\?react$': '<rootDir>/test/__mocks__/svgReactMock.tsx',
    '\\.svg$': '<rootDir>/test/__mocks__/fileMock.ts',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    '^.+\\.(js|jsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  transformIgnorePatterns: ['node_modules/(?!(@salutejs/plasma-giga|storeon))'],
  cacheDirectory: '<rootDir>/.jest-cache',
};
export default config;
