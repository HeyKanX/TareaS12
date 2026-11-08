# Análisis comparativo de ESLint

## Resultado

Se ejecutó `npm run lint` antes y después de corregir la configuración y descomponer las funciones con mayor complejidad.

| Hallazgo | Antes | Después | Severidad / resultado |
|---|---:|---:|---|
| `no-undef` | 51 | 0 | Error; corregido al aplicar globals de navegador/jsdom a todas las pruebas unitarias de cliente. |
| Complejidad superior a 10 | 2 | 0 | Advertencia; se redujo en la validación de mensajes y en el handler HTTP del servidor. |
| Funciones de más de 50 líneas | 4 | 3 | Advertencia; quedan en callbacks extensos de las suites unitarias/API y del test del servidor. |
| **Total de errores** | **51** | **0** | El lint final termina correctamente. |
| **Total de advertencias** | **6** | **3** | Las tres restantes son longitud de callbacks de pruebas, no de código de producción. |

## Clasificación y cambios realizados

- **Errores de configuración (`no-undef`, severidad alta):** el archivo de pruebas de comportamiento del cliente se ejecuta con jsdom y usa `document`, `history` y `MouseEvent`. El ámbito ESLint solo incluía el archivo unitario original. Amplié la configuración a todos los `*.unit.test.js` de esa carpeta.
- **Complejidad en validación (`complexity`, advertencia):** `validateMessagePayload()` tenía complejidad 13. Se extrajo la comprobación de límites de longitud a `isWithinLength()` y se simplificó la comprobación de campos requeridos. La función queda por debajo del límite 10.
- **Complejidad en backend (`complexity`, advertencia):** el callback HTTP concentraba el enrutamiento y el POST completo (complejidad 26). Se separaron `handleRequest`, `handleApiRequest`, `postMessage` y `createMessage`; el enrutador usa un `switch` de endpoints. Cada función queda por debajo del límite 10.
- **Longitud de callbacks de pruebas (`max-lines-per-function`, advertencia):** persisten tres funciones de prueba de 90, 138 y 61 líneas. No son código de producción ni errores del lint. Se pueden dividir en un refactor posterior para mejorar su lectura.

## Resultado final

ESLint analiza 17 archivos y reporta **0 errores y 3 advertencias**. Las reglas activas incluyen `no-unused-vars`, `no-undef`, `eqeqeq`, `no-eval`, complejidad máxima 10 y longitud máxima de función de 50 líneas. El detalle completo está en `reports/eslint.json`.
