import { useState } from 'react'
import './App.css'
import Simulation from './Simulation'
import Docs from './Docs'
import CaseOne from './cases/CaseOne'
import CaseTwo from './cases/CaseTwo'
import CaseThree from './cases/CaseThree'
import CaseFour from './cases/CaseFour'
import CaseFive from './cases/CaseFive'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className='container text-center mt-5 w-100'>
      <div className="row mb-3">
        <div className="col-12">
          <img src='logo.png' alt='logo projektu' className='mb-4' style={{ maxWidth: '30%' }} />
          <h1 className='mb-3'>QTCP - Quantum Transmission Control Protocol</h1>
          <p className='lead mb-4 w-100'>Bezpieczna wymiana kluczy kryptograficznych w erze komputerów kwantowych</p>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-auto">
          <Link to="/docs">
            <button className='btn btn-secondary p-2'>Docs</button>
          </Link>
        </div>
        <div className="col-auto">
          <Link to="/simulation/QuantumTransfer">
            <button className='btn btn-secondary p-2'>Simulation</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/simulation" element={<Simulation />}>        
        <Route path="QuantumTransfer" element={<CaseOne />} />
        <Route path="MLKEM" element={<CaseTwo />} />
        <Route path="Eavesdropping" element={<CaseThree />} />
        <Route path="PNS" element={<CaseFour/>} />
        <Route path="DDoS" element={<CaseFive/>} />
      </Route>
      <Route path="/docs/*" element={<Docs />} />

    </Routes>
  );
}

export default App;