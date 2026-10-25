
import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000";

function App() {
  const [temperatura, setTemperatura] = useState("");
  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState("Esperando ajuste...");
  const [estabilizado, setEstabilizado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function registrarIntento(evento) {
    evento.preventDefault();

    const valor = Number(temperatura);

    if (!Number.isInteger(valor) || valor < 1 || valor > 100) {
      setMensaje("Ingresa un número entero entre 1 y 100.");
      return;
    }

    if (estabilizado || cargando) {
      return;
    }

    setHistorial((anterior) => [...anterior, valor]);
    setCargando(true);
    setMensaje("Comprobando temperatura...");

    try {
      const respuesta = await fetch(`${API_URL}/adjust`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ temperatura: valor }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || "No se pudo ajustar el reactor.");
      }

      setMensaje(resultado.mensaje);
      setEstabilizado(resultado.estabilizado === true);
    } catch (error) {
      setMensaje(
        error.message === "Failed to fetch"
          ? "No se pudo conectar con el servidor."
          : error.message
      );
    } finally {
      setCargando(false);
    }
  }

  async function reiniciarReactor() {
    if (cargando) {
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/reboot`, {
        method: "POST",
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || "No se pudo reiniciar el reactor.");
      }

      setTemperatura("");
      setHistorial([]);
      setEstabilizado(false);
      setMensaje(resultado.mensaje || "Reactor reiniciado. Intenta de nuevo.");
    } catch (error) {
      setMensaje(
        error.message === "Failed to fetch"
          ? "No se pudo conectar con el servidor."
          : error.message
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="contenedor">
      <h1>Estabiliza el Reactor</h1>

      <p>Ingresa una temperatura entre 1 y 100.</p>

      <form onSubmit={registrarIntento}>
        <label htmlFor="temperatura">Temperatura:</label>

        <input
          id="temperatura"
          type="number"
          min="1"
          max="100"
          step="1"
          value={temperatura}
          onChange={(evento) => setTemperatura(evento.target.value)}
          required
          disabled={estabilizado || cargando}
        />

        <button
          type="submit"
          disabled={estabilizado || cargando}
        >
          {cargando ? "Procesando..." : "Ajustar temperatura"}
        </button>

        <button
          type="button"
          onClick={reiniciarReactor}
          disabled={cargando}
        >
          Reiniciar reactor
        </button>
      </form>

      <p role="status">{mensaje}</p>

      <h2>Historial de intentos</h2>

      {historial.length === 0 ? (
        <p>Aún no hay intentos.</p>
      ) : (
        <ul>
          {historial.map((intento, indice) => (
            <li key={`${indice}-${intento}`}>
              Intento {indice + 1}: {intento}
            </li>
          ))}
        </ul>
      )}

      <h2>Estado del reactor</h2>

      <p>{estabilizado ? "Estabilizado" : "Pendiente"}</p>
    </main>
  );
}

export default App;
