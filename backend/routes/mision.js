const express = require('express')

const {
  actualizarSesion,
  confirmarMision,
  reiniciarMision,
} = require('../data')

const router = express.Router()

// Consultar el estado y tiempo
router.get('/mision', (_req, res) => {
  return res.json(actualizarSesion())
})

// Confirmar la carga
router.post('/mision/confirmar', (_req, res) => {
  const resultado = confirmarMision()

  if (!resultado.ok) {
    return res.status(resultado.codigo).json({
      mensaje: resultado.mensaje,
    })
  }

  return res.json({
    mensaje: 'Carga confirmada.',
    ...resultado.mision,
  })
})

// Crear misión nueva
router.post('/mision/reiniciar', (_req, res) => {
  return res.json({
    mensaje: 'Nueva misión iniciada.',
    ...reiniciarMision(),
  })
})

module.exports = router