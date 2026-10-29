// Estado compartido en memoria para AstroLogistics una a la vez
const CREDITOS_INICIALES = 500
const duracionConfigurada = Number(process.env.MISION_DURACION_MS)

const DURACION_MISION_MS =
  Number.isFinite(duracionConfigurada) && duracionConfigurada > 0
    ? duracionConfigurada
    : 5 * 60 * 1000

const inventario = [
  { id: 201, nombre: 'Tanque de Oxígeno XL', precio: 50.0, stock: 5, categoria: 'Soporte Vital' },
  { id: 202, nombre: 'Ración de Emergencia', precio: 10.0, stock: 20, categoria: 'Alimentos' },
  { id: 203, nombre: 'Filtro de Agua', precio: 35.0, stock: 8, categoria: 'Soporte Vital' },
  { id: 204, nombre: 'Panel Solar Plegable', precio: 120.0, stock: 3, categoria: 'Energía' },
  { id: 205, nombre: 'Kit Médico Avanzado', precio: 80.0, stock: 6, categoria: 'Medicina' },
  { id: 206, nombre: 'Traje de Actividad Extravehicular', precio: 200.0, stock: 2, categoria: 'Equipo' },
]

const carga = {
  creditos: CREDITOS_INICIALES,
  itemsCargados: [],
}

const sesion = {
  estado: 'activa',
  venceEn: Date.now() + DURACION_MISION_MS,
}

function buscarEquipo(id) {
  return inventario.find((equipo) => equipo.id === id)
}

function calcularTotal() {
  return carga.itemsCargados.reduce((suma, item) => {
    const equipo = buscarEquipo(item.id)
    return suma + equipo.precio * item.cantidad
  }, 0)
}

// Devolver al inventario las unidades que estan reservadas
function liberarReservas() {
  for (const item of carga.itemsCargados) {
    const equipo = buscarEquipo(item.id)

    if (equipo) {
      equipo.stock += item.cantidad
    }
  }

  carga.itemsCargados.length = 0
}

// Devolver la informacion actual
function estadoMision() {
  return {
    estado: sesion.estado,
    venceEn: sesion.venceEn,
    duracionMs: DURACION_MISION_MS,
    tiempoRestanteMs:
      sesion.estado === 'activa'
        ? Math.max(0, sesion.venceEn - Date.now())
        : 0,
  }
}

// Verificar si ya terminó la ventana del lanzamiento
function actualizarSesion() {
  if (
    sesion.estado === 'activa' &&
    Date.now() >= sesion.venceEn
  ) {
    liberarReservas()
    sesion.estado = 'expirada'
  }

  return estadoMision()
}

function confirmarMision() {
  actualizarSesion()

  if (sesion.estado !== 'activa') {
    return {
      ok: false,
      codigo: 409,
      mensaje: 'La misión ya no está activa.',
    }
  }

  if (carga.itemsCargados.length === 0) {
    return {
      ok: false,
      codigo: 400,
      mensaje: 'Agrega suministros antes de confirmar la carga.',
    }
  }

  sesion.estado = 'confirmada'

  // El stock reservado queda definitivamente asignado
  return {
    ok: true,
    mision: estadoMision(),
  }
}

function reiniciarMision() {
  actualizarSesion()

  if (sesion.estado === 'activa') {
    liberarReservas()
  }

  // El stock de una mision confirmada permanece comprometido
  carga.itemsCargados.length = 0
  carga.creditos = CREDITOS_INICIALES

  sesion.estado = 'activa'
  sesion.venceEn = Date.now() + DURACION_MISION_MS

  return estadoMision()
}

module.exports = {
  inventario,
  carga,
  sesion,
  buscarEquipo,
  calcularTotal,
  estadoMision,
  actualizarSesion,
  confirmarMision,
  reiniciarMision,
}