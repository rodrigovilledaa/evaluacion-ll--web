
# Evaluación II — Programación Web

**Universidad Centroamericana José Simeón Cañas (UCA)**  
**Ciclo 02-2026 | Sección 02**

Proyecto colaborativo Frontend–Backend con **React, Vite, Reactstrap, Node.js y Express**. Incluye dos ejercicios: **Estabiliza el Reactor** y **AstroLogistics Ltd.**

## 1. Tecnologías

- **Frontend:** JavaScript, React, Vite, JSX, Reactstrap, Bootstrap y CSS.
- **Backend:** Node.js, Express, CORS y JSON.
- **Comunicación:** `fetch`, promesas, `async/await` y API REST.
- **Estado:** `useState`, `useEffect` y almacenamiento en memoria del servidor.
- **Pruebas:** `node:test`, `oxlint` y compilación con Vite.
- **Colaboración:** Git, Git Flow, GitHub y Pull Requests.

No requiere base de datos externa.

## 2. Requisitos e instalación

Se requiere Git, npm y una versión de Node compatible con el Vite del proyecto (`^20.19.0` o `>=22.12.0`).

```powershell
node --version
npm.cmd --version
git --version
```

Clonar la **versión de entrega** de `main`:

```powershell
git clone https://github.com/rodrigovilledaa/evaluacion-ll--web.git
cd evaluacion-ll--web
git switch main
git pull --ff-only origin main
```

Instalar las dependencias por separado:

```powershell
npm.cmd ci
npm.cmd --prefix backend ci
```

Crear el archivo de configuración local:

```powershell
Copy-Item .env.example .env
```

Contenido de `.env`:

```env
VITE_API_URL=http://localhost:3000
```

`.env` es local y no debe incluirse en Git.

## 3. Ejecutar los dos ejercicios

Abrir **dos terminales** en la raíz del repositorio.

**Terminal 1: backend**

```powershell
npm.cmd --prefix backend start
```

Servidor: `http://localhost:3000`.

**Terminal 2: frontend**

```powershell
npm.cmd run dev
```

Abrir la dirección que indique Vite (normalmente `http://localhost:5173/`). La aplicación ofrece una pestaña para cada ejercicio. Para detener los procesos: `Ctrl + C`.

## 4. Estructura y ubicación del código

```text
backend/
  server.js              Express, /adjust y /reboot, montaje de /api
  data.js                Inventario, carga, créditos y estado de misión
  routes/
    astro.js             Router general y protección de la misión
    inventario.js        GET inventario y carga
    agregar.js           POST agregar y PUT actualizar unidades
    eliminar.js          DELETE eliminar unidades de la carga
    mision.js            GET estado, POST confirmar y reiniciar misión
  server.test.js         Pruebas HTTP del reactor
  astro.test.js          Pruebas HTTP de los 5 endpoints de Astro
  mision.test.js         Pruebas de reglas de misión
src/
  App.jsx                Pestañas y conservación del estado al cambiar
  ejercicio1/
    Reactor.jsx          Interfaz, historial y peticiones del reactor
    Reactor.css          Estilos del reactor
  ejercicio2/
    Astro.jsx            Catálogo, carga, reloj y peticiones HTTP
    Astro.css            Estilos y panel lateral de Astro
.env.example             URL de API para Vite
README.md                Instrucciones y documentación
```

## 5. Ejercicio 1: Estabiliza el Reactor

Al iniciar Express se genera una temperatura objetivo aleatoria **del 1 al 100**, que se guarda en una variable del servidor. React presenta un formulario, registra los intentos y muestra la respuesta. Cuando el usuario acierta, aparece el estado **ESTABILIZADO** y se bloquean nuevos intentos.

| Método | Ruta | Función |
|---|---|---|
| `POST` | `/adjust` | Valida la temperatura entera 1–100 y responde `más alta`, `más baja` o `estabilizado`. |
| `POST` | `/reboot` | Genera otro objetivo y permite iniciar una partida nueva. |

Ejemplo de petición:

```json
{ "temperatura": 50 }
```

Ejemplo de respuesta:

```json
{ "mensaje": "más alta" }
```

Los valores inválidos reciben HTTP `400`. El reinicio exitoso responde `200` y React limpia el historial y el estado de victoria. El servidor no revela la temperatura correcta. Un nuevo sorteo podría coincidir con el anterior.

## 6. Ejercicio 2: AstroLogistics Ltd.

El capitán administra un inventario limitado con **500 créditos galácticos iniciales**. Cada suministro tiene `id`, `nombre`, `precio`, `stock` y `categoria`. Las unidades se reservan temporalmente mientras se prepara la carga.

| ID | Suministro | Precio | Stock inicial |
|---|---|---:|---:|
| 201 | Tanque de Oxígeno XL | 50 | 5 |
| 202 | Ración de Emergencia | 10 | 20 |
| 203 | Filtro de Agua | 35 | 8 |
| 204 | Panel Solar Plegable | 120 | 3 |
| 205 | Kit Médico Avanzado | 80 | 6 |
| 206 | Traje de Actividad Extravehicular | 200 | 2 |

