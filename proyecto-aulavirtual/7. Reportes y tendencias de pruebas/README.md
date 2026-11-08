# 7. Reportes y tendencias con UniReport

## Qué consolida

Se implementó una adaptación local de UniReport con `fast-xml-parser`: importa los JUnit de Jest y Playwright y calcula Pass Rate, Stability Score, Flaky y pruebas aprobadas. No depende de una plataforma externa; esta adaptación documenta la integración con el formato JUnit requerido por la tarea. Su total cuenta ejecuciones JUnit, no los 40 casos registrados: las 3 pruebas de rendimiento usan k6 y se resumen aparte. Conserva hasta 30 ejecuciones. ESLint se informa por separado y no afecta estas métricas de estabilidad.

## Archivos

- `unireport.cjs`: genera el dashboard.
- `reports/unireport.html`: indicadores y tendencia de los 60 casos JUnit.
- `reports/unireport-history.json`: historial de ejecuciones.

## Comandos

Desde la raíz ejecuta `npm test` o `npm run quality` para correr las suites y regenerar el dashboard principal. Ejecuta la batería completa al menos tres veces para comparar tendencias.

# Casos adicionales

La suite adicional se incluye en el total principal del dashboard. Consulta [CASOS_ADICIONALES.md](./CASOS_ADICIONALES.md) para el inventario y ejecuta `npm run quality` para actualizar los reportes.

