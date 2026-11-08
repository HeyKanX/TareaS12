# 2. Pruebas de integración API

## Qué comprueban

Supertest envía solicitudes HTTP a `createServer()` sin iniciar un proceso externo. Se revisan perfil, cursos, mensajes, validación y rutas.

## Archivos

- `server.api.test.js`: 12 escenarios de integración.
- `jest.api.config.cjs`: configuración de Jest y salida JUnit.
- `reports/junit/jest-api.xml`: reporte generado al ejecutar la suite.

## Comando

Desde la raíz del proyecto:

```powershell
npm run test:api
```

El reporte se guarda en `reports/junit/jest-api.xml`. Los mensajes se almacenan en memoria y pueden persistir durante la ejecución del servidor.
