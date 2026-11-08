# 1. Pruebas unitarias (cliente y servidor)

## Qué comprueban

Prueban funciones del frontend y la lectura JSON del servidor de forma aislada, sin abrir un navegador ni iniciar un servidor.

## Archivos

- `app.unit.test.js`: escape HTML, renderizado, navegación y validación de mensajes.
- `server.unit.test.js`: JSON válido, inválido y mayor de 16 KiB.
- `jest.unit.config.cjs`: configuración de Jest, jsdom, cobertura y JUnit.
- `reports/junit/jest-unit.xml`: reporte generado al ejecutar la suite.

## Requisito

Node.js 20 o posterior.

## Comandos

Desde la raíz del proyecto:

```powershell
npm install
npm run test:unit
```

`npm install` instala las dependencias. `npm run test:unit` ejecuta Jest y genera el reporte JUnit.

## Mocks

jsdom simula el DOM para probar las funciones del cliente. Las solicitudes HTTP no se envían durante las pruebas unitarias.
