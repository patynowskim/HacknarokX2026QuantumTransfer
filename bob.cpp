#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <thread>
#include <chrono>
#include <algorithm>

#define NOMINMAX
#include <winsock2.h>
#include <ws2tcpip.h>
#include <oqs/oqs.h>
#include "bb84.hpp"
#include "crypto.hpp"

#pragma comment(lib, "Ws2_32.lib")

// Command line args used

void print_hex(const char* label, const uint8_t* data, size_t len, size_t max_print = 16) {
    std::cerr << label;
    for (size_t i = 0; i < (len < max_print ? len : max_print); i++) {
        std::cerr << std::hex << std::setw(2) << std::setfill('0') << (int)data[i];
    }
    std::cerr << "...\n";
}

void heartbeat(SOCKET conn) {
    for (int i = 0; i < 5; ++i) {
        std::string msg = "HEARTBEAT_" + std::to_string(i) + "\n";
        send(conn, msg.c_str(), msg.length(), 0);
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
}

int main(int argc, char* argv[]) {
    std::string server_ip = (argc >= 2) ? argv[1] : "127.0.0.1";
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

    SOCKET client_fd = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in address{};
    address.sin_family = AF_INET;
    inet_pton(AF_INET, server_ip.c_str(), &address.sin_addr);
    address.sin_port = htons(port);

    if (connect(client_fd, (struct sockaddr*)&address, sizeof(address)) == SOCKET_ERROR) {
        std::cerr << "Connection failed\n";
        return 1;
    }

    std::cerr << "[Bob] Connected to Alice (Duplex Mode)\n";

    // Session Key for Payload Encryption
    std::vector<uint8_t> session_key;

    // ==========================================
    // PHASE 1: QUANTUM DIRECT BB84
    // ==========================================
    std::cerr << "\n--- [ BOB ] STARTING QUANTUM BB84 KEY EXCHANGE ---\n";
    bool bb84_success = false;

    // 1. Receive Qubits over Quantum Channel
    std::vector<bb84::Qubit> quantum_channel(bb84::NUM_QUBITS);
    int total_rec = 0;
    while(total_rec < bb84::NUM_QUBITS * sizeof(bb84::Qubit)) {
        int r = recv(client_fd, (char*)quantum_channel.data() + total_rec, (bb84::NUM_QUBITS * sizeof(bb84::Qubit)) - total_rec, 0);
        if (r <= 0) break;
        total_rec += r;
    }
    std::cerr << "[Bob] Received " << bb84::NUM_QUBITS << " entangled qubits...\n";

    // 2. Measure against local random bases
    std::vector<uint8_t> bob_bases = bb84::generate_bits(bb84::NUM_QUBITS);
    std::vector<uint8_t> measured_bits = bb84::measure(quantum_channel, bob_bases);

    // 3. Receive Alice's Classical Bases
    std::vector<uint8_t> alice_bases(bb84::NUM_QUBITS);
    total_rec = 0;
    while(total_rec < bb84::NUM_QUBITS) {
        int r = recv(client_fd, (char*)alice_bases.data() + total_rec, bb84::NUM_QUBITS - total_rec, 0);
        if (r <= 0) break;
        total_rec += r;
    }

    // 4. Compare bases, keep matching bits indices
    std::vector<int> common_indices;
    for (int i = 0; i < bb84::NUM_QUBITS; i++) {
        if (alice_bases[i] == bob_bases[i]) {
            common_indices.push_back(i);
        }
    }

    // 5. Send matching count and indices back to Alice
    int common_count = common_indices.size();
    send(client_fd, (const char*)&common_count, sizeof(common_count), 0);
    send(client_fd, (const char*)common_indices.data(), common_count * sizeof(int), 0);

    // Build the sifted key
    std::vector<uint8_t> sifted_key;
    for (int idx : common_indices) {
        sifted_key.push_back(measured_bits[idx]);
    }

    // 6. Receive Validation Segment from Alice to check Eavesdropping
    int check_bits_count = 0;
    recv(client_fd, (char*)&check_bits_count, sizeof(check_bits_count), 0);
    std::vector<uint8_t> alice_validation(check_bits_count);
    recv(client_fd, (char*)alice_validation.data(), check_bits_count, 0);

    // 7. Receive Pulse Types from Alice (Revealed AFTER measurement)
    std::vector<uint8_t> alice_pulse_types(bb84::NUM_QUBITS);
    int total_pt = 0;
    while(total_pt < bb84::NUM_QUBITS) {
        int r = recv(client_fd, (char*)alice_pulse_types.data() + total_pt, bb84::NUM_QUBITS - total_pt, 0);
        if (r <= 0) break;
        total_pt += r;
    }

    // 8. Eavesdropper & PNS Detection Logic
    bool is_evesdropping = false; // Fixes C2065 (undeclared identifier)

    // Check 1: Standard Bit Error Rate (QBER)
    for (int i = 0; i < check_bits_count; i++) {
        if (sifted_key[i] != alice_validation[i]) {
            is_evesdropping = true;
            break;
        }
    }

    // Check 2: Decoy State Analysis (PNS Defense)
    int signal_sent = 0, signal_measured = 0;
    int decoy_sent = 0, decoy_measured = 0;

    for(int i = 0; i < bb84::NUM_QUBITS; i++) {
        if (alice_pulse_types[i] == bb84::SIGNAL) signal_sent++;
        else if (alice_pulse_types[i] == bb84::DECOY) decoy_sent++;
    }

    for (int idx : common_indices) {
        if (alice_pulse_types[idx] == bb84::SIGNAL) signal_measured++;
        else if (alice_pulse_types[idx] == bb84::DECOY) decoy_measured++;
    }

    double yield_signal = (signal_sent > 0) ? (double)signal_measured / signal_sent : 0;
    double yield_decoy = (decoy_sent > 0) ? (double)decoy_measured / decoy_sent : 0;

    // Threshold: Decoy yield should be ~50% (basis match). If it's way lower than Signal, Eve is splitting.
    if (yield_decoy < (yield_signal * 0.6)) { 
        is_evesdropping = true;
        std::cerr << "[Bob] PNS Attack Detected! Signal Yield: " << yield_signal << " Decoy Yield: " << yield_decoy << "\n";
    }

    // 9. Send Validation Result back to Alice
    uint8_t validation_result = is_evesdropping ? 0 : 1;
    send(client_fd, (const char*)&validation_result, 1, 0);

    if (!is_evesdropping) {
        std::cerr << "[Bob] BB84 SUCCESS! No eavesdropper detected.\n";
        std::cerr << "[Bob] Applying Universal Hashing (Privacy Amplification)...\n";
        bb84_success = true;
        session_key = bb84::universal_hash(sifted_key);
    } else {
        std::cerr << "\n[!] WARNING [!] BB84 EAVESDROPPER DETECTED OR HIGH NOISE!\n";
        std::cerr << "[Bob] Falling back to traditional Post-Quantum ML-KEM.\n";
    }
    
    // ==========================================
    // PHASE 2: FALLBACK TO ML-KEM
    // ==========================================
    if (!bb84_success) {
        std::cerr << "\n--- [ BOB ] STARTING ML-KEM FALLBACK ---\n";
        std::vector<uint8_t> ek(kem->length_public_key);
        int total_received = 0;
        int remaining = kem->length_public_key;

        // 1. Receive Public Key
        while (remaining > 0) {
            int bytes_read = recv(client_fd, (char*)ek.data() + total_received, remaining, 0);
            if (bytes_read <= 0) break;
            total_received += bytes_read;
            remaining -= bytes_read;
        }

        if (total_received == kem->length_public_key) {
            // 2. Encapsulate
            std::vector<uint8_t> ciphertext(kem->length_ciphertext);
            std::vector<uint8_t> shared_secret(kem->length_shared_secret);
            OQS_KEM_encaps(kem, ciphertext.data(), shared_secret.data(), ek.data());

            // 3. Send Ciphertext
            send(client_fd, (const char*)ciphertext.data(), ciphertext.size(), 0);
            std::cerr << "[Bob] Ciphertext sent. Key Exchange Complete.\n";
            print_hex("[Bob] Shared ML-KEM Secret: ", shared_secret.data(), shared_secret.size());

            // Establish ML-KEM output as AES-256 Symmetric Fallback Key
            session_key = shared_secret;
        } else {
            std::cerr << "[Bob] Error: Failed to receive full public key.\n";
        }
    }

    std::cerr << "\n--- SECURE SYMMETRIC ENCRYPTED SESSION ESTABLISHED ---\n";

    // 4. Send Bob's payload encrypted
    crypto::send_framed_payload(client_fd, custom_message, session_key);
    std::cerr << "[Bob] Sent encrypted custom payload\n";

    // 5. Check for Alice's confirmation messages using Framing chunk receiver
    std::string alice_msg = crypto::recv_framed_payload(client_fd, session_key);
    if (!alice_msg.empty()) {
        std::cerr << "[Bob] Received decoded payload.\n";
        std::cout.write(alice_msg.c_str(), alice_msg.size());
        std::cout.flush();
    }

    closesocket(client_fd);
    OQS_KEM_free(kem);
    WSACleanup();
    return 0;
}
