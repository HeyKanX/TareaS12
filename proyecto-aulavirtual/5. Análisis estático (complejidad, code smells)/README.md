# 5. Análisis estático con ESLint

## Qué comprueba

Analiza JavaScript sin ejecutar la aplicación. Reglas principales: variables sin uso, nombres no definidos, igualdad estricta, `eval`, complejidad y longitud de funciones.

## Archivos

- `eslint.config.cjs`: reglas y ámbitos de Node, navegador, Jest y k6.
- `scripts/lint.cjs`: ejecuta ESLint y guarda `reports/eslint.json`.
- `reports/analisis-comparativo.md`: clasificación de hallazgos y resultados antes/después.

## Comando

Desde la raíz:

```powershell
npm run lint
```

El resultado actual es 0 errores y 3 advertencias de longitud en callbacks de pruebas; el código de producción no mantiene advertencias de complejidad. El análisis comparativo describe los cambios realizados y los hallazgos pendientes.
