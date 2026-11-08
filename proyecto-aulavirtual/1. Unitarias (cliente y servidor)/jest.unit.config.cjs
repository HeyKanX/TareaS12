"use strict";

const path = require("node:path");
const rootDir = path.resolve(__dirname, "..");
const junitReporter = require.resolve("jest-junit", { paths: [rootDir] });

module.exports = {
  rootDir,
  testEnvironment: "node",
  testRegex: "1\\. Unitarias \\(cliente y servidor\\).*\\.unit\\.test\\.js$",
  collectCoverageFrom: ["app/app.js", "backend/server.js", "!**/node_modules/**"],
  coverageDirectory: "<rootDir>/1. Unitarias (cliente y servidor)/reports/coverage",
  coverageReporters: ["text", "lcov", "cobertura"],
  reporters: [
    "default",
    [junitReporter, {
      outputDirectory: "<rootDir>/1. Unitarias (cliente y servidor)/reports/junit",
      outputName: "jest-unit.xml",
      addFileAttribute: "true",
    }],
  ],
};
