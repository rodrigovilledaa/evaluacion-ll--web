const express = require('express')
const { carga, buscarEquipo, calcularTotal } = require('../data')

const router = express.Router()

function estadoCarga() {
  return {
    creditos: carga.creditos,
    itemsCargados: carga.itemsCargados,
    total: calcularTotal(),
  }
}

// POST /api/carga/agregar
// Cuerpo: { equipoId: 201, cantidad: 1 }
router.post('/carga/agregar', (req, res) => {
  const { equipoId, cantidad } = req.body ?? {}

  if (!Number.isInteger(equipoId) || !Number.isInteger(cantidad) || cantidad < 1) {
    return res.status(400).json({
      mensaje: 'equipoId y cantidad deben ser números enteros, y la cantidad al menos 1.',
    })
  }

  const equipo = buscarEquipo(equipoId)
  if (!equipo) {
    return res.status(404).json({ mensaje: 'Suministro no encontrado.' })
  }

  if (equipo.stock < cantidad) {
    return res.status(400).json({ mensaje: 'Stock en base insuficiente' })
  }

  if (calcularTotal() + equipo.precio * cantidad > carga.creditos) {
    return res.status(400).json({ mensaje: 'Créditos insuficientes para esta cantidad' })
  }

  const item = carga.itemsCargados.find((i) => i.id === equipoId)
  if (item) {
    item.cantidad += cantidad
  } else {
    carga.itemsCargados.push({ id: equipoId, cantidad })
  }
  equipo.stock -= cantidad

  return res.json(estadoCarga())
})

// PUT /api/carga/actualizar-unidades/:id
// Cuerpo: { cantidad: 3 } (la nueva cantidad total de ese suministro)
router.put('/carga/actualizar-unidades/:id', (req, res) => {
  const id = Number(req.params.id)
  const nuevaCantidad = req.body?.cantidad

  if (!Number.isInteger(id) || !Number.isInteger(nuevaCantidad) || nuevaCantidad < 0) {
    return res.status(400).json({
      mensaje: 'El id y la cantidad deben ser números enteros, y la cantidad no puede ser negativa.',
    })
  }

  const equipo = buscarEquipo(id)
  const posicion = carga.itemsCargados.findIndex((i) => i.id === id)
  if (!equipo || posicion === -1) {
    return res.status(404).json({ mensaje: 'Ese suministro no está en la carga.' })
  }

  const item = carga.itemsCargados[posicion]
  const diferencia = nuevaCantidad - item.cantidad

  if (diferencia > equipo.stock) {
    return res.status(400).json({ mensaje: 'Stock en base insuficiente' })
  }

  if (calcularTotal() + equipo.precio * diferencia > carga.creditos) {
    return res.status(400).json({ mensaje: 'Créditos insuficientes para esta cantidad' })
  }

  equipo.stock -= diferencia
  if (nuevaCantidad === 0) {
    carga.itemsCargados.splice(posicion, 1)
  } else {
    item.cantidad = nuevaCantidad
  }

  return res.json(estadoCarga())
})

module.exports = router