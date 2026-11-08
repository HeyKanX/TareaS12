# 6. Pruebas de rendimiento con k6

## Qué mide

Solicita perfil, cursos y mensajes. Registra latencia, p95/p99, solicitudes por segundo, errores y usuarios virtuales.

## Escenarios

- Normal: 10 VU durante 2 minutos.
- Elevado: 30 VU durante 3 minutos.
- Estrés progresivo: aumenta a 25, 50 y 100 VU en tres etapas de 1 minuto y luego descarga durante 1 minuto (4 minutos en total).

Los escenarios corren en secuencia; la ejecución completa tarda cerca de 9 minutos. Se distribuyen las solicitudes entre los tres endpoints. Los umbrales p95 < 500 ms, p99 < 1000 ms, errores < 1 % y checks > 99 % se aplican a carga normal. El comando solicita avg, min, mediana, máximo, p90, p95 y p99; las métricas personalizadas separan latencia, conteo y tasa de error por escenario.

## Requisitos y ejecución

k6 instalado y servidor activo. Desde una terminal ejecuta `npm start`; en otra, desde la raíz:

```powershell
npm run load
```

El resumen JSON se guarda en `reports/k6/summary.json`; el análisis legible de la última corrida queda en `reports/k6/analisis-rendimiento.md`. Si un umbral no se cumple, se informa el resultado real sin modificar la aplicación.
