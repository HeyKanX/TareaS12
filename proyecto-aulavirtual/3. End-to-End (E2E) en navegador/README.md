# 3. Pruebas E2E en navegador

## Qué comprueban

Playwright usa Chromium para recorrer diez flujos de perfil, cursos, notas, navegación y mensajes.

## Archivos

- `aula.e2e.test.js`: escenarios de extremo a extremo.
- `playwright.config.cjs`: Chromium, servidor de prueba y reporteros.
- `reports/`: JUnit, JSON, HTML y capturas de cada escenario aprobado en `test-results/`.

## Preparar y ejecutar

Requiere Google Chrome instalado. Desde la raíz del proyecto:

```powershell
npm run test:e2e
```

Playwright inicia el servidor en el puerto 4173 y lo cierra al terminar. El reporte JUnit queda en `reports/junit/playwright.xml`; guarda capturas PNG de los diez escenarios en `reports/test-results/`.

