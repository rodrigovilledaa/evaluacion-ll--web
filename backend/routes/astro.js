const express = require('express')

const router = express.Router()

router.use(require('./inventario'))
router.use(require('./agregar'))
router.use(require('./eliminar'))
router.use(require('./mision'))

module.exports = router
