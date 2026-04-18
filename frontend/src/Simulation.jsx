import { useState } from 'react'
import './Simulation.css'
import { Link } from 'react-router-dom';

function Simulation() {
const menuItems = [
    { name: 'Case One', path: '/one' },
    { name: 'Case Two', path: '/two' },
    { name: 'Case Three', path: '/three' },
    { name: 'Case Four', path: '/four' },
    { name: 'Case Five', path: '/five' },
    { name: 'Case Six', path: '/six' },
    { name: 'Case Seven', path: '/seven' },
    { name: 'Case Eight', path: '/eight' },
  ];
  return (
    <>
    <div className='w-100 bg-primary text-center container p-3 rounded text-white mt-3'>
      <h1>Simulation</h1>
    </div>

    </>
  )
}

export default Simulation
