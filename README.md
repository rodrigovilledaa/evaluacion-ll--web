
# Evaluación II — Programación Web

**Universidad Centroamericana José Simeón Cañas (UCA)**  
**Ciclo 02-2026 | Sección 02**

Proyecto colaborativo de desarrollo de aplicaciones web con integración Frontend-Backend.

Se desarrollaron los dos ejercicios de la evaluación:

1. **Estabiliza el Reactor:** juego de búsqueda de una temperatura objetivo.
2. **AstroLogistics Ltd.:** sistema de inventario y preparación de suministros para una misión espacial.

Ambos ejercicios funcionan desde una aplicación React que consume una API REST desarrollada con Node.js y Express.

---

## 1. Tecnologías utilizadas

### Frontend

- JavaScript
- React
- Vite
- Reactstrap y Bootstrap
- CSS
- Hooks `useState` y `useEffect`
- Fetch API
- Promesas y operaciones asíncronas

### Backend

- Node.js
- Express
- CORS
- API REST
- Datos almacenados en memoria
- Pruebas con `node:test`

### Control de versiones

- Git
- GitHub
- Git Flow
- Ramas `main`, `develop` y `feature/*`
- Pull Requests

No se requiere instalar una base de datos externa.

---

## 2. Requisitos previos

Tener instalados:

- Git
- Node.js
- npm
- Visual Studio Code (recomendado)

La versión de Vite utilizada requiere Node.js `^20.19.0` o `>=22.12.0`.

Comprobar las herramientas:

```powershell
node --version
npm.cmd --version
git --version
```

## 3. Instalación

### Clonar el repositorio

Copiar la dirección HTTPS del repositorio desde GitHub y ejecutar:

```powershell
git clone URL_DEL_REPOSITORIO
```

Sustituir `URL_DEL_REPOSITORIO` por la dirección real y entrar en la carpeta clonada.

Para trabajar con la versión integrada en `develop`:

```powershell
git fetch origin
git switch develop
git pull --ff-only origin develop
```

Estos comandos corresponden a la versión integrada, una vez aceptados los Pull Requests.

### Instalar dependencias

Desde la raíz del proyecto:

```powershell
npm.cmd ci
```

Instalar también las dependencias del backend:

```powershell
npm.cmd --prefix backend ci
```

### Configurar variables de entorno

Copiar el archivo de ejemplo:

```powershell
Copy-Item .env.example .env
```

El archivo `.env` debe contener:

```env
VITE_API_URL=http://localhost:3000
```

No se deben subir archivos con credenciales privadas a GitHub.

## 4. Ejecutar la aplicación

Se necesitan dos terminales.

### Terminal 1 — Backend

Desde la raíz:

```powershell
npm.cmd --prefix backend start
```

Servidor disponible en:

http://localhost:3000

### Terminal 2 — Frontend

Desde la raíz:

```powershell
npm.cmd run dev
```

Abrir la dirección mostrada por Vite, normalmente:

http://localhost:5173/

La aplicación tiene dos pestañas para acceder a los ejercicios.

Para detener cada servidor se utiliza `Ctrl + C`.

---

## 5. Estructura del proyecto

```text
backend/
  server.js
  data.js
  routes/
    astro.js
    inventario.js
    agregar.js
    eliminar.js
    mision.js
  server.test.js
  astro.test.js
  mision.test.js

src/
  App.jsx
  ejercicio1/
    Reactor.jsx
    Reactor.css
  ejercicio2/
    Astro.jsx
    Astro.css

docs/
  GUIA_DEFENSA.md
  PRUEBAS_MANUALES.md

.env.example
package.json
README.md
```

### Responsabilidades principales

- `App.jsx`: navegación entre los ejercicios.
- `Reactor.jsx`: formulario, historial y estado del reactor.
- `Astro.jsx`: interfaz, catálogo, bodega y control de misión.
- `server.js`: configuración de Express y endpoints del reactor.
- `data.js`: inventario, carga, créditos y sesión de misión.
- `routes/`: endpoints de AstroLogistics.
- `*.test.js`: pruebas del backend.

---

# Ejercicio 1 — Estabiliza el Reactor

## 6. Descripción

El servidor genera una temperatura de estabilización aleatoria entre 1 y 100.

El usuario introduce una temperatura y recibe una indicación:

- `más alta`
- `más baja`
- `estabilizado`

