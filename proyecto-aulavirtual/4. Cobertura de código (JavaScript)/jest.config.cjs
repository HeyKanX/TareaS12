"use strict";

const path = require("node:path");
const rootDir = path.resolve(__dirname, "..");
const junitReporter = require.resolve("jest-junit", { paths: [rootDir] });

module.exports = {
  rootDir,
  testEnvironment: "node",
  testRegex: "(?:1\\. Unitarias \\(cliente y servidor\\).*\\.unit\\.test\\.js|2\\. Integración_API \\(servidor Node\\.js\\).*\\.api\\.test\\.js)$",
  collectCoverageFrom: ["app/app.js", "backend/server.js", "!**/node_modules/**"],
  coverageDirectory: "<rootDir>/4. Cobertura de código (JavaScript)/reports/coverage",
  coverageReporters: ["text", "html", "lcov", "cobertura", "json"],
  coverageThreshold: {
    global: { branches: 70, functions: 80, lines: 80, statements: 80 },
  },
  reporters: [
    "default",
    [junitReporter, {
      outputDirectory: "<rootDir>/4. Cobertura de código (JavaScript)/reports/junit",
      outputName: "jest-coverage.xml",
      addFileAttribute: "true",
    }],
  ],
};
