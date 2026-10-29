
const test = require('node:test')
const assert = require('node:assert/strict')
const { once } = require('node:events')

const app = require('./server')
const { inventario, carga } = require('./data')

// Guardar el stock inicial para cada prueba
const stockInicial = inventario.map((equipo) => ({
  id: equipo.id,
  stock: equipo.stock
}))

function reiniciarDatos() {
  carga.creditos = 500
  carga.itemsCargados.length = 0

  inventario.forEach((equipo) => {
    const original = stockInicial.find(
      (item) => item.id === equipo.id
    )
    equipo.stock = original.stock
  })
}

test('API AstroLogistics - cinco endpoints', async (t) => {
  const servidor = app.listen(0, '127.0.0.1')
  
  t.after(() => new Promise((resolve, reject) => {
    servidor.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  }))

  await once(servidor, 'listening')

  const base = `http://127.0.0.1:${servidor.address().port}`

  async function peticion(ruta, metodo = 'GET', cuerpo) {
    const opciones = { method: metodo }

    if (cuerpo !== undefined) {
      opciones.headers = {
        'Content-Type': 'application/json'
      }
      opciones.body = JSON.stringify(cuerpo)
    }

    const respuesta = await fetch(`${base}${ruta}`, opciones)

    return {
      status: respuesta.status,
      datos: await respuesta.json()
    }
  }

  // Prueba 1: GET inventario y carga
  await t.test('Obtener inventario y carga', async () => {
    reiniciarDatos()

    const inventarioRes = await peticion('/api/inventario')
    assert.equal(inventarioRes.status, 200)
    assert.ok(Array.isArray(inventarioRes.datos))

    const cargaRes = await peticion('/api/carga')
    assert.equal(cargaRes.status, 200)
    assert.equal(cargaRes.datos.total, 0)
    assert.deepEqual(cargaRes.datos.itemsCargados, [])
  })

  // Prueba 2: POST agregar y validar stock
  await t.test('Agregar suministros', async () => {
    reiniciarDatos()

    const respuesta = await peticion(
      '/api/carga/agregar',
      'POST',
      { equipoId: 201, cantidad: 2 }
    )

    assert.equal(respuesta.status, 200)
    assert.equal(respuesta.datos.total, 100)

    const equipo = inventario.find((e) => e.id === 201)
    assert.equal(equipo.stock, 3)

    const error = await peticion(
      '/api/carga/agregar',
      'POST',
      { equipoId: 201, cantidad: 10 }
    )

    assert.equal(error.status, 400)
    assert.equal(error.datos.mensaje, 'Stock en base insuficiente')
  })

  // Prueba 3: PUT actualizar y validar créditos
  await t.test('Actualizar unidades', async () => {
    reiniciarDatos()

    await peticion('/api/carga/agregar', 'POST', {
      equipoId: 204,
      cantidad: 3
    })

    await peticion('/api/carga/agregar', 'POST', {
      equipoId: 201,
      cantidad: 2
    })

    // El total es 460; subir a 3 tanques costaría 510
    const error = await peticion(
      '/api/carga/actualizar-unidades/201',
      'PUT',
      { cantidad: 3 }
    )

    assert.equal(error.status, 400)
    assert.equal(
      error.datos.mensaje,
      'Créditos insuficientes para esta cantidad'
    )

    // Reducir la cantidad sí debe funcionar
    const resultado = await peticion(
      '/api/carga/actualizar-unidades/201',
      'PUT',
      { cantidad: 1 }
    )

    assert.equal(resultado.status, 200)
    assert.equal(resultado.datos.total, 410)
  })

  // Prueba 4: DELETE y devolución al inventario
  await t.test('Eliminar y devolver stock', async () => {
    reiniciarDatos()

    await peticion('/api/carga/agregar', 'POST', {
      equipoId: 201,
      cantidad: 2
    })

    const respuesta = await peticion(
      '/api/carga/eliminar/201',
      'DELETE'
    )

    assert.equal(respuesta.status, 200)
    assert.equal(respuesta.datos.total, 0)
    assert.deepEqual(respuesta.datos.itemsCargados, [])

    const equipo = inventario.find((e) => e.id === 201)
    assert.equal(equipo.stock, 5)
  })

  // Prueba 5: errores al eliminar
  await t.test('Validar errores de eliminación', async () => {
    reiniciarDatos()

    const inexistente = await peticion(
      '/api/carga/eliminar/999',
      'DELETE'
    )

    assert.equal(inexistente.status, 404)

    const invalido = await peticion(
      '/api/carga/eliminar/abc',
      'DELETE'
    )

    assert.equal(invalido.status, 400)
  })

  reiniciarDatos()
})
