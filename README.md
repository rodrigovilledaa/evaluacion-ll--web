# Estabiliza el Reactor

Ejercicio 1 de la Evaluación II de Programación Web, sección 02.

El servidor genera una temperatura objetivo entre 1 y 100. El usuario
envía intentos desde React y recibe una indicación: más alta, más baja
o estabilizado.


## Requisitos

- Node.js compatible con el package-lock.json: ^20.19.0 o >=22.12.0.
- npm y Git.
- Git Flow para el flujo de trabajo del equipo.


## Instalación

Desde la raíz del repositorio:

powershell
npm.cmd ci
npm.cmd --prefix backend ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }


## Ejecutar la aplicación

Terminal 1, desde la raíz:

powershell
npm.cmd --prefix backend start


El backend escucha en http://localhost:3000.

Terminal 2, desde la raíz:

powershell
npm.cmd run dev


Abrir la dirección que indique Vite, normalmente http://localhost:5173/.

Mantener ambas terminales abiertas. Para detener los procesos,
presionar Ctrl + C en cada una.

La dirección del backend se configura con VITE_API_URL en el archivo
.env de la raíz. Las variables VITE_ son públicas: no guardar secretos.

## API

### POST /adjust

Enviar Content-Type: application/json y un cuerpo como:

json
{ "temperatura": 50 }


La temperatura debe ser un número JSON entero entre 1 y 100.

Respuesta 200:

json
{ "mensaje": "más alta" }


También puede responder "más baja" o "estabilizado".

Una temperatura inválida devuelve 400 con un mensaje de validación.

### POST /reboot

No requiere cuerpo. Genera otra temperatura y actualiza el mismo
estado que consulta /adjust.

Respuesta 200:

json
{ "mensaje": "Reactor reiniciado." }


No devuelve la temperatura objetivo ni detiene el proceso de Node.

Al recibir una respuesta exitosa, React limpia el historial, el
mensaje y el input, y permite comenzar otra partida.

Un nuevo sorteo puede repetir el número anterior.

### Rutas no registradas

GET /reboot y las rutas inexistentes responden 404.
El backend no tiene una página en GET /.

## Estado de la aplicación

El backend mantiene una temperatura objetivo compartida en memoria.
No se implementan partidas independientes por usuario.

React mantiene el input, los mensajes, el historial, el estado de
carga y el estado de victoria. El historial muestra todos los intentos,
incluido el acierto.

## Pruebas

Desde la raíz:

powershell
npm.cmd --prefix backend test
npm.cmd run lint
npm.cmd run build


Las pruebas del backend utilizan node:test y peticiones HTTP reales
contra un servidor temporal en un puerto disponible.

Cubren las respuestas de ajuste, las entradas inválidas, el reinicio,
los extremos 1 y 100, la conservación del objetivo entre intentos,
el JSON mal formado y las rutas no registradas.

## Comprobación manual

1. Enviar una temperatura y comprobar la respuesta y el historial.
2. Acertar y comprobar que se bloquea el formulario.
3. Reiniciar y comprobar que se limpia la partida y se habilita el input.
4. Enviar otro intento después del reinicio.
5. Reiniciar también antes de acertar.

## Flujo de trabajo

- main: rama destinada a versiones entregables.
- develop: integración del trabajo del equipo.
- feature/*: desarrollo de funcionalidades desde develop.

La funcionalidad de reinicio se desarrolla en feature/reboot-reactor.
Se publica con Git Flow y se propone su integración mediante un
Pull Request hacia develop.

No subir node_modules, dist ni archivos locales con credenciales.