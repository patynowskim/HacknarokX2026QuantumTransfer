import { Outlet, Link } from 'react-router-dom';
import './Simulation.css';

function Simulation() {
  const menuItems = [
    { name: 'Case One', path: 'one' },
    { name: 'Case Two', path: 'two' },
    { name: 'Case Three', path: 'three' },
    { name: 'Case Four', path: 'four' },
    { name: 'Case Five', path: 'five' },
    { name: 'Case Six', path: 'six' },
    { name: 'Case Seven', path: 'seven' },
    { name: 'Case Eight', path: 'eight' },
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