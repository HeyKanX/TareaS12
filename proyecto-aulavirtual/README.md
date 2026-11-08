# Aula Nova — prácticas de calidad

Proyecto universitario instrumentado con pruebas unitarias, API, E2E, cobertura, ESLint, k6 y UniReport.

## Requisitos

- Node.js 20.19 o posterior y npm.
- Google Chrome para Playwright.
- k6 2.x para rendimiento.

## Preparación en un equipo limpio

Desde esta carpeta, ejecuta:

```powershell
npm ci
```

## Flujo integral de calidad

```powershell
npm run quality
```

Ejecuta ESLint, pruebas de servidor, unitarias, integración API, E2E, casos adicionales, cobertura y UniReport. El flujo sigue para generar los reportes JUnit aunque una suite falle y termina con código distinto de cero si hubo fallos. Playwright inicia su servidor temporal en el puerto 4173 y guarda una captura por escenario aprobado.

## Análisis adicionales

```powershell
npm run lint
npm run test:coverage
```

La última ejecución alcanza los umbrales académicos: 94.33 % en instrucciones, 97.91 % en funciones, 94.24 % en líneas y 76.76 % en ramas. La comparación inicial/final está en `4. Cobertura de código (JavaScript)/reports/analisis-comparativo.md`.

## Rendimiento

En una terminal inicia el servidor:

```powershell
npm start
```

En otra terminal, ejecuta:

```powershell
npm run load
```

El perfil k6 usa 10 VU/2 min, 30 VU/3 min y estrés progresivo hasta 100 VU durante 4 min. El resumen se guarda en `6. Rendimiento (tiempos de respuesta, throughput)/reports/k6/summary.json`.

## Evidencias

El informe técnico se entrega como `Informe_Tecnico_Calidad_AulaNova_Semana12.docx`. Los reportes JUnit, cobertura, ESLint, k6 y UniReport se guardan en `reports/` dentro de cada carpeta numerada. La matriz de casos actualizada se entrega junto al proyecto en el paquete Semana 12.

Las capturas visuales están organizadas en [`evidencias/`](evidencias/README.md), con enlaces a los reportes verificables de pruebas, cobertura, ESLint, k6 y UniReport.


Consulta [GUIA_DEMOSTRACION.md](GUIA_DEMOSTRACION.md) para preparar la sustentación práctica.

El UniReport principal registra 48 aprobadas y 12 fallidas (80 %) en 60 casos JUnit. Consulta [CASOS_ADICIONALES.md](7.%20Reportes%20y%20tendencias%20de%20pruebas/CASOS_ADICIONALES.md) para el inventario y [GUIA_DEMOSTRACION.md](GUIA_DEMOSTRACION.md) para presentar el flujo.
