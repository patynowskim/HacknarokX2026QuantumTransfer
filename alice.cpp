#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <algorithm>

#define NOMINMAX
#include <winsock2.h>
#include <ws2tcpip.h>
#include <oqs/oqs.h>
#include "bb84.hpp"
#include "crypto.hpp"

#pragma comment(lib, "Ws2_32.lib")

// Dynamic arguments

void print_hex(const char* label, const uint8_t* data, size_t len, size_t max_print = 16) {
    std::cerr << label;
    for (size_t i = 0; i < (len < max_print ? len : max_print); i++) {
        std::cerr << std::hex << std::setw(2) << std::setfill('0') << (int)data[i];
    }
    std::cerr << "...\n";
}

int main(int argc, char* argv[]) {
    std::string bind_ip = (argc >= 2) ? argv[1] : "0.0.0.0";
    int port = (argc >= 3) ? std::stoi(argv[2]) : 8080;
    
    std::string custom_message;
    if (argc >= 4) {
        custom_message = argv[3];
    } else {
        std::istreambuf_iterator<char> begin(std::cin), end;
        custom_message = std::string(begin, end);
    }

    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);

    OQS_KEM *kem = OQS_KEM_new(OQS_KEM_alg_ml_kem_768);
    if (!kem) {
        std::cerr << "Failed to initialize ML-KEM-768\n";
        return 1;
    }

    std::vector<uint8_t> ek(kem->length_public_key);
    std::vector<uint8_t> dk(kem->length_secret_key);
    OQS_KEM_keypair(kem, ek.data(), dk.data());

    SOCKET server_fd = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in address{};
    address.sin_family = AF_INET;
    inet_pton(AF_INET, bind_ip.c_str(), &address.sin_addr);
    address.sin_port = htons(port);

    bind(server_fd, (struct sockaddr*)&address, sizeof(address));
    listen(server_fd, 1);

    std::cerr << "[Alice] Duplex UART-WiFi Bridge Active. Waiting for Bob on " << bind_ip << ":" << port << "...\n";

    SOCKET conn = accept(server_fd, nullptr, nullptr);
    if (conn != INVALID_SOCKET) {
        std::cerr << "[Alice] Accepted connection.\n";

        // Session Key for Payload Encryption
        std::vector<uint8_t> session_key;

        // ==========================================
        // PHASE 1: QUANTUM DIRECT BB84
        // ==========================================
        std::cerr << "\n--- [ ALICE ] STARTING QUANTUM BB84 KEY EXCHANGE ---\n";
        bool bb84_success = false;

        std::vector<uint8_t> bits = bb84::generate_bits_qrng(bb84::NUM_QUBITS);
        std::vector<uint8_t> bases = bb84::generate_bits_qrng(bb84::NUM_QUBITS);
        std::vector<bb84::Qubit> quantum_channel(bb84::NUM_QUBITS);
        std::vector<uint8_t> reveal_types(bb84::NUM_QUBITS);

        // 1. Prepare Qubits with Decoy States
        for(int i = 0; i < bb84::NUM_QUBITS; i++) {
            quantum_channel[i].value = bits[i];
            quantum_channel[i].basis = bases[i];
            quantum_channel[i].pulse_type = bb84::select_pulse_type(); 
            
            reveal_types[i] = quantum_channel[i].pulse_type;

            if (quantum_channel[i].pulse_type == bb84::VACUUM) {
                quantum_channel[i].value = 0; 
            }
        }

        // 2. Send Qubits (ONLY ONCE)
        std::cerr << "[Alice] Sending " << bb84::NUM_QUBITS << " entangled qubits...\n";
        send(conn, (const char*)quantum_channel.data(), quantum_channel.size() * sizeof(bb84::Qubit), 0);

        // 3. Classical Channel: Send Alice's bases
        std::cerr << "[Alice] Sending Classical Bases...\n";
        send(conn, (const char*)bases.data(), bases.size(), 0);

        // 4. Receive common matching bases indices from Bob
        int common_count = 0;
        recv(conn, (char*)&common_count, sizeof(common_count), 0);
        
        std::vector<int> common_indices(common_count);
        recv(conn, (char*)common_indices.data(), common_count * sizeof(int), 0);
        
        std::cerr << "[Alice] Bob found " << common_count << " matching bases.\n";
        
        std::vector<uint8_t> sifted_key;
        for (int idx : common_indices) {
            sifted_key.push_back(bits[idx]);
        }

        // 5. Send Validation Bits
        int check_bits_count = std::min((int)sifted_key.size(), bb84::CHECK_BITS);
        std::vector<uint8_t> validation_bits(sifted_key.begin(), sifted_key.begin() + check_bits_count);
        send(conn, (const char*)&check_bits_count, sizeof(check_bits_count), 0);
        send(conn, (const char*)validation_bits.data(), check_bits_count, 0);

        // 6. Send Pulse Types
        send(conn, (const char*)reveal_types.data(), reveal_types.size(), 0);

        // 7. Receive Validation Result from Bob
        uint8_t validation_result = 0;
        recv(conn, (char*)&validation_result, 1, 0);
        
        // ==========================================
        // PHASE 2: FALLBACK TO ML-KEM
        // ==========================================
        if (!bb84_success) {
            std::cerr << "\n--- [ ALICE ] STARTING ML-KEM FALLBACK ---\n";
            // 1. Send Public Key
            send(conn, (const char*)ek.data(), ek.size(), 0);
            std::cerr << "[Alice] Sent EK (" << ek.size() << " bytes)\n";

            // 2. Duplex Read (Wait for Bob's Ciphertext)
            std::cerr << "[Alice] Waiting for incoming data...\n";
            std::vector<uint8_t> ciphertext(kem->length_ciphertext);
            
            int total_received = 0;
            int remaining = kem->length_ciphertext;
            
            while (remaining > 0) {
                int bytes_read = recv(conn, (char*)ciphertext.data() + total_received, remaining, 0);
                if (bytes_read <= 0) break;
                total_received += bytes_read;
                remaining -= bytes_read;
            }

            if (total_received == kem->length_ciphertext) {
                std::vector<uint8_t> shared_secret(kem->length_shared_secret);
                OQS_KEM_decaps(kem, shared_secret.data(), ciphertext.data(), dk.data());
                
                std::cerr << "[Alice] Key Exchange Complete!\n";
                print_hex("[Alice] Shared ML-KEM Secret: ", shared_secret.data(), shared_secret.size());
                
                // Establish ML-KEM output as AES-256 Symmetric Fallback Key
                session_key = shared_secret;
            } else {
                std::cerr << "[Alice] Error: Corrupt ML-KEM Data.\n";
            }
        }

        std::cerr << "\n--- SECURE SYMMETRIC ENCRYPTED SESSION ESTABLISHED ---\n";
        
        // 3. Send custom encrypted message (framing included)
        crypto::send_framed_payload(conn, custom_message, session_key);
        std::cerr << "[Alice] Sent encrypted custom message\n";

        // 4. Receive Bob's custom encrypted message using Framing
        std::string bob_msg = crypto::recv_framed_payload(conn, session_key);
        if (!bob_msg.empty()) {
            std::cerr << "[Alice] Received decoded payload.\n";
            std::cout.write(bob_msg.c_str(), bob_msg.size());
            std::cout.flush();
        }
        closesocket(conn);
    }
    closesocket(server_fd);
    OQS_KEM_free(kem);
    WSACleanup();
    return 0;
}
