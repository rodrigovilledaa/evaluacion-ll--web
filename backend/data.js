// Datos en memoria del Ejercicio 2 (AstroLogistics).
// Todas las rutas de /api importan este mismo módulo para compartir el estado.

const CREDITOS_INICIALES = 500

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

function buscarEquipo(id) {
  return inventario.find((equipo) => equipo.id === id)
}

function calcularTotal() {
  return carga.itemsCargados.reduce((suma, item) => {
    const equipo = buscarEquipo(item.id)
    return suma + equipo.precio * item.cantidad
  }, 0)
}

module.exports = { inventario, carga, buscarEquipo, calcularTotal }
