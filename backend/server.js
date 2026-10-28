const express = require('express')
const cors = require('cors')

const app = express()
const port = 3000

function generarTemperatura() {
  return Math.floor(Math.random() * 100) + 1
}


let temperaturaObjetivo = generarTemperatura()

app.use(cors())
app.use(express.json())
app.use('/api', require('./routes/astro'))

app.post('/adjust', (req, res) => {

  const temperatura = req.body?.temperatura

  if (
    !Number.isInteger(temperatura) ||
    temperatura < 1 ||
    temperatura > 100
  ) {
    return res.status(400).json({
      mensaje: 'La temperatura debe ser un número entero entre 1 y 100.',
    })
  }

  if (temperatura < temperaturaObjetivo) {
    return res.json({ mensaje: 'más alta' })
  }

  if (temperatura > temperaturaObjetivo) {
    return res.json({ mensaje: 'más baja' })
  }

  return res.json({ mensaje: 'estabilizado' })
})

app.post('/reboot', (_req, res) => {
  temperaturaObjetivo = generarTemperatura()


  return res.status(200).json({
    mensaje: 'Reactor reiniciado.',
  })
})


if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`)
  })
}

module.exports = app