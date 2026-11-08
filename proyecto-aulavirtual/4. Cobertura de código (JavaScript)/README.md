# 4. Cobertura de código

## Qué mide

Jest informa sentencias, ramas, funciones y líneas ejecutadas. La cobertura ayuda a localizar código no ejercitado; no demuestra ausencia de defectos.

## Archivos

- `jest.config.cjs`: suite unitaria/API, formatos y umbrales.
- `scripts/coverage.cjs`: ejecuta Jest con instrumentación.
- `reports/analisis-comparativo.md`: resultados iniciales/finales, interpretación y código pendiente.
- `reports/coverage/`: informes HTML, LCOV, Cobertura y JSON.

## Comando

Desde la raíz:

```powershell
npm run test:coverage
```

Mínimos: 80 % en sentencias, funciones y líneas; 70 % en ramas. Último resultado: 94.33 % en sentencias, 97.91 % en funciones, 94.24 % en líneas y 76.76 % en ramas; los cuatro umbrales se cumplen.

Informe navegable: `reports/coverage/index.html`.
