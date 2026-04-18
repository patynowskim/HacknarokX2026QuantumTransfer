import { Outlet, Link } from 'react-router-dom';
import './Simulation.css';

function Simulation() {
  const menuItems = [
    { name: 'Quantum Transfer', path: 'QuantumTransfer' },
    { name: 'ML-KEM', path: 'MLKEM' },
    { name: 'Eavesdropping', path: 'Eavesdropping' },
    { name: 'PNS', path: 'PNS' },
    { name: 'DDoS', path: 'DDoS' },
  ];

  return (
    <div className="simulationContainer">
      <div className="simulationNavSection">
        <Link to='/'>
      <img src='/logo.png' alt='logo, nawigacja do strony głównej' /></Link>
        <h2>Symulacja</h2>
        <hr />
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link to={item.path}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="simulationMain">
        <Outlet />
      </div>
    </div>
  );
}

export default Simulation;