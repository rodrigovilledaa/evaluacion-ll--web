const express = require('express')
const { inventario, carga, calcularTotal } = require('../data')

const router = express.Router()

router.get('/inventario', (_req, res) => {
  res.json(inventario)
})

router.get('/carga', (_req, res) => {
  res.json({
    creditos: carga.creditos,
    itemsCargados: carga.itemsCargados,
    total: calcularTotal(),
  })
})

module.exports = router
