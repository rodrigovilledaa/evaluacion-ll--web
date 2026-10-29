import { useState } from 'react'
import { Container, Nav, NavItem, NavLink } from 'reactstrap'

import 'bootstrap/dist/css/bootstrap.min.css'

import Reactor from './ejercicio1/Reactor.jsx'
import Astro from './ejercicio2/Astro.jsx'

function App() {
  const [pestana, setPestana] = useState('ejercicio1')

  return (
    <>
      <Container className="pt-3">
        <Nav tabs>
          <NavItem>
            <NavLink
              href="#"
              active={pestana === 'ejercicio1'}
              onClick={(event) => {
                event.preventDefault()
                setPestana('ejercicio1')
              }}
            >
              Ejercicio 1: Reactor
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              href="#"
              active={pestana === 'ejercicio2'}
              onClick={(event) => {
                event.preventDefault()
                setPestana('ejercicio2')
              }}
            >
              Ejercicio 2: AstroLogistics
            </NavLink>
          </NavItem>
        </Nav>
      </Container>

      {/* Ambos componentes conservan su estado al cambiar de pestana. */}
      <div style={{ display: pestana === 'ejercicio1' ? 'block' : 'none' }}>
        <Reactor />
      </div>
      <div style={{ display: pestana === 'ejercicio2' ? 'block' : 'none' }}>
        <Astro />
      </div>
    </>
  )
}

export default App