React registra los intentos y muestra el estado del reactor.

Cuando se encuentra la temperatura correcta, el formulario se bloquea y aparece el estado `ESTABILIZADO`.

El botón de reinicio comienza otra partida.

## 7. Endpoints del reactor

### POST /adjust

Recibe una temperatura entera entre 1 y 100.

Ejemplo:

```json
{
  "temperatura": 50
}
```

Respuesta HTTP `200`:

```json
{
  "mensaje": "más alta"
}
```

También puede devolver `más baja` o `estabilizado`.

Las temperaturas inválidas generan un error HTTP `400`.

### POST /reboot

Genera nuevamente la temperatura objetivo.

No requiere cuerpo.

Respuesta HTTP `200`:

```json
{
  "mensaje": "Reactor reiniciado."
}
```

Después de una respuesta exitosa, React limpia el historial, la temperatura ingresada y el estado de victoria.

La nueva temperatura no se revela al usuario.

Un nuevo sorteo aleatorio puede producir el mismo número anterior.

---

# Ejercicio 2 — AstroLogistics Ltd.

## 8. Descripción

AstroLogistics permite preparar los suministros de una misión espacial mediante un inventario limitado y un presupuesto.

El capitán puede:

- Consultar suministros.
- Agregar productos a la nave.
- Aumentar o disminuir unidades.
- Eliminar suministros de la carga.
- Consultar el costo total.
- Ver los créditos disponibles.
- Confirmar el equipamiento.
- Consultar el tiempo restante.
- Iniciar una nueva misión.

El presupuesto inicial es de **500 Créditos Galácticos**.

## 9. Inventario inicial

| ID | Producto | Precio | Stock |
|---|---|---:|---:|
| 201 | Tanque de Oxígeno XL | 50 | 5 |
| 202 | Ración de Emergencia | 10 | 20 |
| 203 | Filtro de Agua | 35 | 8 |
| 204 | Panel Solar Plegable | 120 | 3 |
| 205 | Kit Médico Avanzado | 80 | 6 |
| 206 | Traje de Actividad Extravehicular | 200 | 2 |

El stock cambia al agregar, actualizar o eliminar suministros.

## 10. Endpoints obligatorios

### GET /api/inventario

Devuelve la lista de suministros con:

- `id`
- `nombre`
- `precio`
- `stock`
- `categoria`

Respuesta exitosa: HTTP `200`.

### GET /api/carga

Devuelve la carga activa, los créditos iniciales y su costo total.

Ejemplo:

```json
{
  "creditos": 500,
  "itemsCargados": [],
  "total": 0
}
```

Los créditos disponibles se calculan como:

`creditosDisponibles = creditos - total`

### POST /api/carga/agregar

Agrega suministros temporalmente a la nave.

Cuerpo:

```json
{
  "equipoId": 201,
  "cantidad": 1
}
```

Validaciones:

- ID válido.
- Cantidad entera y positiva.
- Producto existente.
- Stock suficiente.
- Presupuesto disponible.
- Misión activa.

Por falta de stock, responde HTTP `400`:

```json
{
  "mensaje": "Stock en base insuficiente"
}
```

### PUT /api/carga/actualizar-unidades/:id

Actualiza la cantidad total de un suministro.

Ejemplo:

```json
{
  "cantidad": 3
}
```

El backend valida stock, presupuesto y cantidad.

Si el costo supera los créditos, responde HTTP `400`:

```json
{
  "mensaje": "Créditos insuficientes para esta cantidad"
}
```

Una cantidad igual a cero elimina el suministro de la carga y devuelve sus unidades al inventario.

### DELETE /api/carga/eliminar/:id

Elimina un suministro completo de la carga.

Las unidades reservadas regresan al inventario general.

Devuelve el estado actualizado de la carga.

---

## 11. Endpoints adicionales de misión

Se añadieron tres endpoints para completar el ciclo de vida de AstroLogistics.

### GET /api/mision

Consulta el estado de la misión.

Devuelve información como:

- `estado`
- `venceEn`
- `duracionMs`
- `tiempoRestanteMs`

### POST /api/mision/confirmar

Confirma definitivamente el equipamiento.

No permite confirmar una carga vacía.

Al confirmar:

- La misión cambia a `confirmada`.
- El stock reservado queda comprometido.
- La carga deja de admitir modificaciones.

