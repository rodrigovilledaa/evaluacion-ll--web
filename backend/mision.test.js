const test = require('node:test')
const assert = require('node:assert/strict')

const {
  inventario,
  carga,
  sesion,
  buscarEquipo,
  actualizarSesion,
  confirmarMision,
  reiniciarMision,
} = require('./data')

const stockInicial = inventario.map(({ id, stock }) => ({
  id,
  stock,
}))

function prepararPrueba() {
  for (const original of stockInicial) {
    buscarEquipo(original.id).stock = original.stock
  }

  carga.itemsCargados.length = 0
  sesion.estado = 'expirada'
  reiniciarMision()
}

test('al expirar devuelve las reservas y cierra la misión', () => {
  prepararPrueba()

  buscarEquipo(201).stock -= 2
  carga.itemsCargados.push({ id: 201, cantidad: 2 })

  sesion.venceEn = Date.now() - 1

  assert.equal(actualizarSesion().estado, 'expirada')
  assert.equal(buscarEquipo(201).stock, 5)
  assert.equal(carga.itemsCargados.length, 0)
})

test('confirmar compromete el stock y no lo devuelve al expirar', () => {
  prepararPrueba()

  buscarEquipo(201).stock -= 1
  carga.itemsCargados.push({ id: 201, cantidad: 1 })

  assert.equal(confirmarMision().ok, true)

  sesion.venceEn = Date.now() - 1

  assert.equal(actualizarSesion().estado, 'confirmada')
  assert.equal(buscarEquipo(201).stock, 4)
  assert.equal(confirmarMision().codigo, 409)

  reiniciarMision()

  assert.equal(buscarEquipo(201).stock, 4)
})

test('no confirma una carga vacía', () => {
  prepararPrueba()

  assert.equal(confirmarMision().codigo, 400)
})

test('reiniciar una sesión activa libera reservas y restablece créditos', () => {
  prepararPrueba()

  buscarEquipo(202).stock -= 3
  carga.itemsCargados.push({ id: 202, cantidad: 3 })
  carga.creditos = 100

  const estado = reiniciarMision()

  assert.equal(estado.estado, 'activa')
  assert.ok(estado.tiempoRestanteMs > 0)
  assert.equal(carga.creditos, 500)
  assert.equal(carga.itemsCargados.length, 0)
  assert.equal(buscarEquipo(202).stock, 20)
})