# Guía de demostración — Aula Nova

Esta guía prepara la sustentación práctica solicitada en la tarea. Los resultados descritos corresponden al entorno local; k6 no sustituye una medición en producción.

## Antes de la demostración

- Node.js 20.19 o posterior y npm.
- Google Chrome instalado para Playwright.
- k6 2.x disponible en PATH.
- Terminal abierta en la carpeta `proyecto-aulavirtual`.

## Flujo de calidad automatizado

Ejecuta:

```powershell
npm ci
npm run quality
```

El flujo muestra ESLint, las pruebas de servidor, unitarias, de integración, cobertura, E2E y UniReport. La última ejecución registrada pasó 53 pruebas; UniReport consolida 46 casos JUnit de Jest y Playwright. Playwright guarda una captura para cada uno de sus diez escenarios aprobados.

## Demostración de rendimiento

1. En la primera terminal inicia `npm start`.
2. En una segunda terminal ejecuta `npm run load`.
3. Espera a que terminen los escenarios de carga normal, elevada y estrés progresivo (aproximadamente nueve minutos en total).
4. Muestra `6. Rendimiento (tiempos de respuesta, throughput)/reports/k6/analisis-rendimiento.md` y `summary.json`.

La ejecución documentada se realizó contra el servidor local. Explica que no se observó degradación hasta 100 VU en esa corrida y que no es una proyección de producción.

## Resultados y evidencias para presentar

- Cobertura: `4. Cobertura de código (JavaScript)/reports/coverage/index.html` y `reports/analisis-comparativo.md`.
- ESLint: `5. Análisis estático (complejidad, code smells)/reports/analisis-comparativo.md`.
- UniReport: `7. Reportes y tendencias de pruebas/reports/unireport.html` e `unireport-history.json`.
- Capturas E2E: `3. End-to-End (E2E) en navegador/reports/test-results/`.
- Matriz: `Registro_Casos_Prueba_AulaVirtual_con_resultados.xlsx`.
- Informe técnico: `Informe_Tecnico_Calidad_AulaNova_Semana12.docx`.
- Índice de evidencias visuales: `evidencias/README.md`.

En la sustentación, diferencia las 53 pruebas de la batería completa (incluye 7 con `node:test`) de las 46 pruebas JUnit que consolida UniReport.
