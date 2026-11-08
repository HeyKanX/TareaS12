# Simulación de fallos — Aula Nova

Esta corrida es un ejercicio separado para el curso. La batería de aceptación original y su dashboard siguen intactos. El dashboard de simulación reúne sus 46 casos aprobados y 14 escenarios adicionales: 2 controles aprobados y 12 pruebas rojas sobre comportamientos ampliados del caso ficticio. Resultado esperado: **48/60 aprobadas (80%)**.

Las pruebas rojas están rotuladas `SIMULACIÓN` y cubren, entre otros casos, estado académico según nota, validación del curso, progreso fuera de rango, navegación del historial, renderizado de fechas inválidas y estados vacíos. Son criterios de escenario para el ejercicio; no forman parte de los requisitos mínimos del PDF original.

## Ejecución

Desde la carpeta del proyecto:

```powershell
npm ci
npm run simulation
```

El proceso ejecuta las 14 pruebas de escenario, escribe su JUnit y actualiza el dashboard independiente `7. Reportes y tendencias de pruebas/reports/unireport-simulacion.html`. El comando termina con código distinto de cero porque las 12 pruebas rojas son fallas esperadas del ejercicio.

El dashboard académico original está en `7. Reportes y tendencias de pruebas/reports/unireport.html`; `npm run quality` continúa evaluando únicamente la batería base.
