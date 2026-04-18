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
        <h3>Komputery kwantowe</h3>
        <p>Tradycyjne komputery, z których korzystamy na co dzień, działają na bitach - informacja to zawsze albo 0, albo 1. Wyobraź sobie to jako przełącznik światła: włączony lub wyłączony. Komputery kwantowe używają <strong>kubitów</strong>. Dzięki prawom fizyki kwantowej, kubit może być zerem, jedynką, albo - i tu zaczyna się magia - obiema wartościami naraz (nazywamy to superpozycją). Dopiero gdy spróbujemy ten kubit "odczytać" (zmierzyć), decyduje się on na jedną, konkretną wartość.</p>
        <p>Ta właściwość sprawia, że komputery kwantowe potrafią rozwiązywać niezwykle skomplikowane problemy matematyczne (w tym łamać obecne hasła) w ułamku sekundy.</p>
      </section>

      <section id="protocol">
        <h3>Protokół QTCP</h3>
        <p>QTCP to nasz pomost między obecnym internetem a nadchodzącą erą kwantową. To protokół komunikacyjny stworzony głównie do relacji serwer-serwer. Jego głównym zadaniem jest bezpieczne przesłanie tzw. "klucza" (hasła), którym potem szyfrowane są normalne dane. Zapewnia on absolutne bezpieczeństwo w środowisku kwantowym i pozwala na bezbolesne przejście na nową infrastrukturę, zanim stare metody szyfrowania staną się bezużyteczne.</p>
      </section>

      <section id="purpose">
        <h3>Zamysł projektu</h3>
        <p>Z roku na roku możliwa komercjalizacja komputerowych kwantowych staje się coraz bardziej realna. By zapewnić gładką tranzycję w świat nowej technologii, należy już teraz szykować podwaliny pod nową infrastrukturę. Nasz projekt celuje by stać się platformą przejściową między serwerami kwantowymi a klasycznymi.
          </p>
      </section>

      <section id="how-it-works">
        <h3>Jak to działa</h3>
        <p>Protokół jest sprytny i zawsze ma plan B. Rozważa dwie opcje: główną (połączenie kwantowe) oraz zapasową (fallback na przesył standardowy). Proces wygląda następująco:</p>
        <ol>
          <li><strong>Tworzenie klucza (BB84):</strong> Najpierw serwery próbują dogadać się kwantowo i ustalić wspólny klucz szyfrujący za pomocą protokołu BB84 (wysyłają do siebie pojedyncze cząstki światła).</li>
          <li><strong>Plan B (ML-KEM):</strong> Jeśli z jakiegoś powodu fizyczne przesłanie cząstek się nie uda, system automatycznie generuje klucz algorytmem ML-KEM.</li>
          <li><strong>Szyfrowanie:</strong> Gdy serwery mają już wspólny klucz, cała reszta danych (np. pliki, wiadomości) jest nim szyfrowana i wysyłana normalnym kanałem.</li>
          <li><strong>Rotacja:</strong> Dla maksymalnego bezpieczeństwa, klucz nie jest wieczny. Co jakiś czas proces jest powtarzany i klucz ulega zmianie.</li>
        </ol>

        {/* --- Miejsce na zdjęcie 1 --- */}
        <div style={{ margin: '20px 0', padding: '20px', border: '1px dashed #ccc', textAlign: 'center' }}>
          <em>[Miejsce na zdjęcie: Schemat blokowy pokazujący 4 kroki działania protokołu QTCP]</em>
          {/* <img src="sciezka/do/schematu.png" alt="Schemat działania QTCP" style={{ maxWidth: '100%' }} /> */}
        </div>

        <div>
          <h3>W wersji kwantowej</h3>
          <p>W tym trybie wykorzystujemy fotony (cząsteczki światła) do przesłania klucza. Największą zaletą fizyki kwantowej jest to, że <strong>nie da się skopiować ani podglądnąć stanu kwantowego bez jego zniszczenia</strong>. Jeśli serwer A wysyła klucz do serwera B, a po drodze haker spróbuje go przechwycić, cząsteczki światła natychmiast ulegną zmianie. Serwery od razu zauważą, że "paczka" była otwierana, odrzucą ten klucz i spróbują ponownie. W przypadku masowego ataku (DDoS), system przechodzi na wersję standardową.</p>
          
          {/* --- Miejsce na zdjęcie 2 --- */}
          <div style={{ margin: '20px 0', padding: '20px', border: '1px dashed #ccc', textAlign: 'center' }}>
            <em>[Miejsce na zdjęcie: Grafika pokazująca hakera próbującego "złapać" foton, co powoduje jego zniszczenie / zmianę koloru]</em>
            {/* <img src="sciezka/do/grafiki_haker.png" alt="Atak na foton" style={{ maxWidth: '100%' }} /> */}
          </div>
        </div>
        
        <div>
          <h3>W wersji standardowej (Fallback)</h3>
          <p>Gdy fotony nie mogą dotrzeć do celu (np. przez zbyt duże zakłócenia w światłowodzie), protokół przechodzi w tryb standardowy. Używamy wtedy algorytmu ML-KEM. Jest to zaawansowana matematyka (kryptografia postkwantowa), która została zaprojektowana specjalnie po to, aby oprzeć się atakom z użyciem komputerów kwantowych. Dzięki temu, nawet bez fizyki kwantowej, komunikacja pozostaje bezpieczna.</p>
        </div>
      </section>

      <section id="advantages">
        <h3>Zalety działania</h3>
        <ul>
          <li><strong>Odporność na podsłuchiwanie:</strong> Wiemy o każdej próbie przechwycenia klucza w ułamku sekundy.</li>
          <li><strong>Fizyczne bezpieczeństwo:</strong> Wersja kwantowa nie opiera się na trudnej matematyce, którą kiedyś będzie można rozwiązać. Opiera się na twardych prawach fizyki. Złamanie tego protokołu wymagałoby złamania praw wszechświata.</li>
          <li><strong>Gwarancja ciągłości:</strong> Dzięki mechanizmowi Fallback, usługa działa zawsze, nawet w niesprzyjających warunkach.</li>
        </ul>
      </section>

      <section id="why-it-works">
        <h3>Czemu to działa</h3>
        <div>
          <h3>W wersji kwantowej</h3>
          <ul>
            <li><strong>Obserwacja niszczy stan:</strong> Odczytanie cząstki kwantowej przez kogoś obcego nieodwracalnie ją zmienia (to tzw. zasada nieoznaczoności Heisenberga).</li>
            <li><strong>Natychmiastowy alarm:</strong> Trzecia strona nie jest w stanie po cichu przeczytać klucza. Każda ingerencja to fizyczny ślad, o którym serwery dowiadują się natychmiast.</li>
          </ul>
        </div>
        <div>
          <h3>W wersji standardowej</h3>
          <ul>
            <li><strong>Standard NIST:</strong> ML-KEM to algorytm zatwierdzony przez amerykański Narodowy Instytut Standardów i Technologii (NIST) jako oficjalny standard ochrony przed zagrożeniami ze strony komputerów kwantowych.</li>
          </ul>
        </div>
      </section>

      <section id="use-cases">
        <h3>Możliwe użycia i edge cases</h3>
        <p>Sytuacje dla trybu kwantowego i standardowego:</p>
        <ol>
          <li><strong>Poprawna komunikacja:</strong> Serwery dogadują się bez problemu, wymieniają klucz kwantowy (BB84), szyfrują nim dane, a co określony czas klucz jest odświeżany.</li>
          <li><strong>Eavesdropping (Podsłuch):</strong> Haker podłącza się pod światłowód. Stany kwantowe fotonów ulegają zmianie (zapadają się). Odbiorca zauważa błędy w kluczu i go odrzuca. Serwery mogą spróbować wysłać klucz jeszcze raz lub, jeśli atak trwa, przejść na ML-KEM.</li>
          <li><strong>DDoS (Atak na dostępność):</strong> Sieć kwantowa zostaje zalana śmieciowymi żądaniami lub fizycznie "oślepiona". Protokół od razu porzuca próby kwantowe i przełącza się na stabilny, standardowy model przesyłu matematycznego (ML-KEM), aby utrzymać działanie usługi.</li>
          <li><strong>Interferencje naturalne:</strong> Zagięty światłowód, skoki temperatur lub mikro-uszkodzenia infrastruktury powodują "zgubienie" fotonów na trasie. System traktuje to podobnie jak atak – nie ufa wybrakowanemu kluczowi i uruchamia procedurę fallback (ML-KEM) do czasu ustabilizowania się łącza fizycznego.</li>
        </ol>
      </section>
      </div>
    </>
  )
}

export default Docs