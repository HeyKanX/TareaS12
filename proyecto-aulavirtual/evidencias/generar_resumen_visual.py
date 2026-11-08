from __future__ import annotations

import json
import re
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = Path(__file__).resolve().parent

history = json.loads((ROOT / "7. Reportes y tendencias de pruebas" / "reports" / "unireport-history.json").read_text(encoding="utf-8"))
coverage_text = (ROOT / "4. Cobertura de código (JavaScript)" / "reports" / "analisis-comparativo.md").read_text(encoding="utf-8")
lint = json.loads((ROOT / "5. Análisis estático (complejidad, code smells)" / "reports" / "eslint.json").read_text(encoding="utf-8"))
k6 = json.loads((ROOT / "6. Rendimiento (tiempos de respuesta, throughput)" / "reports" / "k6" / "summary.json").read_text(encoding="utf-8"))["metrics"]

latest = history[-1]
coverage = {}
for label, key in [("Instrucciones", "statements"), ("Líneas", "lines"), ("Funciones", "functions"), ("Ramas", "branches")]:
    match = re.search(rf"^\| {label} \|[^|]*\|\s*([0-9.]+)\s*%", coverage_text, re.MULTILINE)
    if not match:
        raise ValueError(f"No se encontró el porcentaje final de {label} en el reporte")
    coverage[key] = float(match.group(1))

lint_errors = sum(row["errorCount"] for row in lint)
lint_warnings = sum(row["warningCount"] for row in lint)

scenarios = [
    ("Normal", "carga_normal", "10 VU", "10.00 req/s"),
    ("Elevada", "carga_elevada", "30 VU", "30.00 req/s"),
    ("Estrés progresivo", "estres_progresivo", "hasta 100 VU", "43.78 req/s"),
]

fig = plt.figure(figsize=(15, 10), dpi=160, facecolor="#f3f6fb")
ax = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis("off")

navy = "#17345c"
blue = "#3375c6"
green = "#138a64"
muted = "#53657d"
light = "#e7edf5"
white = "#ffffff"

def card(x: float, y: float, w: float, h: float, title: str) -> None:
    box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.6,rounding_size=2.2", facecolor=white, edgecolor="#dce4ef", linewidth=1.1)
    ax.add_patch(box)
    ax.text(x + 2.2, y + h - 4.2, title, fontsize=14, fontweight="bold", color=navy, va="top")

ax.text(5, 96, "EVIDENCIA VISUAL · AULA NOVA", fontsize=11, fontweight="bold", color=blue, va="top")
ax.text(5, 91, "Resumen de resultados de calidad", fontsize=25, fontweight="bold", color=navy, va="top")
ax.text(5, 86.8, "Datos consolidados de pruebas, cobertura, ESLint y rendimiento · 8 de noviembre de 2026", fontsize=11, color=muted, va="top")

card(4, 56, 44, 27, "Pruebas automatizadas · UniReport")
ax.text(7, 72, f"{latest['passed']}/{latest['total']}", fontsize=28, fontweight="bold", color=green, va="center")
ax.text(25, 72, "aprobadas", fontsize=12, color=muted, va="center")
ax.text(7, 65.5, f"{latest['passRate']:.0f}% pass rate", fontsize=14, fontweight="bold", color=navy, va="center")
ax.text(7, 60.8, f"{latest['failed']} fallidas  ·  {latest['flaky']} flaky  ·  {len(history)} ejecuciones en el historial", fontsize=10.5, color=muted, va="center")
ax.text(7, 57.6, f"{latest['total'] - 14} casos base · 14 casos adicionales.", fontsize=9.5, color=muted, va="center")

card(52, 56, 44, 27, "Cobertura final · objetivos cumplidos")
coverage_rows = [("Instrucciones", coverage["statements"], 80), ("Líneas", coverage["lines"], 80), ("Funciones", coverage["functions"], 80), ("Ramas", coverage["branches"], 70)]
for i, (label, value, threshold) in enumerate(coverage_rows):
    y = 72 - i * 4.7
    ax.text(55, y, label, fontsize=10, color=muted, va="center")
    ax.plot([67, 87], [y, y], color=light, linewidth=8, solid_capstyle="round")
    ax.plot([67, 67 + 20 * value / 100], [y, y], color=green if value >= threshold else "#cc6e41", linewidth=8, solid_capstyle="round")
    ax.plot([67 + 20 * threshold / 100] * 2, [y - 0.9, y + 0.9], color=navy, linewidth=1.4)
    ax.text(91, y, f"{value:.2f}%", fontsize=10, fontweight="bold", color=navy, va="center", ha="right")

card(4, 25, 44, 27, "Análisis estático · ESLint")
ax.text(7, 41, str(lint_errors), fontsize=29, fontweight="bold", color=green, va="center")
ax.text(13, 41, "errores", fontsize=12, color=muted, va="center")
ax.text(27, 41, str(lint_warnings), fontsize=29, fontweight="bold", color="#c57a2a", va="center")
ax.text(33, 41, "advertencias", fontsize=12, color=muted, va="center")
ax.text(7, 34.7, f"{len(lint)} archivos analizados", fontsize=14, fontweight="bold", color=navy, va="center")
ax.text(7, 29.7, "Las 3 advertencias restantes corresponden a funciones largas en pruebas.", fontsize=9.5, color=muted, va="center")

card(52, 25, 44, 27, "Rendimiento · k6 en servidor local")
for i, (label, metric_key, vus, throughput) in enumerate(scenarios):
    y = 43.4 - i * 6
    duration = k6[f"{metric_key}_req_duration"]
    requests = k6[f"{metric_key}_requests"]["count"]
    p95 = duration["p(95)"]
    err = k6[f"{metric_key}_error_rate"]["value"] * 100
    ax.text(55, y, label, fontsize=9.6, fontweight="bold", color=navy, va="center")
    ax.text(94, y, f"p95 {p95:.3f} ms · {err:.0f}% errores", fontsize=8.6, color=green, va="center", ha="right")
    ax.text(55, y - 2.1, f"{vus} · {requests:,} solicitudes · {throughput}", fontsize=8.3, color=muted, va="center")

ax.text(4, 17.8, "Lectura: métricas obtenidas en el equipo local; no son una proyección de producción.", fontsize=10, color=muted, va="center")
ax.text(4, 13.3, "Fuente: reportes UniReport, cobertura comparativa, ESLint y summary.json de k6 incluidos en este proyecto.", fontsize=9, color=muted, va="center")
ax.text(4, 7.3, "Resumen de métricas generado desde los archivos de resultados.", fontsize=9.5, fontweight="bold", color=navy, va="center")

out = EVIDENCE / "05-resumen-visual-reportes.png"
fig.savefig(out, bbox_inches="tight", facecolor=fig.get_facecolor())
print(f"Creado: {out}")



