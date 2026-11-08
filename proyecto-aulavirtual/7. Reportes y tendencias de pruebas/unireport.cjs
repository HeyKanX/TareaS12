"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { XMLParser } = require("fast-xml-parser");

const rootDir = path.resolve(__dirname, "..");
const reportDir = path.join(__dirname, "reports");
const junitDirs = [
  path.join(rootDir, "1. Unitarias (cliente y servidor)", "reports", "junit"),
  path.join(rootDir, "2. Integración_API (servidor Node.js)", "reports", "junit"),
  path.join(rootDir, "3. End-to-End (E2E) en navegador", "reports", "junit"),
];
const historyPath = path.join(reportDir, "unireport-history.json");
const outputPath = path.join(reportDir, "unireport.html");

function asArray(value) {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function collectTestCases(node, result = []) {
  if (!node || typeof node !== "object") return result;
  for (const [key, value] of Object.entries(node)) {
    if (key === "testcase") result.push(...asArray(value));
    else if (value && typeof value === "object") {
      for (const item of asArray(value)) collectTestCases(item, result);
    }
  }
  return result;
}

function countFlaky(node) {
  if (!node || typeof node !== "object") return 0;
  if (node.outcome === "flaky") return 1;
  return Object.values(node).reduce((total, value) => {
    const items = Array.isArray(value) ? value : [value];
    return total + items.reduce((sum, item) => sum + countFlaky(item), 0);
  }, 0);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function readResults() {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const files = junitDirs.flatMap(directory => (fs.existsSync(directory)
    ? fs.readdirSync(directory).filter(name => name.endsWith(".xml")).map(name => path.join(directory, name))
    : []));
  const testCases = files.flatMap(file => collectTestCases(parser.parse(fs.readFileSync(file, "utf8"))));
  const playwrightJson = path.join(junitDirs[2], "..", "playwright.json");
  const flaky = fs.existsSync(playwrightJson)
    ? countFlaky(JSON.parse(fs.readFileSync(playwrightJson, "utf8")))
    : 0;
  const failed = testCases.filter(testCase => testCase.failure || testCase.error).length;
  const skipped = testCases.filter(testCase => testCase.skipped).length;
  const passed = testCases.length - failed - skipped;
  return {
    date: new Date().toISOString(),
    total: testCases.length,
    passed,
    failed,
    skipped,
    flaky,
    passRate: testCases.length ? Number((passed / testCases.length * 100).toFixed(2)) : 0,
    flakyRate: testCases.length ? Number((flaky / testCases.length * 100).toFixed(2)) : 0,
    stability: testCases.length ? Math.max(0, Number(((passed - flaky) / testCases.length * 100).toFixed(2))) : 0,
    sources: files.map(file => path.relative(rootDir, file)),
  };
}

function saveHistory(result) {
  fs.mkdirSync(reportDir, { recursive: true });
  let history = [];
  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
    if (!Array.isArray(history)) throw new Error("El historial de UniReport debe ser un arreglo JSON.");
  }
  history = [...history, result].slice(-30);
  fs.writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`, "utf8");
  return history;
}

function renderHtml(result, history) {
  const rows = history.slice().reverse().map(run => `
    <tr><td>${escapeHtml(new Date(run.date).toLocaleString("es-CO"))}</td>
    <td>${run.total}</td><td>${run.passed}</td><td>${run.failed}</td>
    <td>${run.passRate}%</td><td>${run.stability}%</td><td>${run.flakyRate}%</td></tr>`).join("");
  const sources = result.sources.length ? result.sources.map(escapeHtml).join(", ") : "No hay XML JUnit; ejecuta las suites primero.";
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>UniReport — Aula Virtual</title>
<style>
body{font:16px system-ui,sans-serif;max-width:1100px;margin:36px auto;padding:0 20px;color:#1d2737;background:#f5f7fb}
h1{color:#253a64}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px}
.card,section{background:#fff;border:1px solid #dce3ec;border-radius:10px;padding:20px;box-shadow:0 2px 6px #1d273710}.value{font-size:2rem;font-weight:700;color:#239b70}
.label,footer{color:#627086}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{text-align:left;padding:9px;border-bottom:1px solid #e5eaf0}.note{border-left:4px solid #e0a43b;padding:10px 14px;background:#fff8e9;border-radius:4px}
</style></head><body><h1>UniReport — Aula Virtual</h1>
<p>Resultados de Jest y Playwright en formato JUnit.</p>
<div class="cards">
<article class="card"><div class="value">${result.passRate}%</div><div class="label">Pass Rate</div></article>
<article class="card"><div class="value">${result.stability}%</div><div class="label">Stability Score</div></article>
<article class="card"><div class="value">${result.flakyRate}%</div><div class="label">Flaky</div></article>
<article class="card"><div class="value">${result.passed}/${result.total}</div><div class="label">Pruebas JUnit aprobadas</div></article>
</div><section><h2>Conteo frente al registro</h2>
<p>El Excel registra 40 casos: 15 unitarios, 12 de API, 10 E2E y 3 de rendimiento. Este dashboard cuenta 38 pruebas automatizadas JUnit: 16 unitarias, 12 de API y 10 E2E. Los escenarios k6 se reportan en su resumen JSON, no como casos JUnit.</p>
<p>La diferencia unitaria incluye una prueba automatizada adicional sobre cursos, notas y opciones; además, algunas pruebas JUnit verifican juntas condiciones que el registro separa en casos CP. Por eso el total JUnit no representa directamente el total de casos registrados.</p></section>
<section><h2>Tendencia (${history.length} ejecuciones)</h2>
<table><thead><tr><th>Fecha</th><th>Total</th><th>Passed</th><th>Failed</th><th>Pass Rate</th><th>Stability</th><th>Flaky</th></tr></thead>
<tbody>${rows || "<tr><td colspan='7'>Aún no hay ejecuciones.</td></tr>"}</tbody></table></section>
<section><h2>Calidad estática (ESLint)</h2>
<p class="note">ESLint analiza el código; no mide la estabilidad de las pruebas. Sus errores y advertencias se reportan aparte y no alteran Pass Rate, Stability Score ni Flaky.</p>
<p>Consulta los resultados y reglas en <code>5. Análisis estático (complejidad, code smells)/reports/eslint.json</code>.</p></section>
<footer><p>Flaky se cuenta desde el JSON de Playwright. Stability Score = (Pruebas aprobadas − Flaky) / Total.</p>
<p>Fuentes JUnit: ${sources}</p><p>Actualizado: ${escapeHtml(new Date(result.date).toLocaleString("es-CO"))}</p></footer></body></html>`;
}

const result = readResults();
const history = saveHistory(result);
fs.writeFileSync(outputPath, renderHtml(result, history), "utf8");
console.log(`UniReport: ${result.passed}/${result.total} aprobadas; ${result.failed} fallidas; pass rate ${result.passRate}%.`);
console.log(`Dashboard: ${outputPath}`);
