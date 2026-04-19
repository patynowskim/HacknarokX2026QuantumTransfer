import os
import io

files_to_process = {
    'bb84': {
        'src': 'bb84.hpp', 
        'jsx': 'BB84Docs.jsx', 
        'title': 'BB-84 Protocol Implementation', 
        'comp': 'BB84Docs',
        'desc': 'Moduł odpowiedzialny za symulację wymiany klucza kryptograficznego i protokół Decoy-State dla obrony przed atakami typu Photon Number Splitting (PNS).'
    },
    'crypto': {
        'src': 'crypto.hpp', 
        'jsx': 'CryptoDocs.jsx', 
        'title': 'Crypto Framing & Encryption', 
        'comp': 'CryptoDocs',
        'desc': 'Szyfrowanie warstwy transportowej - operacje bitowe XOR symetrycznym kluczem oraz framing wiadomości TCP (rozmiar ramki + payload).'
    },
    'qc': {
        'src': 'QuantumCircuit.hpp', 
        'jsx': 'QuantumCircuitDocs.jsx', 
        'title': 'Quantum Circuit Simulator', 
        'comp': 'QuantumCircuitDocs',
        'desc': 'Wewnętrzny silnik symulacji operacji na kubitach, obsługujący bramki Hadamard, Pauli-X, Z, Y oraz prawdopodobieństwa pomiaru stanu.'
    },
    'mlkem': {
        'src': 'bob.cpp', 
        'jsx': 'MLKEMDocs.jsx', 
        'title': 'ML-KEM Key Exchange (Bob)', 
        'comp': 'MLKEMDocs',
        'desc': 'Implementacja kwantowo-odpornego algorytmu ML-KEM oparta o liboqs. Plik bob.cpp posiada pełen cykl odbierania klucza po nieudanym BB-84.'
    }
}

jsx_template = """import {{ Link }} from 'react-router-dom';

function {comp_name}() {{
  return (
    <div className='documentation'>
      <h1>Dokumentacja: {title}</h1>

      <section>
        <h3>Opis Modułu</h3>
        <p>{desc}</p>
      </section>

      <section>
        <h3>Plik: {src_file}</h3>
        <pre><code className='language-cpp'>
{code_content}
        </code></pre>
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
}}

export default {comp_name};
"""

for key, config in files_to_process.items():
    src_file = config['src']
    jsx_file = config['jsx']
    comp_name = config['comp']
    title = config['title']
    desc = config['desc']

    with io.open(src_file, 'r', encoding='utf-8') as f:
        code_content = f.read()
        code_content = code_content.replace('&', '&amp;')
        code_content = code_content.replace('<', '&lt;')
        code_content = code_content.replace('>', '&gt;')
        code_content = code_content.replace('{', '&#123;')
        code_content = code_content.replace('}', '&#125;')
    
    out_content = jsx_template.format(comp_name=comp_name, title=title, src_file=src_file, code_content=code_content, desc=desc)
    with io.open(os.path.join('frontend', 'src', jsx_file), 'w', encoding='utf-8') as f:
        f.write(out_content)
