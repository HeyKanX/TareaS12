"use strict";

const path = require("node:path");
const rootDir = path.resolve(__dirname, "..");
const junitReporter = require.resolve("jest-junit", { paths: [rootDir] });

module.exports = {
  rootDir,
  testEnvironment: "jsdom",
  testRegex: "simulacion-fallos\\.test\\.js$",
  reporters: [
    "default",
    [junitReporter, {
      outputDirectory: "<rootDir>/7. Reportes y tendencias de pruebas/reports/simulation/junit",
      outputName: "simulacion.xml",
      addFileAttribute: "true",
    }],
  ],
};
