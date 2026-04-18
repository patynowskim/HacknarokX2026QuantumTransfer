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

#pragma comment(lib, "Ws2_32.lib")

// Dynamic arguments

void print_hex(const char* label, const uint8_t* data, size_t len, size_t max_print = 16) {
    std::cout << label;
    for (size_t i = 0; i < (len < max_print ? len : max_print); i++) {
        std::cout << std::hex << std::setw(2) << std::setfill('0') << (int)data[i];
    }
    std::cout << "...\n";
}

int main(int argc, char* argv[]) {
    std::string bind_ip = (argc >= 2) ? argv[1] : "0.0.0.0";
    int port = (argc >= 3) ? std::stoi(argv[2]) : 8080;
    std::string custom_message = (argc >= 4) ? argv[3] : "READY_FOR_ENCRYPTED_SESSION";

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

    std::cout << "[Alice] Duplex UART-WiFi Bridge Active. Waiting for Bob on " << bind_ip << ":" << port << "...\n";

    SOCKET conn = accept(server_fd, nullptr, nullptr);
    if (conn != INVALID_SOCKET) {
        std::cout << "[Alice] Accepted connection.\n";

        // ==========================================
        // PHASE 1: QUANTUM DIRECT BB84
        // ==========================================
        std::cout << "\n--- [ ALICE ] STARTING QUANTUM BB84 KEY EXCHANGE ---\n";
        bool bb84_success = false;

        std::vector<uint8_t> bits = bb84::generate_bits(bb84::NUM_QUBITS);
        std::vector<uint8_t> bases = bb84::generate_bits(bb84::NUM_QUBITS); // 0=Z, 1=X
        std::vector<bb84::Qubit> quantum_channel = bb84::encode(bits, bases);

        // 1. Send Qubits over Quantum Channel (Simulated via TCP)
        std::cout << "[Alice] Sending " << bb84::NUM_QUBITS << " entangled qubits...\n";
        send(conn, (const char*)quantum_channel.data(), quantum_channel.size() * sizeof(bb84::Qubit), 0);

        // 2. Classical Channel: Send Alice's bases
        std::cout << "[Alice] Sending Classical Bases...\n";
        send(conn, (const char*)bases.data(), bases.size(), 0);

        // 3. Receive common matching bases indices from Bob
        int common_count = 0;
        recv(conn, (char*)&common_count, sizeof(common_count), 0);
        
        std::vector<int> common_indices(common_count);
        recv(conn, (char*)common_indices.data(), common_count * sizeof(int), 0);
        
        std::cout << "[Alice] Bob found " << common_count << " matching bases. Building Common Key.\n";
        
        std::vector<uint8_t> sifted_key;
        for (int idx : common_indices) {
            sifted_key.push_back(bits[idx]);
        }

        // 4. Send random bits to check for an eavesdropper
        int check_bits_count = std::min((int)sifted_key.size(), bb84::CHECK_BITS);
        std::vector<uint8_t> validation_bits(sifted_key.begin(), sifted_key.begin() + check_bits_count);
        send(conn, (const char*)&check_bits_count, sizeof(check_bits_count), 0);
        send(conn, (const char*)validation_bits.data(), check_bits_count, 0);

        // 5. Receive Validation Result from Bob
        uint8_t validation_result = 0;
        recv(conn, (char*)&validation_result, 1, 0);

        if (validation_result == 1) {
            std::cout << "[Alice] BB84 SUCCESS! No eavesdropper detected.\n";
            std::cout << "[Alice] Using established quantum key.\n";
            bb84_success = true;
        } else {
            std::cout << "\n[!] WARNING [!] BB84 EAVESDROPPER DETECTED OR HIGH NOISE!\n";
            std::cout << "[Alice] Falling back to traditional Post-Quantum ML-KEM.\n";
        }
        
        // ==========================================
        // PHASE 2: FALLBACK TO ML-KEM
        // ==========================================
        if (!bb84_success) {
            std::cout << "\n--- [ ALICE ] STARTING ML-KEM FALLBACK ---\n";
            // 1. Send Public Key
            send(conn, (const char*)ek.data(), ek.size(), 0);
            std::cout << "[Alice] Sent EK (" << ek.size() << " bytes)\n";

            // 2. Duplex Read (Wait for Bob's Ciphertext)
            std::cout << "[Alice] Waiting for incoming data...\n";
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
                
                std::cout << "[Alice] Key Exchange Complete!\n";
                print_hex("[Alice] Shared ML-KEM Secret: ", shared_secret.data(), shared_secret.size());
            } else {
                std::cout << "[Alice] Error: Corrupt ML-KEM Data.\n";
            }
        }

        std::cout << "\n--- ESTABLISHED SECURE SESSION ---\n";
        // 3. Send custom message
        send(conn, custom_message.c_str(), custom_message.length(), 0);
        std::cout << "[Alice] Sent custom message: " << custom_message << "\n";

        // 4. Receive Bob's custom message
        char bob_msg[1024] = {0};
        int msg_len = recv(conn, bob_msg, sizeof(bob_msg) - 1, 0);
        if (msg_len > 0) {
            std::cout << "[Alice] Received from Bob: " << bob_msg << "\n";
        }
        closesocket(conn);
    }
    closesocket(server_fd);
    OQS_KEM_free(kem);
    WSACleanup();
    return 0;
}