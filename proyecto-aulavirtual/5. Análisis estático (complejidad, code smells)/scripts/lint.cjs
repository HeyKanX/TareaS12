"use strict";

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "../..");
const eslintCli = path.join(rootDir, "node_modules", "eslint", "bin", "eslint.js");
const config = path.resolve(__dirname, "../eslint.config.cjs");
const reportDir = path.resolve(__dirname, "../reports");
const reportFile = path.join(reportDir, "eslint.json");
const targets = [
  "app", "backend",
  "1. Unitarias (cliente y servidor)",
  "2. Integración_API (servidor Node.js)",
  "3. End-to-End (E2E) en navegador",
  "4. Cobertura de código (JavaScript)",
  "5. Análisis estático (complejidad, code smells)",
  "6. Rendimiento (tiempos de respuesta, throughput)",
  "7. Reportes y tendencias de pruebas",
];

fs.mkdirSync(reportDir, { recursive: true });
const result = spawnSync(process.execPath, [
  eslintCli, "--config", config, "--format", "json", "--output-file", reportFile, ...targets,
], { cwd: rootDir, stdio: "inherit" });
if (result.error) throw result.error;

const lintResults = JSON.parse(fs.readFileSync(reportFile, "utf8"));
const errors = lintResults.reduce((sum, file) => sum + file.errorCount, 0);
const warnings = lintResults.reduce((sum, file) => sum + file.warningCount, 0);
console.log(`ESLint: ${errors} errores, ${warnings} advertencias en ${lintResults.length} archivos.`);
console.log(`Reporte: ${path.relative(rootDir, reportFile)}`);
process.exitCode = result.status ?? 1;
