import { useState } from 'react'
import './Docs.css'

function Docs() {

  return (
    <>
      <h1>Docs</h1>
      <section>
        <h3>Intro do komp kwantowych</h3>
        <p>Komputery </p>
      </section>

      <section>
        <h3>Protokół QTCP</h3>
        <p>Nasz projekt implementuje szyfrowanie z użyciem klucza kwantowego. Protokół ten zapewnia bezpieczeństwo komunikacji w środowisku kwantowym oraz pozwala na przejście z infrastruktury klasycznej do kwantowej.</p>
      </section>

      <section>
        <h3>Zamysł projektu</h3>
        <p>Serwery kwantowe do użytku komercjalnego są coraz bliższe nas. Obecne badania przewidują możliwość wdrożenia połączeń kwantowych w obecnej infrastrukturze światłowodowej, nie wpływając na istniejące połączenia internetowe. Z tego powodu protokół QTCP został zaprojektowany z myślą o integracji z istniejącą infrastrukturą. </p>
      </section>

      <section>
        <h3>Jak to działa</h3>
        <p>Protokół rozważa dwie opcje: główne - połączenie kwantowe, oraz fallback - przesył bitowy.</p>
        <div>
          <h3>W wersji kwantowej</h3>
          <p>!!!! ZIEMNIAK DODAJ WYTLUMACZENIE !!!! Algorytm generuje klucz kwantowy symetryczny dzielony między serwerami. W przypadku próby przechwycenia klucza, związka kwantowa z jego zawartością się zapada. Ta właściwość zezwala na wykrycie prób podsłuchu. W przypadku ataku DDoS przechodzimy na wersje standard.!!!DODAJ ZDJECIA i proces tworzenia klucza!!!!</p>
        </div>
        <div>
          <h3>W wersji standard</h3>
          <p></p>
        </div>
      </section>

      <section>
        <h3>Zalety działania</h3>
        <p></p>
        <ul>
          <li>Odporność na podsłuchiwanie</li>
          <li>Protokół nie do złamania bez złamania brak fizyki</li>
        </ul>
      </section>

      

      <section>
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

      <section>
        <h3>Możliwe użycia i edge cases</h3>
        <p>Dla kwant i standard:</p>
        <ol>
          <li>Poprawna</li>
          <li>Eaves Dropping</li>
          <li>DDoS</li>
          <li>Interferencje naturalne</li>
        </ol>
      </section>
    </>
  )
}

export default Docs
