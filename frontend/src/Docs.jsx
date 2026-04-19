import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import './Docs.css'

function Docs() {

  return (
    <>
    <div className='navSection'><Link to='/'>
      <img src='/logo.png' alt='logo, nawigacja do strony głównej' /></Link>
      <h2>Docs</h2>
        <hr />
      <ul>
        
        <li><a href="#intro">Wstęp: Komputery kwantowe</a></li>
        <li><a href="#protocol">Protokół QTCP</a></li>
        <li><a href="#purpose">Cel projektu</a></li>
        <li><a href="#how-it-works">Mechanizm działania</a></li>
        <li><a href="#advantages">Zalety</a></li>
        <li><a href="#why-it-works">Podstawy techniczne</a></li>
        <li><a href="#use-cases">Scenariusze i Edge Cases</a></li>
      </ul>
    </div>
    <div className='documentation'> 
      <h1>Dokumentacja QTCP</h1>
      
      <section id="intro">
        <h3>Wstęp: Komputery kwantowe</h3>
        <p>Klasyczne komputery operują na bitach (0 lub 1). Komputery kwantowe wykorzystują kubity, które dzięki superpozycji mogą wykonywać wybrane operacje w złoności polinomialnej. Pozwala to na wykonywanie obliczeń, które są niewykonalne dla obecnych maszyn, w tym na błyskawiczne łamanie tradycyjnych szyfrów asymetrycznych.</p>
      </section>

      <section id="protocol">
        <h3>Protokół QTCP</h3>
        <p>QTCP (Quantum Transmission Control Protocol) to protokół warstwy komunikacyjnej przeznaczony do bezpiecznej wymiany kluczy kryptograficznych w relacjach serwer-serwer. Służy do zabezpieczenia przesyłu danych przed atakami ze strony komputerów kwantowych oraz umożliwia migrację infrastruktury klasycznej na kwantową.</p>
      </section>

      <section id="purpose">
        <h3>Cel projektu</h3>
        <p>Integracja z istniejącą infrastrukturą światłowodową. QTCP pozwala na jednoczesne przesyłanie sygnału kwantowego i danych klasycznych tym samym medium. Celem jest zapewnienie bezpieczeństwa (Quantum-Proof) przy wykorzystaniu obecnych połączeń internetowych.</p>
      </section>

      <section id="how-it-works">
        <h3>Mechanizm działania</h3>
        <p>Protokół opiera się na czterech krokach:</p>
        <ol>
          <li><strong>Generowanie klucza BB84:</strong> Próba ustanowienia klucza drogą kwantową (wymiana fotonów).</li>
          <li><strong>Mechanizm Fallback (ML-KEM):</strong> Jeśli warstwa fizyczna nie pozwala na połączenie kwantowe, protokół generuje klucz algorytmem post-kwantowym ML-KEM.</li>
          <li><strong>Szyfrowanie:</strong> Dane są szyfrowane wygenerowanym kluczem (symetrycznie).</li>
          <li><strong>Rotacja:</strong> Cykliczna zmiana klucza w celu minimalizacji ryzyka kompromitacji.</li>
        </ol>

        <div className="placeholder-img">
          [MIEJSCE NA ZDJĘCIE: SCHEMAT LOGICZNY KROKÓW 1-4]
        </div>

        <h4>Wersja kwantowa</h4>
        <p>Wykorzystuje przesył fotonów. Zgodnie z zasadą no-cloning i efektem obserwatora, każda próba przechwycenia (pomiaru) klucza przez stronę trzecią powoduje błąd transmisji i zapadnięcie stanu kwantowego. Pozwala to serwerom na natychmiastowe wykrycie podsłuchu i odrzucenie skompromitowanego klucza.</p>

        <div className="placeholder-img">
          [MIEJSCE NA ZDJĘCIE: FIZYKA PRZESYŁU BB84]
        </div>
        
        <h4>Wersja standardowa (Post-Quantum)</h4>
        <p>W przypadku braku stabilnego kanału kwantowego (np. zbyt duże tłumienie światłowodu, błędy sprzętowe), QTCP używa ML-KEM. Jest to kryptografia oparta na kratach (lattice-based), obecnie uznawana za odporną na dekryptaż kwantowy.</p>
      </section>

      <section id="advantages">
        <h3>Zalety</h3>
        <ul>
          <li><strong>Wykrywalność ingerencji:</strong> Próba odczytu klucza fizycznie niszczy jego zawartość.</li>
          <li><strong>Bezpieczeństwo fizyczne:</strong> Odporność wynikająca z praw mechaniki kwantowej, a nie tylko złożoności obliczeniowej.</li>
          <li><strong>Wysoka dostępność:</strong> Automatyczne przełączanie między kanałem kwantowym a post-kwantowym.</li>
        </ul>
      </section>

      <section id="why-it-works">
        <h3>Podstawy techniczne</h3>
        <p>Wersja kwantowa bazuje na fakcie, że nie da się zmierzyć stanu kwantowego bez jego zmiany. Wersja standardowa bazuje na standardzie NIST dla algorytmów ML-KEM, które są matematycznie zaprojektowane tak, by komputery kwantowe nie miały nad nimi przewagi obliczeniowej.</p>
      </section>

      <section id="use-cases">
        <h3>Scenariusze i Edge Cases</h3>
        <ul>
          <li><strong>Transmisja poprawna:</strong> Stabilna wymiana BB84, szyfrowanie AES-GCM kluczem kwantowym.</li>
          <li><strong>Eavesdropping (Podsłuch):</strong> Wykrycie wysokiego poziomu błędów (QBER), przerwanie procedury BB84, przejście na ML-KEM.</li>
          <li><strong>Photon number splitting (Dzielenie fotonów):</strong> Technika ataku, która polega na wykorzystaniu fotonów o niskiej intensywności do podsłuchu informacji.</li>
          <li><strong>DDoS / Atak fizyczny:</strong> Brak możliwości przesyłu fotonów skutkuje natychmiastowym przejściem w tryb standardowy (fallback).</li>
          <li><strong>Interferencje:</strong> Szum na linii traktowany jest jako zagrożenie bezpieczeństwa - system wymusza renegocjację klucza.</li>
        </ul>
      </section>
      <div className="row justify-content-center">
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
    </>
  )
}

export default Docs