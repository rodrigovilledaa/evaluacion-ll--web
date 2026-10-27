
import { useState, useEffect } from 'react'
import {
  Button,
  Input,
  Form,
  FormGroup,
  Label,
  Alert,
  Badge,
  Card,
  CardBody
} from 'reactstrap'

import 'bootstrap/dist/css/bootstrap.min.css'
import './Reactor.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Reactor() {

  const [temperatura, setTemperatura] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [historial, setHistorial] = useState([])
  const [estabilizado, setEstabilizado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = estabilizado
      ? 'Reactor estabilizado'
      : 'Estabiliza el Reactor'
  }, [estabilizado])

  async function handleSubmit(event) {
    event.preventDefault()

    if (cargando || estabilizado) return

    const numero = Number(temperatura)

    if (
      temperatura === '' ||
      !Number.isInteger(numero) ||
      numero < 1 ||
      numero > 100
    ) {
      setError('Ingresa un número entero entre 1 y 100.')
      return
    }

    setCargando(true)
    setError('')
    setMensaje('')

    try {
      const respuesta = await fetch(`${API_URL}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          temperatura: numero
        })
      })

      const datos = await respuesta.json().catch(() => ({}))

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || 'No se pudo ajustar el reactor.'
        )
      }

      const mensajesValidos = [
        'más alta',
        'más baja',
        'estabilizado'
      ]

      if (!mensajesValidos.includes(datos.mensaje)) {
        throw new Error(
          'El backend devolvió un mensaje no reconocido.'
        )
      }

      setMensaje(datos.mensaje)


      setHistorial(anterior => [
        ...anterior,
        {
          temperatura: numero,
          resultado: datos.mensaje
        }
      ])

      if (datos.mensaje === 'estabilizado') {
        setEstabilizado(true)
      }

      setTemperatura('')

    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  async function handleReboot() {
    if (cargando) return

    setCargando(true)
    setError('')

    try {
      const respuesta = await fetch(`${API_URL}/reboot`, {
        method: 'POST'
      })

      if (!respuesta.ok) {
        throw new Error('No se pudo reiniciar el reactor.')
      }

      
      setTemperatura('')
      setMensaje('')
      setHistorial([])
      setEstabilizado(false)

    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="pagina">

      <div className="contenedor">

        <header className="encabezado">
          <p className="subtitulo">CENTRO DE CONTROL</p>
          <h1>Estabiliza el Reactor</h1>
          <p>
            Encuentra la temperatura ideal entre 1 y 100
          </p>
        </header>

        <div className="paneles">

          <Card className="panel-reactor">
            <CardBody>

              <div className="estado">
                <Badge color={estabilizado ? 'success' : 'warning'}>
                  {estabilizado ? 'ESTABILIZADO' : 'INESTABLE'}
                </Badge>
              </div>

              <div
                className={
                  estabilizado
                    ? 'reactor reactor-exito'
                    : 'reactor'
                }
              >
                {estabilizado ? '✓' : '⚛'}
              </div>

              <h2 className="titulo-panel">
                {estabilizado
                  ? '¡Reactor estabilizado!'
                  : 'Control de temperatura'}
              </h2>

              <Form onSubmit={handleSubmit}>

                <FormGroup>
                  <Label for="temperatura">
                    Temperatura a ingresar
                  </Label>

                  <Input
                    id="temperatura"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    placeholder="Ejemplo: 50"
                    value={temperatura}
                    onChange={(event) =>
                      setTemperatura(event.target.value)
                    }
                    disabled={estabilizado || cargando}
                    required
                  />
                </FormGroup>

                <Button
                  type="submit"
                  color="primary"
                  className="boton-principal"
                  disabled={
                    estabilizado ||
                    cargando ||
                    temperatura === ''
                  }
                >
                  {cargando
                    ? 'Procesando...'
                    : 'Ajustar temperatura'}
                </Button>

              </Form>

              {mensaje && (
                <Alert
                  className="aviso"
                  color={
                    estabilizado
                      ? 'success'
                      : mensaje === 'más alta'
                        ? 'info'
                        : 'warning'
                  }
                >
                  <strong>Respuesta del servidor:</strong>
                  {' '}{mensaje}
                </Alert>
              )}

              {error && (
                <Alert className="aviso" color="danger">
                  {error}
                </Alert>
              )}

              <Button
                color="secondary"
                outline
                className="boton-reiniciar"
                onClick={handleReboot}
                disabled={cargando}
              >
                Reiniciar reactor
              </Button>

            </CardBody>
          </Card>

          <Card className="panel-historial">
            <CardBody>

              <h2>Historial de intentos</h2>

              <p className="descripcion">
                Temperaturas ingresadas durante la sesión
              </p>

              <Badge color="info">
                Intentos: {historial.length}
              </Badge>

              {historial.length === 0 ? (
                <p className="sin-intentos">
                  Todavía no has ingresado temperaturas.
                </p>
              ) : (
                <ul className="lista-historial">

                  {historial.map((intento, indice) => (
                    <li key={indice}>

                      <span>
                        #{indice + 1} — {intento.temperatura} °C
                      </span>

                      <Badge
                        color={
                          intento.resultado === 'estabilizado'
                            ? 'success'
                            : 'secondary'
                        }
                      >
                        {intento.resultado}
                      </Badge>

                    </li>
                  ))}

                </ul>
              )}

            </CardBody>
          </Card>

        </div>

      </div>

    </main>
  )
}

export default Reactor
