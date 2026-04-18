import { useState } from 'react'
import './App.css'
import Simulation from './Simulation'
import Docs from './Docs'
import { Button } from 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Routes, Route, Link } from 'react-router-dom';
function App() {

  return (
    <>
    <div className='container text-center w-100 '>
      <div className="row mb-3 w-100">
        <div className="col-12">
          <div className="p-3 bg-primary text-white w-100"><h1>NAZWA PLACEHOLDER</h1></div>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-auto">
          <Link to="/docs">
          <button className='btn btn-primary p-5'>Docs</button>
          </Link>
        </div>
        <div className="col-auto">
          <button className='btn btn-primary p-5'>Simulation</button>
        </div>
      </div>
    </div>
    <Routes>
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/docs" element={<Docs />} />
      </Routes>
    </>



  )
}

export default App
