
import { useEffect, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
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

  async function cargarDatos() {
    setError('')

    try {
      const [respuestaInventario, respuestaCarga] = await Promise.all([
        fetch(`${API_URL}/api/inventario`),
        fetch(`${API_URL}/api/carga`),
      ])

      if (!respuestaInventario.ok || !respuestaCarga.ok) {
        throw new Error('No se pudieron obtener los datos de la bodega.')
      }

      const datosInventario = await respuestaInventario.json()
      const datosCarga = await respuestaCarga.json()

      setInventario(datosInventario)
      setCarga(datosCarga)
    } catch (err) {
      setError(
        'No se pudo conectar con el servidor. Comprueba que el backend siga encendido.'
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  async function ejecutarOperacion(url, metodo, datos) {
    setError('')
    setMensaje('')
    setProcesando(true)

    try {
      const opciones = {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
      }

      if (datos !== undefined) {
        opciones.body = JSON.stringify(datos)
      }

      const respuesta = await fetch(`${API_URL}${url}`, opciones)
      const resultado = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'No se pudo completar la operación.')
      }

      await cargarDatos()
      setMensaje('Operación realizada correctamente.')
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
          <Badge color="info" pill>{inventario.length} productos</Badge>
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
                      disabled={procesando || equipo.stock < 1}
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
                      disabled={procesando || equipo.stock < 1}
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
                        <label
                          className="form-label"
                          htmlFor={`unidades-${item.id}`}
                        >
                          Unidades
                        </label>
                        <Input
                          id={`unidades-${item.id}`}
                          type="number"
                          min="1"
                          value={item.cantidad}
                          disabled={procesando}
                          onChange={(e) => {
                            const valor = e.target.value
                            if (valor === '') return

                            const nuevaCantidad = Number(valor)
                            if (
                              Number.isInteger(nuevaCantidad) &&
                              nuevaCantidad >= 1
                            ) {
                              actualizarCantidad(item.id, nuevaCantidad)
                            }
                          }}
                        />
                      </Col>

                      <Col xs="5" md="4" className="text-md-end">
                        <p className="astro-price mb-2">
                          ${(equipo.precio * item.cantidad).toFixed(2)}
                        </p>
                        <Button
                          color="danger"
                          outline
                          size="sm"
                          disabled={procesando}
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
