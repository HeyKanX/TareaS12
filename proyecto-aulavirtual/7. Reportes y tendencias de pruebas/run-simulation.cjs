"use strict";

const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const jestPath = require.resolve("jest/bin/jest", { paths: [rootDir] });
const configPath = path.join(__dirname, "jest.simulation.config.cjs");
const reportPath = path.join(__dirname, "unireport.cjs");

const tests = spawnSync(process.execPath, [jestPath, "--config", configPath, "--runInBand"], {
  cwd: rootDir,
  stdio: "inherit",
});
const report = spawnSync(process.execPath, [reportPath, "--simulation"], {
  cwd: rootDir,
  stdio: "inherit",
});

if (report.status !== 0) process.exitCode = report.status || 1;
else if (tests.status !== 0) process.exitCode = tests.status || 1;
