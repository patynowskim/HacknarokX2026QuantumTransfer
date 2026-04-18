import { useState } from 'react'
import './Docs.css'

function Docs() {

  return (
    <>
    <div className='navSection'><a href='./'>
      <img src='logo.png' alt='logo, nawigacja do strony głównej' /></a>
      <ul>
        <h2>Spis treści</h2>
        <li><a href="#intro">Intro do komp kwantowych</a></li>
        <li><a href="#protocol">Protokół QTCP</a></li>
        <li><a href="#purpose">Zamysł projektu</a></li>
        <li><a href="#how-it-works">Jak to działa</a></li>
        <li><a href="#advantages">Zalety działania</a></li>
        <li><a href="#why-it-works">Czemu to działa</a></li>
        <li><a href="#use-cases">Możliwe użycia i edge cases</a></li>
      </ul>
    </div>
    <div className='documentation'> 
      <h1>Docs</h1>
      <section id="intro">
        <h3>Intro do komp kwantowych</h3>
        <p>Komputery </p>
      </section>

      <section id="protocol">
        <h3>Protokół QTCP</h3>
        <p>Nasz projekt implementuje szyfrowanie z użyciem klucza kwantowego. Protokół ten zapewnia bezpieczeństwo komunikacji w środowisku kwantowym oraz pozwala na przejście z infrastruktury klasycznej do kwantowej.</p>
      </section>

      <section id="purpose">
        <h3>Zamysł projektu</h3>
        <p>Serwery kwantowe do użytku komercjalnego są coraz bliższe nas. Obecne badania przewidują możliwość wdrożenia połączeń kwantowych w obecnej infrastrukturze światłowodowej, nie wpływając na istniejące połączenia internetowe. Z tego powodu protokół QTCP został zaprojektowany z myślą o integracji z istniejącą infrastrukturą. </p>
      </section>

      <section id="how-it-works">
        <h3>Jak to działa</h3>
        <p>Protokół rozważa dwie opcje: główne - połączenie kwantowe, oraz fallback - przesył bitowy.</p>
        <div>
          <h3>W wersji kwantowej</h3>
          <p>!!!! ZIEMNIAK DODAJ WYTLUMACZENIE !!!! Algorytm generuje klucz kwantowy symetryczny dzielony między serwerami. W przypadku próby przechwycenia klucza, związka kwantowa z jego zawartością się zapada. Ta właściwość zezwala na wykrycie prób podsłuchu. W przypadku ataku DDoS przechodzimy na wersje standard.!!!DODAJ ZDJECIA i proces tworzenia klucza!!!!</p>
        </div>
        <div>
          <h3>W wersji standard</h3>
          <p>W przypadku braku możliwości ustanowienia połączenia kwantowego, protokół przechodzi na tryb standardowy, wykorzystując tworzenie klucza algorytmem ML-KEM. Ten algorytm jest odporny na ataki kwantowe, zapewniając bezpieczeństwo komunikacji nawet w przypadku braku połączenia kwantowego. 
          </p>
        </div>
      </section>

      <section id="advantages">
        <h3>Zalety działania</h3>
        <p></p>
        <ul>
          <li>Odporność na podsłuchiwanie</li>
          <li>Protokół nie do złamania bez złamania brak fizyki</li>
        </ul>
      </section>

      

      <section id="why-it-works">
        <h3>Czemu to działa</h3>
        <div>
          <h3>W wersji kwantowej</h3>
          <ul>
            <li>Odczytanie klucza niszczy klucz.</li>
            <li>3rd party nie jest w stanie przeczytać klucza, bo od razu wiemy, że ktoś podsłuchuje.</li>
          </ul>
        </div>
        <div>
          <h3>W wersji standard</h3>
          <ul>
            <li>Klucz jest odporny na quantum decrypting według standardu NIST.</li>
          </ul>
        </div>
      </section>

      <section id="use-cases">
        <h3>Możliwe użycia i edge cases</h3>
        <p>Dla kwant i standard:</p>
        <ol>
          <li>Poprawna</li>
          <li>Eaves Dropping</li>
          <li>DDoS</li>
          <li>Interferencje naturalne</li>
        </ol>
      </section>
      </div>
    </>
  )
}


export default Docs