### Cinco endpoints obligatorios

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/api/inventario` | Devuelve todos los suministros disponibles. |
| `GET` | `/api/carga` | Devuelve `{creditos, itemsCargados, total}`. |
| `POST` | `/api/carga/agregar` | Agrega `{equipoId, cantidad}`. Valida stock y créditos. |
| `PUT` | `/api/carga/actualizar-unidades/:id` | Recibe `{cantidad}` como **nueva cantidad total** del suministro. |
| `DELETE` | `/api/carga/eliminar/:id` | Elimina el suministro y devuelve su stock reservado. |

Ejemplo para agregar:

```json
{ "equipoId": 201, "cantidad": 2 }
```

El total se calcula sumando `precio * cantidad` por cada artículo. Los créditos disponibles que muestra React son `creditos - total`. Se devuelve HTTP `400` si falta stock (`Stock en base insuficiente`) o se excede el presupuesto (`Créditos insuficientes para esta cantidad`). Un identificador inexistente puede producir `404`.

En `PUT`, una cantidad de `0` elimina el artículo de la carga y devuelve sus unidades al inventario.

### Control de misión: tres endpoints adicionales

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/api/mision` | Consulta `estado`, `venceEn`, `duracionMs` y `tiempoRestanteMs`. |
| `POST` | `/api/mision/confirmar` | Confirma una carga no vacía y compromete el stock. |
| `POST` | `/api/mision/reiniciar` | Inicia otra misión con carga vacía, 500 créditos y nuevo plazo. |

Los estados son:

- **ACTIVA:** se pueden agregar, actualizar y eliminar suministros.
- **CONFIRMADA:** el manifiesto se cierra y el stock reservado queda comprometido.
- **EXPIRADA:** vence el plazo sin confirmar; se liberan las reservas temporales.

La misión dura **5 minutos por defecto**. El plazo comienza cuando se crea la sesión en el backend y también puede reiniciarse desde la interfaz. Para probar con 30 segundos, iniciar el backend en PowerShell así:

```powershell
$env:MISION_DURACION_MS="30000"
npm.cmd --prefix backend start
```

Después de la prueba, detener Node y eliminar la variable con `Remove-Item Env:\MISION_DURACION_MS -ErrorAction SilentlyContinue`.

**Protección del backend:** `backend/routes/astro.js` ejecuta `actualizarSesion()` antes de procesar solicitudes y rechaza con **HTTP `409 Conflict`** las operaciones `POST`, `PUT` y `DELETE` de `/api/carga/*` si la misión no está activa. El mensaje es `La misión ya no está activa.`. Esto protege las reglas aunque alguien envíe peticiones HTTP sin utilizar React. Las consultas `GET` y el reinicio de misión siguen disponibles.

La interfaz de AstroLogistics utiliza `Card`, `Row`, `Col`, `Badge`, `ListGroup`, `ListGroupItem`, `ButtonGroup` y `UncontrolledAlert` de Reactstrap. Presenta catálogo, bodega lateral, controles `+`/`−`, créditos, total, contador y botones para confirmar o reiniciar misión.

## 7. Pruebas y comprobación de entrega

Desde la raíz, ejecutar:

```powershell
npm.cmd --prefix backend test
npm.cmd run lint
npm.cmd run build
git diff --check
```

También verificar manualmente:

1. Reactor: respuestas, historial, estabilización y reinicio.
2. Astro: inventario, stock, créditos, agregar, actualizar y eliminar.
3. Confirmación de carga y bloqueo visual de los controles.
4. **Bloqueo HTTP real:** tras confirmar, `POST /api/carga/agregar`, `PUT /api/carga/actualizar-unidades/:id` y `DELETE /api/carga/eliminar/:id` deben devolver `409` sin cambiar inventario ni carga.
5. Expirar una misión sin confirmar; repetir el bloqueo HTTP `409` y verificar devolución de stock.
6. Reiniciar misión, comprobar presupuesto, carga y temporizador.
7. Cambiar de pestaña y regresar al reactor sin perder su historial local.
8. Instalar desde un clon limpio de `main` en otra computadora.

**Importante:** las pruebas existentes del backend cubren las rutas y parte del ciclo de misión, pero no reemplazan las comprobaciones HTTP de los nuevos bloqueos `409`.

## 8. Gestión de estado y limitaciones

Los datos del backend residen **en memoria**, sin persistencia. Reiniciar Node restablece inventario, carga, misión y temperatura. No hay autenticación ni sesiones independientes: varios navegadores comparten una misma misión y el mismo inventario. La expiración se verifica cuando el servidor recibe solicitudes; no existe un proceso separado que expire la misión sin ninguna petición.

React utiliza `useState` para historial, formularios, datos y mensajes, y `useEffect` para sincronizar datos y temporizadores. Las dos vistas permanecen montadas al cambiar de pestaña; esto conserva el historial del reactor mientras la página esté abierta.

## 9. Git Flow y defensa

- `feature/*`: desarrollo individual y commits de funcionalidades.
- `develop`: integración y pruebas del equipo.
- `main`: versión final entregable.


