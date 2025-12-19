module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/scripts/**",
    "!server.js",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
  testTimeout: 30000, // Increase timeout for integration tests
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/integration/"],
  projects: [
    {
      displayName: "unit",
      testMatch: ["**/__tests__/**/*.test.js"],
      testPathIgnorePatterns: ["/node_modules/", "/__tests__/integration/"],
      setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
    },
    {
      displayName: "integration",
      testMatch: ["**/__tests__/integration/**/*.test.js"],
      setupFilesAfterEnv: [], // No shared setup for integration tests
    },
  ],
};
