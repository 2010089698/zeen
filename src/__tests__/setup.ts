// Jest setup file for global mocks and configurations

// Mock fetch globally
global.fetch = jest.fn();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock process.env
process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.test.com';
process.env.EXPO_PUBLIC_ENABLE_REAL_SYNC = 'true';
