import { useState } from 'react'
import './App.css'
import Simulation from './Simulation'
import Docs from './Docs'
import Case from './Case'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className='container text-center mt-5'>
      <div className="row mb-3">
        <div className="col-12">
          <div className="p-3 bg-primary text-white rounded">
            <h1>QTCP</h1>
          </div>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-auto">
          <Link to="/docs">
            <button className='btn btn-primary p-5'>Docs</button>
          </Link>
        </div>
        <div className="col-auto">
          <Link to="/simulation">
            <button className='btn btn-primary p-5'>Simulation</button>
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
        <Route path="one" element={<Case />} />
        <Route path="two" element={<div>Komponent Case 2</div>} />
        <Route path="three" element={<div>Komponent Case 3</div>} />
        <Route path="four" element={<div>Komponent Case 4</div>} />
        <Route path="five" element={<div>Komponent Case 5</div>} />
        <Route path="six" element={<div>Komponent Case 6</div>} />
        <Route path="seven" element={<div>Komponent Case 7</div>} />
        <Route path="eight" element={<div>Komponent Case 8</div>} />
      </Route>
      <Route path="/docs" element={<Docs />} />

    </Routes>
  );
}

export default App;