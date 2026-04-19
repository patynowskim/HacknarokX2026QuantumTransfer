import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './Docs.css'
import DocsOverview from './DocsOverview'
import BB84Docs from './BB84Docs'
import MLKEMDocs from './MLKEMDocs'

function Docs() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
    <div className='navSection'>
      <Link to='/'>
        <img src='/logo.png' alt='logo, nawigacja do strony głównej' />
      </Link>
      <h2>Docs</h2>
      <hr />
      <ul>
        <li>
          <Link to="/docs/overview" className={isActive('/docs/overview')}>
            Start
          </Link>
        </li>
        <li>
          <Link to="/docs/bb84" className={isActive('/docs/bb84')}>
            BB-84
          </Link>
        </li>
        <li>
          <Link to="/docs/mlkem" className={isActive('/docs/mlkem')}>
            ML-KEM
          </Link>
        </li>
      </ul>
    </div>
    <Routes>
      <Route path="/overview" element={<DocsOverview />} />
      <Route path="/bb84" element={<BB84Docs />} />
      <Route path="/mlkem" element={<MLKEMDocs />} />
      <Route path="/" element={<DocsOverview />} />
    </Routes>
    </>
  )
}

export default Docs