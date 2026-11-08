"use strict";

const path = require("node:path");
const rootDir = path.resolve(__dirname, "..");
const junitReporter = require.resolve("jest-junit", { paths: [rootDir] });

module.exports = {
  rootDir,
  testEnvironment: "node",
  testRegex: "2\\. Integración_API \\(servidor Node\\.js\\).*\\.api\\.test\\.js$",
  reporters: [
    "default",
    [junitReporter, {
      outputDirectory: "<rootDir>/2. Integración_API (servidor Node.js)/reports/junit",
      outputName: "jest-api.xml",
      addFileAttribute: "true",
    }],
  ],
};
