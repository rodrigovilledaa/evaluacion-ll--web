
import { useEffect, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  Input,
  Row,
  Spinner,
} from 'reactstrap'
import './Astro.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Astro() {
  const [inventario, setInventario] = useState([])
  const [carga, setCarga] = useState({
    creditos: 500,
    itemsCargados: [],
    total: 0,
  })
  const [cantidades, setCantidades] = useState({})
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [mision, setMision] = useState(null)
  const [ahora, setAhora] = useState(0)

  // Consultar inventario, carga y estado de misión.
  async function cargarDatos({ silencioso = false } = {}) {
    try {
      const respuestas = await Promise.all([
        fetch(`${API_URL}/api/inventario`),
        fetch(`${API_URL}/api/carga`),
        fetch(`${API_URL}/api/mision`),
      ])

      if (respuestas.some((respuesta) => !respuesta.ok)) {
        throw new Error('No se pudieron obtener los datos de la misión.')
      }

      const [datosInventario, datosCarga, datosMision] =
        await Promise.all(
          respuestas.map((respuesta) => respuesta.json())
        )

      // Limpiar el error después de recibir los datos correctamente.
      if (!silencioso) setError('')

      setInventario(datosInventario)
      setCarga(datosCarga)
      setMision(datosMision)
      setAhora(Date.now())

      return true
    } catch {
      if (!silencioso) {
        setError(
          'No se pudo conectar con el servidor. Comprueba que el backend siga encendido.'
        )
      }

      return false
    } finally {
      setCargando(false)
    }
  }

