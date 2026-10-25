const express = require('express')
const cors = require('cors')

const app = express()
const port = 3000

// Se genera una vez cuando inicia el servidor.
const temperaturaObjetivo = Math.floor(Math.random() * 100) + 1

app.use(cors())
app.use(express.json())

app.post('/adjust', (req, res) => {
  const temperatura = Number(req.body?.temperatura)

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

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`)
})
