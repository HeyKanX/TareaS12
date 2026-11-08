"use strict";

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "../..");
const jestCli = path.join(rootDir, "node_modules", "jest", "bin", "jest.js");
const config = path.resolve(__dirname, "../jest.config.cjs");
const result = spawnSync(process.execPath, [jestCli, "--config", config, "--runInBand", "--coverage"], {
  cwd: rootDir,
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
