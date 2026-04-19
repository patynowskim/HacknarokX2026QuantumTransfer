import { Link } from 'react-router-dom';

function CryptoDocs() {
  return (
    <div className='documentation'>
      <h1>Dokumentacja: Crypto Framing & Encryption</h1>

      <section>
        <h3>Opis Modułu</h3>
        <p>Szyfrowanie warstwy transportowej - operacje bitowe XOR symetrycznym kluczem oraz framing wiadomości TCP (rozmiar ramki + payload).</p>
      </section>

      <section>
        <h3>Plik: crypto.hpp</h3>
        <pre><code className='language-cpp'>
#pragma once
#include &lt;vector&gt;
#include &lt;string&gt;
#include &lt;winsock2.h&gt;
#include &lt;iostream&gt;

namespace crypto &#123;
    void encrypt_decrypt(std::string&amp; data, const std::vector&lt;uint8_t&gt;&amp; key) &#123;
        if (key.empty()) return;
        for (size_t i = 0; i &lt; data.size(); ++i) &#123;
            data[i] ^= key[i % key.size()];
        &#125;
    &#125;

    void send_framed_payload(SOCKET s, const std::string&amp; plaintext, const std::vector&lt;uint8_t&gt;&amp; key) &#123;
        std::string ciphertext = plaintext;
        encrypt_decrypt(ciphertext, key);
        
        // 1. Send Frame Length Prefix (4 bytes - network byte order)
        uint32_t len = htonl(static_cast&lt;uint32_t&gt;(ciphertext.size()));
        send(s, (const char*)&amp;len, sizeof(len), 0);
        
        // 2. Send Encrypted Payload
        int total = 0;
        int remaining = ciphertext.size();
        while (remaining &gt; 0) &#123;
            int r = send(s, ciphertext.data() + total, remaining, 0);
            if (r &lt;= 0) break;
            total += r;
            remaining -= r;
        &#125;
    &#125;

    std::string recv_framed_payload(SOCKET s, const std::vector&lt;uint8_t&gt;&amp; key) &#123;
        // 1. Receive Frame Length Prefix
        uint32_t nlen = 0;
        int r = recv(s, (char*)&amp;nlen, sizeof(nlen), 0);
        if (r &lt;= 0) return "";
        uint32_t len = ntohl(nlen);
        
        if (len == 0) return "";

        // 2. Receive Encrypted Payload precisely
        std::vector&lt;char&gt; buffer(len);
        uint32_t total = 0;
        while (total &lt; len) &#123;
            r = recv(s, buffer.data() + total, len - total, 0);
            if (r &lt;= 0) break;
            total += r;
        &#125;

        std::string ciphertext(buffer.data(), total);
        encrypt_decrypt(ciphertext, key);
        return ciphertext;
    &#125;
&#125;
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
}

export default CryptoDocs;
