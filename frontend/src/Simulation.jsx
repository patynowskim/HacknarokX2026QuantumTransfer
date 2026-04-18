import { Outlet, Link } from 'react-router-dom';
import './Simulation.css';

function Simulation() {
  const menuItems = [
    { name: 'Case One', path: 'one' },
    { name: 'Case Two', path: 'two' },
    { name: 'Case Three', path: 'three' },
    { name: 'Case Four', path: 'four' },
    { name: 'Case Five', path: 'five' },
  ];

  return (
    <div className="d-flex flex-column vh-100 bg-dark">
      <div className='w-100 bg-primary text-center p-3 text-white border-bottom border-secondary'>
        <h1 className="m-0">Simulation</h1>
      </div>

      <div className="d-flex flex-grow-1 overflow-hidden">
                <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-primary h-100" style={{ width: '280px' }}>
          <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
            <span className="fs-4">Menu Główne</span>
          </a>
          <hr />
          <ul className="nav nav-pills flex-column mb-auto overflow-auto">
            {menuItems.map((item, index) => (
              <li className="nav-item mb-2" key={index}>
                <Link 
                  to={item.path} 
                  className="nav-link text-white btn btn-outline-primary text-start border-0 py-3 w-100"
                  style={{ transition: '0.3s' }}
                  onMouseOver={(e) => e.target.classList.add('bg-dark')}
                  onMouseOut={(e) => e.target.classList.remove('bg-dark')}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className='simulationMain flex-grow-1 bg-light overflow-auto text-primary'>
          <Outlet />
        </div>

      </div>
    </div>
  )
}

export default Simulation;