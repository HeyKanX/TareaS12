"use strict";

const js = require("@eslint/js");
const globals = require("globals");

const nodeAndJest = { ...globals.node, ...globals.jest };
const commonRules = {
  "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
  "no-undef": "error",
  "eqeqeq": "error",
  "no-eval": "error",
  "complexity": ["warn", { max: 10 }],
  "max-lines-per-function": ["warn", { max: 50, skipBlankLines: true, skipComments: true }],
};

module.exports = [
  {
    ignores: ["**/node_modules/**", "**/reports/**", "**/test-results/**", "**/playwright-html/**"],
  },
  js.configs.recommended,
  {
    files: [
      "1. Unitarias (cliente y servidor)/**/*.{js,cjs}",
      "2. Integración_API (servidor Node.js)/**/*.{js,cjs}",
      "3. End-to-End (E2E) en navegador/**/*.{js,cjs}",
      "4. Cobertura de código (JavaScript)/**/*.cjs",
      "5. Análisis estático (complejidad, code smells)/**/*.cjs",
      "6. Rendimiento (tiempos de respuesta, throughput)/**/*.js",
      "7. Reportes y tendencias de pruebas/**/*.cjs",
      "app/**/*.js",
      "backend/**/*.js",
    ],
    languageOptions: { globals: nodeAndJest, ecmaVersion: "latest" },
    rules: commonRules,
  },
  {
    files: ["app/**/*.js"],
    languageOptions: {
      globals: { ...globals.browser, module: "readonly" },
      sourceType: "script",
    },
  },
  {
    files: ["1. Unitarias (cliente y servidor)/*.unit.test.js"],
    languageOptions: { globals: { ...nodeAndJest, ...globals.browser } },
  },
  {
    files: ["3. End-to-End (E2E) en navegador/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
  {
    files: ["6. Rendimiento (tiempos de respuesta, throughput)/**/*.js"],
    languageOptions: {
      globals: { __ENV: "readonly", __VU: "readonly", __ITER: "readonly" },
      sourceType: "module",
    },
  },
];
