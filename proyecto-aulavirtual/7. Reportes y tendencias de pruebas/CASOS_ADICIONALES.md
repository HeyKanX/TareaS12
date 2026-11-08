# Casos adicionales de prueba — Aula Nova

La batería automatizada reúne 60 casos JUnit: 24 pruebas unitarias, 14 casos adicionales de cliente, 12 pruebas de integración API y 10 pruebas E2E. En las tres ejecuciones documentadas, 48 pasaron y 12 fallaron, para una tasa de aprobación de **80%**.

Los fallos muestran comportamientos pendientes en la lógica actual: estado académico según nota, validación del curso, progreso fuera de rango, navegación del historial, renderizado de fechas inválidas y estados vacíos. Los dos casos de control verifican una consulta válida y la nota mínima aprobatoria.

## Ejecución

Desde la carpeta del proyecto:

```powershell
npm ci
npm run quality
```

El flujo ejecuta todas las suites, conserva las fallas para su análisis, escribe JUnit y actualiza `7. Reportes y tendencias de pruebas/reports/unireport.html`. Termina con código distinto de cero mientras existan pruebas fallidas.

La tasa se calcula a partir de los resultados JUnit, no se fija manualmente. Las 7 pruebas `node:test` del servidor, ESLint y cobertura se reportan como resultados separados y no forman parte del denominador JUnit.