### POST /api/mision/reiniciar

Inicia otra misión.

Restablece:

- Estado `activa`.
- Presupuesto inicial.
- Carga vacía.
- Temporizador.

Las reservas de una misión activa se liberan.

El stock de misiones confirmadas permanece comprometido.

---

## 12. Estados de misión

### ACTIVA

Permite agregar, actualizar y eliminar suministros mientras exista tiempo disponible.

### CONFIRMADA

El equipamiento fue confirmado.

Las modificaciones quedan bloqueadas y el stock permanece asignado.

### EXPIRADA

Se terminó la ventana de lanzamiento sin confirmar.

Las reservas temporales regresan al inventario y el capitán debe iniciar una nueva misión.

### Temporizador

Duración predeterminada: **5 minutos**.

El tiempo puede configurarse mediante la variable de entorno `MISION_DURACION_MS`.

Ejemplo de prueba de 30 segundos, ejecutado antes de iniciar el backend:

```powershell
$env:MISION_DURACION_MS="30000"
npm.cmd --prefix backend start
```

La interfaz muestra la cuenta regresiva.

El backend comprueba el estado de la misión y rechaza modificaciones cuando ya no está activa.

Las operaciones incompatibles con el estado pueden generar HTTP `409 Conflict`.

---

## 13. Interfaz de AstroLogistics

La interfaz utiliza componentes de Reactstrap y contiene:

- Panel de información de misión.
- Contador de lanzamiento.
- Presupuesto y créditos disponibles.
- Catálogo de productos.
- Stock y precios.
- Botones para agregar suministros.
- Panel lateral de carga.
- Controles `+` y `−`.
- Botón para eliminar productos.
- Confirmación y reinicio de misión.
- Alertas de validación y errores.

El catálogo y el panel de carga están organizados en columnas adaptables.

React consulta periódicamente el backend para sincronizar la información.

---

## 14. Administración de estados

### Backend

El servidor conserva en memoria:

- Temperatura objetivo.
- Inventario de suministros.
- Artículos cargados.
- Créditos iniciales.
- Estado y vencimiento de misión.

No existe persistencia en una base de datos.

Al reiniciar el proceso de Node.js, los datos vuelven a sus valores iniciales.

La misión y el inventario son compartidos por los clientes conectados al servidor.

### Frontend

React utiliza:

- `useState` para gestionar información de interfaz.
- `useEffect` para sincronización y temporizadores.
- Arreglos y métodos como `map` y `find`.
- `fetch`, `async`, `await` y `Promise.all`.
- Componentes de Reactstrap.

Las pantallas de ambos ejercicios permanecen montadas al cambiar de pestaña, lo que conserva el historial local del reactor mientras la página continúa abierta.

---

## 15. Pruebas automatizadas

Desde la raíz:

```powershell
npm.cmd --prefix backend test
```

Este comando ejecuta las pruebas del reactor, las rutas de AstroLogistics y las reglas del ciclo de vida de misión.

Revisar el frontend:

```powershell
npm.cmd run lint
```

Compilar la aplicación:

```powershell
npm.cmd run build
```

Revisar el formato de los cambios de Git:

```powershell
git diff --check
```

También se deben realizar pruebas manuales de ambos ejercicios.

Consultar `docs/PRUEBAS_MANUALES.md`.

---

## 16. Git Flow

El equipo trabaja mediante ramas:

- `main`: versión de entrega.
- `develop`: rama de integración.
- `feature/*`: funcionalidades individuales.

Cada integrante registra sus cambios en commits.

Las ramas feature se integran mediante Pull Requests hacia `develop`.

La integración final en `main` se coordina entre los integrantes.

---

## 17. Limitaciones conocidas

- El almacenamiento es temporal.
- No existe autenticación.
- No se utiliza base de datos externa.
- Los clientes comparten el estado del backend.
- Existe una sola misión compartida.
- Al reiniciar Node.js se restablecen los datos.

Estas características corresponden al alcance académico del proyecto.

---

## 18. Documentación adicional

- `docs/GUIA_DEFENSA.md`: conceptos y preguntas técnicas.
- `docs/PRUEBAS_MANUALES.md`: lista de comprobaciones de funcionamiento y entrega.

Todos los integrantes deben comprender el funcionamiento general del proyecto para la defensa individual y grupal.
