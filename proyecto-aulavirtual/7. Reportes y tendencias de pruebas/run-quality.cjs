"use strict";

const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const jestPath = require.resolve("jest/bin/jest", { paths: [rootDir] });
const additionalConfig = path.join(__dirname, "jest.additional.config.cjs");
const quick = process.argv.includes("--quick");
const tasks = quick
  ? ["test:server", "test:unit", "test:api", "test:e2e", "test:additional", "report"]
  : ["lint", "test:server", "test:unit", "test:api", "test:coverage", "test:e2e", "test:additional", "report"];
const failures = [];

for (const task of tasks) {
  const result = task === "test:additional"
    ? spawnSync(process.execPath, [jestPath, "--config", additionalConfig, "--runInBand"], { cwd: rootDir, stdio: "inherit" })
    : spawnSync(process.execPath, [process.env.npm_execpath, "run", task], { cwd: rootDir, stdio: "inherit" });
  if (result.error || result.status !== 0) failures.push(task);
}

if (failures.length) {
  console.error(`Flujo completado con tareas fallidas: ${failures.join(", ")}. UniReport se actualizó con los JUnit generados.`);
  process.exitCode = 1;
}
