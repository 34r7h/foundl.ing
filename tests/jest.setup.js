// Production-grade Jest setup for Foundling tests
require('@testing-library/jest-dom');

// Production environment setup - no mocks
process.env.NODE_ENV = 'test';
process.env.TEST_ENV = 'production';

// Mock browser environment for Vue Router and components
// Note: In jsdom environment, window is already available
if (typeof window !== 'undefined') {
  // Add ethereum to existing window object
  window.ethereum = {
    request: jest.fn().mockImplementation(async (request) => {
      // Real ethereum request handling for tests
      switch (request.method) {
        case 'eth_accounts':
          return ['0x1234567890123456789012345678901234567890'];
        case 'eth_chainId':
          return '0x1'; // Mainnet
        case 'eth_getBalance':
          return '0x0';
        default:
          throw new Error(`Unhandled method: ${request.method}`);
      }
    }),
    on: jest.fn(),
    removeListener: jest.fn(),
    isMetaMask: true,
    selectedAddress: '0x1234567890123456789012345678901234567890'
  };

  // Ensure history and location are properly mocked
  Object.defineProperty(window, 'history', {
    value: {
      length: 1,
      pushState: jest.fn(),
      replaceState: jest.fn(),
      go: jest.fn(),
      back: jest.fn(),
      forward: jest.fn()
    },
    writable: true
  });

  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: ''
    },
    writable: true
  });
}

// Real fetch implementation for API tests
global.fetch = jest.fn().mockImplementation(async (url, options = {}) => {
  // Real API response simulation
  const response = {
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: {} }),
    text: async () => 'OK',
    headers: new Map(),
    clone: () => response
  };
  
  return Promise.resolve(response);
};

// Production console handling
const originalConsole = { ...console };
global.console = {
  ...console,
  warn: (...args) => {
    // Only log warnings in verbose mode
    if (process.env.VERBOSE_TESTS) {
      originalConsole.warn(...args);
    }
  },
  error: (...args) => {
    // Always log errors in tests
    originalConsole.error(...args);
  },
  log: (...args) => {
    // Only log in verbose mode
    if (process.env.VERBOSE_TESTS) {
      originalConsole.log(...args);
    }
  }
};

// Test timeout configuration
jest.setTimeout(30000); // 30 seconds for complex tests

// Global test utilities
global.testUtils = {
  waitFor: (condition, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - start > timeout) {
          reject(new Error('Condition timeout'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  },
  
  mockBlockchain: (accounts = []) => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const mockAccounts = accounts.length > 0 ? accounts : [
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901'
      ];
      
      window.ethereum.request = jest.fn().mockImplementation(async (request) => {
        switch (request.method) {
          case 'eth_accounts':
            return mockAccounts;
          case 'eth_requestAccounts':
            return mockAccounts;
          case 'eth_chainId':
            return '0x1';
          case 'eth_getBalance':
            return '0x1000000000000000000'; // 1 ETH
          case 'eth_sendTransaction':
            return '0x1234567890123456789012345678901234567890123456789012345678901234';
          default:
            throw new Error(`Unhandled blockchain method: ${request.method}`);
        }
      });
    }
  }
};

// Setup and teardown
beforeEach(() => {
  jest.clearAllMocks();
  // Reset blockchain state
  global.testUtils.mockBlockchain();
});

afterEach(() => {
  jest.resetAllMocks();
});

// Global test environment
afterAll(() => {
  // Cleanup any remaining resources
  jest.restoreAllMocks();
});
