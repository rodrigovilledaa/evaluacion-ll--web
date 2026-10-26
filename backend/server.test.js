const test = require('node:test')
const assert = require('node:assert/strict')
const { once } = require('node:events')

test('API del reactor: ajustes, reinicio y respuestas HTTP', async (t) => {

  let aleatorio = 0.49
  t.mock.method(Math, 'random', () => aleatorio)

  const app = require('./server')
  app.set('env', 'test')
  const servidor = app.listen(0, '127.0.0.1')

  t.after(() => new Promise((resolve, reject) => {
    servidor.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  }))

  await once(servidor, 'listening')
  const base = `http://127.0.0.1:${servidor.address().port}`

  async function post(ruta, cuerpo) {
    const opciones = {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
    }

    if (cuerpo !== undefined) {
      opciones.headers = { 'Content-Type': 'application/json' }
      opciones.body = JSON.stringify(cuerpo)
    }

    const respuesta = await fetch(`${base}${ruta}`, opciones)
    return {
      status: respuesta.status,
      datos: await respuesta.json(),
    }
  }

  async function comprobarAjuste(temperatura, mensaje) {
    const respuesta = await post('/adjust', { temperatura })
    assert.equal(respuesta.status, 200)
    assert.deepEqual(respuesta.datos, { mensaje })
  }

  await t.test('responde mas alta, mas baja y estabilizado', async () => {
    await comprobarAjuste(49, 'más alta')
    await comprobarAjuste(51, 'más baja')
    await comprobarAjuste(50, 'estabilizado')
    await comprobarAjuste(1, 'más alta')
    await comprobarAjuste(100, 'más baja')
  })

  await t.test('rechaza entradas invalidas con 400', async () => {
    const invalidas = [
      0, 101, -1, 50.5, '50', 'abc',
      true, false, null, [], [50], {}, undefined,
    ]

    for (const temperatura of invalidas) {
      const respuesta = await post('/adjust', { temperatura })
      assert.equal(respuesta.status, 400)
      assert.deepEqual(respuesta.datos, {
        mensaje: 'La temperatura debe ser un número entero entre 1 y 100.',
      })
    }

    assert.equal((await post('/adjust')).status, 400)
  })

  await t.test('reboot cambia el objetivo sin revelarlo', async () => {
    aleatorio = 0.74 
    const respuesta = await post('/reboot')
    assert.equal(respuesta.status, 200)
    assert.deepEqual(respuesta.datos, { mensaje: 'Reactor reiniciado.' })
    await comprobarAjuste(50, 'más alta')
    await comprobarAjuste(75, 'estabilizado')
  })

  await t.test('puede generar los extremos 1 y 100', async () => {
    aleatorio = 0
    assert.equal((await post('/reboot')).status, 200)
    await comprobarAjuste(1, 'estabilizado')

    aleatorio = 0.999999
    assert.equal((await post('/reboot')).status, 200)
    await comprobarAjuste(100, 'estabilizado')
  })

  await t.test('adjust no genera otro objetivo entre intentos', async () => {
    aleatorio = 0.24 
    await comprobarAjuste(100, 'estabilizado')
    await comprobarAjuste(99, 'más alta')
  })

  await t.test('JSON mal formado devuelve 400', async () => {
    const respuesta = await fetch(`${base}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"temperatura":',
      signal: AbortSignal.timeout(5000),
    })
    assert.equal(respuesta.status, 400)
    await respuesta.text()
  })

  await t.test('GET reboot y ruta inexistente devuelven 404', async () => {
    for (const ruta of ['/reboot', '/no-existe']) {
      const respuesta = await fetch(`${base}${ruta}`, {
        signal: AbortSignal.timeout(5000),
      })
      assert.equal(respuesta.status, 404)
      await respuesta.text()
    }
    await comprobarAjuste(100, 'estabilizado')
  })
})