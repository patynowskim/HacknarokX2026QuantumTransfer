import { Link } from 'react-router-dom';

function MLKEMDocs() {
  return (
    <div className='documentation'>
      <h1>Dokumentacja: ML-KEM Key Exchange (Bob)</h1>

      <section>
        <h3>Opis Modułu</h3>
        <p>Implementacja kwantowo-odpornego algorytmu ML-KEM oparta o liboqs. Plik bob.cpp posiada pełen cykl odbierania klucza po nieudanym BB-84.</p>
      </section>

      <section>
        <h3>Plik: bob.cpp</h3>
        <pre><code className='language-cpp'>
#include &lt;iostream&gt;
#include &lt;vector&gt;
#include &lt;string&gt;
#include &lt;iomanip&gt;
#include &lt;thread&gt;
#include &lt;chrono&gt;
#include &lt;algorithm&gt;

#define NOMINMAX
#include &lt;winsock2.h&gt;
#include &lt;ws2tcpip.h&gt;
#include &lt;oqs/oqs.h&gt;
#include "bb84.hpp"
#include "crypto.hpp"

#pragma comment(lib, "Ws2_32.lib")

// Command line args used

bool recv_all(SOCKET sock, uint8_t* buffer, size_t length) &#123;
    size_t total = 0;

    while (total &lt; length) &#123;
        int r = recv(sock, (char*)buffer + total, length - total, 0);
        if (r &lt;= 0) return false;
        total += r;
    &#125;
    return true;
&#125;

void print_hex(const char* label, const uint8_t* data, size_t len, size_t max_print = 16) &#123;
    std::cerr &lt;&lt; label;
    for (size_t i = 0; i &lt; (len &lt; max_print ? len : max_print); i++) &#123;
        std::cerr &lt;&lt; std::hex &lt;&lt; std::setw(2) &lt;&lt; std::setfill('0') &lt;&lt; (int)data[i];
    &#125;
    std::cerr &lt;&lt; "...\n";
&#125;

void heartbeat(SOCKET conn) &#123;
    for (int i = 0; i &lt; 5; ++i) &#123;
        std::string msg = "HEARTBEAT_" + std::to_string(i) + "\n";
        send(conn, msg.c_str(), msg.length(), 0);
        std::this_thread::sleep_for(std::chrono::seconds(1));
    &#125;
&#125;

int main(int argc, char* argv[]) &#123;
    std::string server_ip = (argc &gt;= 2) ? argv[1] : "127.0.0.1";
    int port = (argc &gt;= 3) ? std::stoi(argv[2]) : 8080;
    
    std::string custom_message;
    if (argc &gt;= 4) &#123;
        custom_message = argv[3];
    &#125; else &#123;
        std::istreambuf_iterator&lt;char&gt; begin(std::cin), end;
        custom_message = std::string(begin, end);
    &#125;

    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &amp;wsaData);

    OQS_KEM *kem = OQS_KEM_new(OQS_KEM_alg_ml_kem_768);
    if (!kem) &#123;
        std::cerr &lt;&lt; "Failed to initialize ML-KEM-768\n";
        return 1;
    &#125;

    SOCKET client_fd = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in address&#123;&#125;;
    address.sin_family = AF_INET;
    inet_pton(AF_INET, server_ip.c_str(), &amp;address.sin_addr);
    address.sin_port = htons(port);

    if (connect(client_fd, (struct sockaddr*)&amp;address, sizeof(address)) == SOCKET_ERROR) &#123;
        std::cerr &lt;&lt; "Connection failed\n";
        return 1;
    &#125;

    std::cerr &lt;&lt; "[Bob] Connected to Alice (Duplex Mode)\n";

    uint8_t mode = 0;
    if (!recv_all(client_fd, &amp;mode, 1)) &#123;
        std::cerr &lt;&lt; "[Bob] Failed to receive mode selection\n";
        return 1;
    &#125;

    // Session Key for Payload Encryption
    std::vector&lt;uint8_t&gt; session_key;

    // ==========================================
    // PHASE 1: QUANTUM DIRECT BB84
    // ==========================================
    bool bb84_success = false;
    if (mode == 0x01) &#123;
        std::cerr &lt;&lt; "\n--- [ BOB ] STARTING QUANTUM BB84 KEY EXCHANGE ---\n";

        // 1. Receive Qubits over Quantum Channel
        std::vector&lt;bb84::Qubit&gt; quantum_channel(bb84::NUM_QUBITS);
        int total_rec = 0;
        while(total_rec &lt; bb84::NUM_QUBITS * sizeof(bb84::Qubit)) &#123;
            int r = recv(client_fd, (char*)quantum_channel.data() + total_rec, (bb84::NUM_QUBITS * sizeof(bb84::Qubit)) - total_rec, 0);
            if (r &lt;= 0) break;
            total_rec += r;
        &#125;
        std::cerr &lt;&lt; "[Bob] Received " &lt;&lt; bb84::NUM_QUBITS &lt;&lt; " entangled qubits...\n";

        // 2. Measure against local random bases
        std::vector&lt;uint8_t&gt; bob_bases = bb84::generate_bits_qrng(bb84::NUM_QUBITS);
        std::vector&lt;uint8_t&gt; measured_bits = bb84::measure(quantum_channel, bob_bases);

        // 3. Receive Alice's Classical Bases
        std::vector&lt;uint8_t&gt; alice_bases(bb84::NUM_QUBITS);
        total_rec = 0;
        while(total_rec &lt; bb84::NUM_QUBITS) &#123;
            int r = recv(client_fd, (char*)alice_bases.data() + total_rec, bb84::NUM_QUBITS - total_rec, 0);
            if (r &lt;= 0) break;
            total_rec += r;
        &#125;

        // 4. Compare bases, keep matching bits indices
        std::vector&lt;int&gt; common_indices;
        for (int i = 0; i &lt; bb84::NUM_QUBITS; i++) &#123;
            if (alice_bases[i] == bob_bases[i]) &#123;
                common_indices.push_back(i);
            &#125;
        &#125;

        // 5. Send matching count and indices back to Alice
        int common_count = common_indices.size();
        send(client_fd, (const char*)&amp;common_count, sizeof(common_count), 0);
        send(client_fd, (const char*)common_indices.data(), common_count * sizeof(int), 0);

        // Build the sifted key
        std::vector&lt;uint8_t&gt; sifted_key;
        for (int idx : common_indices) &#123;
            if (quantum_channel[idx].pulse_type == bb84::VACUUM)
                continue;

            sifted_key.push_back(measured_bits[idx]);
        &#125;

        // 6. Receive Validation Segment from Alice to check Eavesdropping
        int check_bits_count = 0;
        recv(client_fd, (char*)&amp;check_bits_count, sizeof(check_bits_count), 0);
        std::vector&lt;uint8_t&gt; alice_validation(check_bits_count);
        recv(client_fd, (char*)alice_validation.data(), check_bits_count, 0);

        // 7. Receive Pulse Types from Alice (Revealed AFTER measurement)
        std::vector&lt;uint8_t&gt; alice_pulse_types(bb84::NUM_QUBITS);
        int total_pt = 0;
        while(total_pt &lt; bb84::NUM_QUBITS) &#123;
            int r = recv(client_fd, (char*)alice_pulse_types.data() + total_pt, bb84::NUM_QUBITS - total_pt, 0);
            if (r &lt;= 0) break;
            total_pt += r;
        &#125;

        // 8. Eavesdropper &amp; PNS Detection Logic
        bool is_evesdropping = false; // Fixes C2065 (undeclared identifier)

        // Check 1: Standard Bit Error Rate (QBER)
        for (int i = 0; i &lt; check_bits_count; i++) &#123;
            if (sifted_key[i] != alice_validation[i]) &#123;
                is_evesdropping = true;
                break;
            &#125;
        &#125;

        // Check 2: Decoy State Analysis (PNS Defense)
        int signal_sent = 0, signal_measured = 0;
        int decoy_sent = 0, decoy_measured = 0;

        for(int i = 0; i &lt; bb84::NUM_QUBITS; i++) &#123;
            if (alice_pulse_types[i] == bb84::SIGNAL) signal_sent++;
            else if (alice_pulse_types[i] == bb84::DECOY) decoy_sent++;
        &#125;

        for (int idx : common_indices) &#123;
            if (alice_pulse_types[idx] == bb84::SIGNAL) signal_measured++;
            else if (alice_pulse_types[idx] == bb84::DECOY) decoy_measured++;
        &#125;

        int error_count = 0;
        for (int i = 0; i &lt; check_bits_count; i++) &#123;
            if (sifted_key[i] != alice_validation[i]) &#123;
                error_count++;
            &#125;
        &#125;

        // DEBUG PRINT
        std::cerr &lt;&lt; "[Bob] Bit Check: " &lt;&lt; error_count &lt;&lt; " errors out of " &lt;&lt; check_bits_count &lt;&lt; " bits.\n";

        if (error_count &gt; (check_bits_count * 0.15)) &#123;
            is_evesdropping = true;
        &#125;

        double yield_signal = (signal_sent &gt; 0) ? (double)signal_measured / signal_sent : 0;
        double yield_decoy = (decoy_sent &gt; 0) ? (double)decoy_measured / decoy_sent : 0;

        if (yield_decoy &lt; (yield_signal * 0.3)) &#123;
            is_evesdropping = true;
            std::cerr &lt;&lt; "[Bob] PNS Attack Detected! Signal Yield: " &lt;&lt; yield_signal &lt;&lt; " Decoy Yield: " &lt;&lt; yield_decoy &lt;&lt; "\n";
        &#125;

        // 9. Send Validation Result back to Alice
        uint8_t validation_result = is_evesdropping ? 0 : 1;
        send(client_fd, (const char*)&amp;validation_result, 1, 0);

        if (!is_evesdropping) &#123;
            std::cerr &lt;&lt; "[Bob] BB84 SUCCESS! No eavesdropper detected.\n";
            // MOVE HASHING HERE - Before you print or use the key
            std::vector&lt;uint8_t&gt; final_key(
                sifted_key.begin() + check_bits_count,
                sifted_key.end()
            );

            session_key = bb84::universal_hash(final_key);
            
            std::cerr &lt;&lt; "[Bob] Applying Universal Hashing...\n";
            print_hex("[DEBUG] Sifted Key: ", sifted_key.data(), sifted_key.size());
            print_hex("[DEBUG] Final Session Key: ", session_key.data(), session_key.size());
            
            bb84_success = true;
        &#125; else &#123;
            std::cerr &lt;&lt; "\n[!] WARNING [!] BB84 EAVESDROPPER DETECTED!\n";
        &#125;
    &#125; else &#123;
        std::cerr &lt;&lt; "[Bob] Alice skipped BB84, jumping to ML-KEM.\n";
        bb84_success = false; 
    &#125;
        
    // ==========================================
    // PHASE 2: FALLBACK TO ML-KEM
    // ==========================================
    if (!bb84_success) &#123;
        std::cerr &lt;&lt; "\n--- [ BOB ] STARTING ML-KEM FALLBACK ---\n";

        uint8_t sync = 0;
        if (!recv_all(client_fd, &amp;sync, 1) || sync != 0x55) &#123;
            std::cerr &lt;&lt; "[Bob] Protocol desync (missing sync byte)\n";
            return 1;
        &#125;

        uint8_t mlkem_flag = 0;
        if (!recv_all(client_fd, &amp;mlkem_flag, 1)) &#123;
            std::cerr &lt;&lt; "[Bob] Failed to read ML-KEM flag\n";
            return 1;
        &#125;

        if (mlkem_flag != 1) &#123;
            std::cerr &lt;&lt; "[Bob] ML-KEM not requested\n";
            return 1;
        &#125;

        std::vector&lt;uint8_t&gt; ek(kem-&gt;length_public_key);

        size_t total_received = 0;
        size_t remaining = kem-&gt;length_public_key;

        while (remaining &gt; 0) &#123;
            int bytes_read = recv(client_fd,
                (char*)ek.data() + total_received,
                (int)remaining,
                0);

            if (bytes_read &lt;= 0) &#123;
                std::cerr &lt;&lt; "[Bob] Failed receiving EK\n";
                return 1;
            &#125;

            total_received += bytes_read;
            remaining -= bytes_read;
        &#125;

        std::vector&lt;uint8_t&gt; ciphertext(kem-&gt;length_ciphertext);
        std::vector&lt;uint8_t&gt; shared_secret(kem-&gt;length_shared_secret);

        OQS_KEM_encaps(kem,
            ciphertext.data(),
            shared_secret.data(),
            ek.data());

        send(client_fd, (const char*)ciphertext.data(), ciphertext.size(), 0);

        std::cerr &lt;&lt; "[Bob] Ciphertext sent. Key Exchange Complete.\n";

        session_key = shared_secret;
    &#125;

    std::cerr &lt;&lt; "\n--- SECURE SYMMETRIC ENCRYPTED SESSION ESTABLISHED ---\n";

    // 4. Send Bob's payload encrypted
    crypto::send_framed_payload(client_fd, custom_message, session_key);
    std::cerr &lt;&lt; "[Bob] Sent encrypted custom payload\n";

    // 5. Check for Alice's confirmation messages using Framing chunk receiver
    std::string alice_msg = crypto::recv_framed_payload(client_fd, session_key);
    if (!alice_msg.empty()) &#123;
        std::cerr &lt;&lt; "[Bob] Received decoded payload.\n";
        std::cout.write(alice_msg.c_str(), alice_msg.size());
        std::cout &lt;&lt; "\n";
        std::cout.flush();
    &#125;

    closesocket(client_fd);
    OQS_KEM_free(kem);
    WSACleanup();
    return 0;
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

export default MLKEMDocs;
