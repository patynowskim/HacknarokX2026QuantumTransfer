import { Outlet, Link } from 'react-router-dom';
import './Simulation.css';

function Simulation() {
  const menuItems = [
    { name: 'Quantum Transfer', path: 'one' },
    { name: 'ML-KEM', path: 'two' },
    { name: 'Eavesdropping', path: 'three' },
    { name: 'PNS', path: 'four' },
    { name: 'DDoS', path: 'five' },
  ];

  return (
    <div className="simulationContainer">
      <div className="simulationNavSection">
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