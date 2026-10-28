
const express = require('express')
const { carga, buscarEquipo, calcularTotal } = require('../data')

const router = express.Router()

// DELETE /api/carga/eliminar/:id
router.delete('/carga/eliminar/:id', (req, res) => {
  // Obtener el ID recibido en la URL
  const id = Number(req.params.id)

  // Validar el identificador
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      mensaje: 'El ID del suministro debe ser un entero positivo.'
    })
  }

  // Buscar el suministro en la carga
  const indice = carga.itemsCargados.findIndex(
    (item) => item.id === id
  )

  if (indice === -1) {
    return res.status(404).json({
      mensaje: 'Ese suministro no está en la carga.'
    })
  }

  // Obtener el equipo y verificar que exista
  const equipo = buscarEquipo(id)

  if (!equipo) {
    return res.status(404).json({
      mensaje: 'Suministro no encontrado.'
    })
  }

  // Recuperar la cantidad que tenía la nave
  const item = carga.itemsCargados[indice]
  const cantidadDevuelta = item.cantidad

  // Devolver las unidades al inventario
  equipo.stock += cantidadDevuelta

  // Eliminar el suministro de la carga
  carga.itemsCargados.splice(indice, 1)

  // Devolver el estado actualizado
  return res.status(200).json({
    creditos: carga.creditos,
    itemsCargados: carga.itemsCargados,
    total: calcularTotal()
  })
})

module.exports = router
