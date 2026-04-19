import { Link } from 'react-router-dom';

function BB84Docs() {
  return (
    <div className='documentation'>
      <h1>Dokumentacja BB-84</h1>
      
      <section>
        <h3>Wstęp do Protokołu BB-84</h3>
        <p>Zawartość do uzupełnienia...</p>
      </section>

      <div className="row justify-content-center mt-4">
        <div className="col-auto">
          <Link to="/">
            <button className='btn btn-secondary p-2'>Strona główna</button>
          </Link>
        </div>
        <div className="col-auto">
          <Link to="/simulation">
            <button className='btn btn-secondary p-2'>Symulacja</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BB84Docs;