useEffect(() => {

  const cargaInicial = setTimeout(() => {
    void cargarDatos()
  }, 0)

  const reloj = setInterval(() => {
    setAhora(Date.now())
  }, 1000)

  const sincronizador = setInterval(() => {
    void cargarDatos({ silencioso: true })
  }, 3000)

  return () => {
    clearTimeout(cargaInicial)
    clearInterval(reloj)
    clearInterval(sincronizador)
  }
}, [])

  async function ejecutarOperacion(url, metodo, datos) {
    if (procesando) return

    if (url.startsWith('/api/carga/') && !misionActiva) {
      setError(
        'La misión no está activa. Inicia una nueva misión para modificar la carga.'
      )
      return
    }

    setError('')
    setMensaje('')
    setProcesando(true)

    try {
      const opciones = {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (datos !== undefined) {
        opciones.body = JSON.stringify(datos)
      }

      const respuesta = await fetch(`${API_URL}${url}`, opciones)
      const resultado = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No se pudo completar la operación.'
        )
      }

      const actualizado = await cargarDatos({
        silencioso: true,
      })

      if (!actualizado) {
        throw new Error(
          'La operación se completó, pero no se pudo actualizar la pantalla.'
        )
      }

      if (url === '/api/mision/reiniciar') {
        setCantidades({})
      }

      setMensaje(
        resultado.mensaje || 'Operación realizada correctamente.'
      )
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado.')
    } finally {
      setProcesando(false)
    }
  }

  function agregarEquipo(equipo) {
    const cantidad = Number(cantidades[equipo.id] || 1)

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setError('La cantidad debe ser un entero mayor que cero.')
      return
    }

    ejecutarOperacion('/api/carga/agregar', 'POST', {
      equipoId: equipo.id,
      cantidad,
    })
  }

  function actualizarCantidad(id, cantidad) {
    ejecutarOperacion(`/api/carga/actualizar-unidades/${id}`, 'PUT', {
      cantidad,
    })
  }

  function eliminarEquipo(id) {
    ejecutarOperacion(`/api/carga/eliminar/${id}`, 'DELETE')
  }

  const creditosDisponibles = carga.creditos - carga.total

  const segundosRestantes =
    mision?.estado === 'activa'
      ? Math.max(0, Math.ceil((mision.venceEn - ahora) / 1000))
      : 0

  const misionActiva =
    mision?.estado === 'activa' && segundosRestantes > 0

  const estadoVisible =
    mision?.estado === 'activa' && !misionActiva
      ? 'expirada'
      : (mision?.estado || 'sin conexión')

  const relojVisible =
    `${String(Math.floor(segundosRestantes / 60)).padStart(2, '0')}:` +
    `${String(segundosRestantes % 60).padStart(2, '0')}`

  if (cargando) {
    return (
      <Container className="astro-container text-center py-5">
        <Spinner />
        <p className="mt-3">Conectando con AstroLogistics...</p>
      </Container>
    )
  }

  return (
    <Container className="astro-container py-4">
      <header className="astro-header mb-4">
        <p className="astro-eyebrow">CENTRO DE OPERACIONES ESPACIALES</p>
        <h1>AstroLogistics</h1>
        <p>Prepara los suministros para tu próxima misión.</p>
      </header>

      {error && <Alert color="danger">{error}</Alert>}
      {mensaje && <Alert color="success">{mensaje}</Alert>}

      <Alert
        color={
          estadoVisible === 'confirmada'
            ? 'success'
            : estadoVisible === 'expirada'
              ? 'warning'
              : 'info'
        }
      >
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <strong>
              Estado de misión: {estadoVisible.toUpperCase()}
            </strong>

            <p className="mb-0">
              {estadoVisible === 'activa'
                ? `Tiempo restante para el lanzamiento: ${relojVisible}`
                : estadoVisible === 'confirmada'
                  ? 'Manifiesto confirmado. El stock quedó asignado a la nave.'
                  : estadoVisible === 'expirada'
                    ? 'Se agotó el tiempo. Inicia una misión nueva.'
                    : 'No se pudo consultar el estado de la misión.'}
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Button
              color="success"
              disabled={
                procesando ||
                !misionActiva ||
                carga.itemsCargados.length === 0
              }
              onClick={() =>
                ejecutarOperacion('/api/mision/confirmar', 'POST')
              }
            >
              Confirmar carga
            </Button>

            <Button
              color="secondary"
              disabled={procesando || !mision}
              onClick={() =>
                ejecutarOperacion('/api/mision/reiniciar', 'POST')
              }
            >
              Nueva misión
            </Button>
          </div>
        </div>
      </Alert>

      <Row className="g-3 mb-4">
        <Col xs="12" md="4">
          <Card className="astro-stat h-100">
            <CardBody>
              <CardText>Presupuesto inicial</CardText>
              <h3>${Number(carga.creditos).toFixed(2)}</h3>
            </CardBody>
          </Card>
        </Col>

        <Col xs="12" md="4">
          <Card className="astro-stat h-100">
            <CardBody>
              <CardText>Créditos disponibles</CardText>
              <h3>${creditosDisponibles.toFixed(2)}</h3>
            </CardBody>
          </Card>
        </Col>

        <Col xs="12" md="4">
          <Card className="astro-stat h-100">
            <CardBody>
              <CardText>Total de la carga</CardText>
              <h3>${Number(carga.total).toFixed(2)}</h3>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <section className="mb-5">
        <div className="astro-section-heading">
          <div>
            <p className="astro-eyebrow">SUMINISTROS DISPONIBLES</p>
            <h2>Catálogo de bodega</h2>
          </div>
          <Badge color="info" pill>
            {inventario.length} productos
          </Badge>
        </div>

        <Row className="g-3">
          {inventario.map((equipo) => (
            <Col xs="12" sm="6" lg="4" key={equipo.id}>
              <Card className="astro-product h-100">
                <CardBody className="d-flex flex-column">
                  <Badge color="secondary" className="align-self-start mb-3">
                    {equipo.categoria}
                  </Badge>

                  <CardTitle tag="h5">{equipo.nombre}</CardTitle>

                  <CardText className="astro-price">
                    ${Number(equipo.precio).toFixed(2)}
                  </CardText>

                  <CardText>
                    Stock disponible: <strong>{equipo.stock}</strong>
                  </CardText>

                  <div className="mt-auto">
                    <label
                      className="form-label"
                      htmlFor={`cantidad-${equipo.id}`}
                    >
                      Cantidad
                    </label>

                    <Input
                      id={`cantidad-${equipo.id}`}
                      type="number"
                      min="1"
                      max={equipo.stock}
                      value={cantidades[equipo.id] ?? 1}
                      disabled={
                        procesando ||
                        !misionActiva ||
                        equipo.stock < 1
                      }
                      onChange={(e) =>
                        setCantidades({
                          ...cantidades,
                          [equipo.id]: e.target.value,
                        })
                      }
                      className="mb-3"
                    />

                    <Button
                      color="primary"
                      block
                      disabled={
                        procesando ||
                        !misionActiva ||
                        equipo.stock < 1
                      }
                      onClick={() => agregarEquipo(equipo)}
                    >
                      {equipo.stock < 1 ? 'Agotado' : 'Agregar a la carga'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section>
        <div className="astro-section-heading mb-3">
          <div>
            <p className="astro-eyebrow">PREPARACIÓN DE LA MISIÓN</p>
            <h2>Mi carga espacial</h2>
          </div>
          <Badge color="success" pill>
            {carga.itemsCargados.length} tipos de suministros
          </Badge>
        </div>

        {carga.itemsCargados.length === 0 ? (
          <Alert color="info">
            Tu carga está vacía. Agrega suministros del catálogo para comenzar.
          </Alert>
        ) : (
          <div className="astro-load-list">
            {carga.itemsCargados.map((item) => {
              const equipo = inventario.find((e) => e.id === item.id)

              if (!equipo) return null

              return (
                <Card className="astro-load-item mb-3" key={item.id}>
                  <CardBody>
                    <Row className="align-items-center g-3">
                      <Col xs="12" md="5">
                        <h5>{equipo.nombre}</h5>
                        <p className="mb-0">
                          ${Number(equipo.precio).toFixed(2)} por unidad
                        </p>
                      </Col>

                      <Col xs="7" md="3">
                        <span className="form-label d-block">
                          Unidades
                        </span>

                        <ButtonGroup
                          size="sm"
                          aria-label={`Unidades de ${equipo.nombre}`}
                        >
                          <Button
                            color="secondary"
                            disabled={procesando || !misionActiva}
                            onClick={() =>
                              actualizarCantidad(item.id, item.cantidad - 1)
                            }
                          >
                            −
                          </Button>

                          <Button color="secondary" disabled>
                            {item.cantidad}
                          </Button>

                          <Button
                            color="secondary"
                            disabled={
                              procesando ||
                              !misionActiva ||
                              equipo.stock === 0
                            }
                            onClick={() =>
                              actualizarCantidad(item.id, item.cantidad + 1)
                            }
                          >
                            +
                          </Button>
                        </ButtonGroup>
                      </Col>

                      <Col xs="5" md="4" className="text-md-end">
                        <p className="astro-price mb-2">
                          ${(equipo.precio * item.cantidad).toFixed(2)}
                        </p>

                        <Button
                          color="danger"
                          outline
                          size="sm"
                          disabled={procesando || !misionActiva}
                          onClick={() => eliminarEquipo(item.id)}
                        >
                          Eliminar
                        </Button>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              )
            })}

            <div className="astro-total">
              <span>Total de suministros</span>
              <strong>${Number(carga.total).toFixed(2)}</strong>
            </div>
          </div>
        )}
      </section>
    </Container>
  )
}

export default Astro
