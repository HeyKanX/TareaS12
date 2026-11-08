# Resultados de rendimiento — 7 de noviembre de 2026

## Entorno y escenarios

Prueba ejecutada con k6 contra el servidor Node.js local (`127.0.0.1:3000`). Cada iteración solicitó uno de los endpoints `/api/student`, `/api/courses` o `/api/messages`, con una pausa de un segundo. La ejecución recorrió los tres escenarios en secuencia:

- Carga normal: 10 VU durante 2 minutos.
- Carga elevada: 30 VU durante 3 minutos.
- Estrés progresivo: 25, 50 y 100 VU, cada nivel por 1 minuto, seguido de descarga a 0 VU durante 1 minuto.

## Métricas observadas

| Escenario | Solicitudes | Throughput promedio | Tiempo promedio | p95 | p99 | Máximo | Errores |
|---|---:|---:|---:|---:|---:|---:|---:|
| Normal (10 VU) | 1,200 | 10.00 req/s | 0.663 ms | 1.374 ms | 1.859 ms | 2.926 ms | 0 % |
| Elevada (30 VU) | 5,400 | 30.00 req/s | 0.772 ms | 1.761 ms | 2.758 ms | 5.684 ms | 0 % |
| Estrés progresivo (hasta 100 VU) | 10,506 | 43.78 req/s | 0.521 ms | 1.084 ms | 1.284 ms | 4.729 ms | 0 % |

Los valores p95 y p99 de carga normal cumplieron los objetivos de referencia (p95 < 500 ms y p99 < 1,000 ms), al igual que la tasa de errores (< 1 %). Los checks de respuesta HTTP y estructura JSON pasaron en el 100 % de las solicitudes.

## Interpretación y límites

En esta corrida no se observó degradación de latencia ni errores hasta 100 VU. El p95 más alto ocurrió en carga elevada y fue 1.761 ms; durante el estrés progresivo quedó en 1.084 ms. La fase de estrés agrega las etapas de subida, pico y descarga, así que sus percentiles resumen la fase completa y no aíslan únicamente el minuto a 100 VU.

La ejecución se realizó contra el servidor local en este equipo; sus cifras describen este entorno y no predicen directamente el rendimiento en producción. El resumen JSON conserva las métricas por escenario. El throughput de la tabla se calcula dividiendo las solicitudes de cada escenario por la duración de ese escenario.
