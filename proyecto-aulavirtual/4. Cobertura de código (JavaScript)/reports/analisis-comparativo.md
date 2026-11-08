# Análisis comparativo de cobertura

## Resultado inicial y final

El resultado inicial se obtuvo con las pruebas que ya estaban en el proyecto antes de añadir cobertura adicional. El resultado final se obtuvo ejecutando `npm run test:coverage` luego de añadir pruebas de comportamiento para el cliente.

| Indicador | Inicial | Final | Cambio | Objetivo | Estado final |
|---|---:|---:|---:|---:|---|
| Instrucciones | 61.65 % | 94.33 % | +32.68 puntos | 80 % | Cumple |
| Líneas | 62.03 % | 94.24 % | +32.21 puntos | 80 % | Cumple |
| Funciones | 65.90 % | 97.91 % | +32.01 puntos | 80 % | Cumple |
| Ramas | 72.97 % | 76.76 % | +3.79 puntos | 70 % | Cumple |

## Cobertura final por archivo

| Archivo | Instrucciones | Líneas | Funciones | Ramas |
|---|---:|---:|---:|---:|
| `app/app.js` | 97.56 % | 97.22 % | 100 % | 85.71 % |
| `backend/server.js` | 89.88 % | 90.36 % | 93.75 % | 71.87 % |

La aplicación cliente fue el área más débil en la medición inicial. Las nuevas pruebas cubren la carga inicial, la navegación y el menú, el diálogo, las validaciones del formulario, el envío exitoso y los errores de red/API. `fetch` se simula con respuestas controladas; jsdom proporciona el DOM y los métodos del diálogo se sustituyen por mocks porque jsdom no implementa el diálogo nativo del navegador.

## Código aún no cubierto

- En `app/app.js` quedan sin ejecutar la rama de validación para un payload `null` (línea 29) y la inicialización automática exclusiva del navegador (líneas 206–207). Las funciones exportadas se ejercitan desde pruebas unitarias; Playwright comprueba los flujos de usuario, pero su instrumentación no forma parte de este reporte de Jest.
- En `backend/server.js` quedan sin ejecutar la respuesta a una ruta con codificación inválida (líneas 90–91) y la validación del puerto al ejecutar el archivo directamente (líneas 167–173). Los endpoints y los archivos estáticos habituales sí tienen cobertura de integración.

Las ramas del backend tienen 71.87 %, sobre el mínimo global requerido de 70 %. El margen es estrecho; conviene agregar escenarios específicos de codificación de ruta y configuración del puerto si se requiere mayor seguridad ante cambios futuros.

## Evidencia de ejecución

`npm run test:coverage` se volvió a ejecutar el 7 de noviembre de 2026 sobre el código actual y terminó con código 0: 4 suites y 36 pruebas aprobadas. Jest generó el reporte HTML, LCOV, Cobertura XML y JSON en `reports/coverage/`; el resumen de consola mostró los umbrales académicos cumplidos.
