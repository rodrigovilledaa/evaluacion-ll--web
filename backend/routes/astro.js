
const express = require('express')
const { actualizarSesion, sesion } = require('../data')

const router = express.Router()

router.use((req, res, next) => {

  actualizarSesion()


  const modificaCarga =
    ['POST', 'PUT', 'DELETE'].includes(req.method) &&
    req.path.startsWith('/carga/')

  if (modificaCarga && sesion.estado !== 'activa') {
    return res.status(409).json({
      mensaje: 'La misión ya no está activa.',
    })
  }

  return next()
})

router.use(require('./inventario'))
router.use(require('./agregar'))
router.use(require('./eliminar'))
router.use(require('./mision'))

module.exports = router
