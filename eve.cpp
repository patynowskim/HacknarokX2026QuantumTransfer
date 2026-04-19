#include <iostream>
#include <vector>
#include <string>
#include <time.h>
#define NOMINMAX
#include <winsock2.h>
#include <ws2tcpip.h>
#include "bb84.hpp"

#pragma comment(lib, "Ws2_32.lib")

// Helper to ensure we get exactly what we need before modifying
bool recv_exact(SOCKET s, char* buf, int len) {
    int total = 0;
    while (total < len) {
        int r = recv(s, buf + total, len - total, 0);
        if (r <= 0) return false;
        total += r;
    }
    return true;
}

int main(int argc, char* argv[]) {
    srand(time(NULL));
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);

    std::string alice_ip = "127.0.0.1";
    int alice_port = std::stoi(argv[2]);
    int listen_port = std::stoi(argv[3]);
    bool pns_attack = false, ddos_attack = false;

    for (int i = 4; i < argc; i++) {
        std::string arg = argv[i];
        if (arg == "--pns") pns_attack = true;
        if (arg == "--ddos") ddos_attack = true;
    }

    SOCKET to_alice = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in alice_addr{};
    alice_addr.sin_family = AF_INET;
    inet_pton(AF_INET, alice_ip.c_str(), &alice_addr.sin_addr);
    alice_addr.sin_port = htons(alice_port);

    if (connect(to_alice, (struct sockaddr*)&alice_addr, sizeof(alice_addr)) == SOCKET_ERROR) {
        std::cerr << "[Eve] Connection to Alice failed.\n";
        return 1;
    }

    SOCKET listen_sock = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in listen_addr{};
    listen_addr.sin_family = AF_INET;
    listen_addr.sin_addr.s_addr = INADDR_ANY;
    listen_addr.sin_port = htons(listen_port);
    bind(listen_sock, (struct sockaddr*)&listen_addr, sizeof(listen_addr));
    listen(listen_sock, 1);

    std::cerr << "[Eve] MITM Proxy Active. Waiting for Bob...\n";
    SOCKET to_bob = accept(listen_sock, nullptr, nullptr);
    std::cerr << "[Eve] Bob connected. Intercepting...\n";

    // --- STEP 1: RELAY MODE BYTE ---
    char mode;
    recv(to_alice, &mode, 1, 0);
    send(to_bob, &mode, 1, 0);
    std::cerr << "[Eve] Relayed Mode: " << (int)mode << "\n";

    // --- STEP 2: INTERCEPT QUBITS (If BB84) ---
    if (mode == 0x01) {
        int qubit_payload_size = bb84::NUM_QUBITS * sizeof(bb84::Qubit);
        std::vector<char> q_buffer(qubit_payload_size);
        
        if (recv_exact(to_alice, q_buffer.data(), qubit_payload_size)) {
            bb84::Qubit* qubits = (bb84::Qubit*)q_buffer.data();
            
            if (pns_attack) {
                std::cerr << "[Eve] Attacking Decoy States (PNS)...\n";
                for(int i=0; i<bb84::NUM_QUBITS; i++) {
                    if (qubits[i].pulse_type == bb84::DECOY) {
                        qubits[i].basis = rand() % 2; // Measure in wrong basis
                        qubits[i].value = rand() % 2; // Distort value
                    }
                }
            } else {
                std::cerr << "[Eve] Intercept-Resend Attack...\n";
                for(int i=0; i<bb84::NUM_QUBITS; i++) {
                    qubits[i].basis = rand() % 2; 
                    qubits[i].value = rand() % 2;
                }
            }
            send(to_bob, q_buffer.data(), qubit_payload_size, 0);
        }
    }

    // --- STEP 3: GENERAL RELAY ---
    std::cerr << "[Eve] Entering Classical Relay Mode...\n";
    char buffer[8192];
    while (true) {
        fd_set read_fds;
        FD_ZERO(&read_fds);
        FD_SET(to_alice, &read_fds);
        FD_SET(to_bob, &read_fds);

        int max_fd = (int)(to_alice > to_bob ? to_alice : to_bob) + 1;
        if (select(max_fd, &read_fds, nullptr, nullptr, nullptr) > 0) {
            if (FD_ISSET(to_alice, &read_fds)) {
                int b = recv(to_alice, buffer, sizeof(buffer), 0);
                if (b <= 0) break;
                send(to_bob, buffer, b, 0);
            }
            if (FD_ISSET(to_bob, &read_fds)) {
                int b = recv(to_bob, buffer, sizeof(buffer), 0);
                if (b <= 0) break;
                // If DDoS is on, we flood Bob when he tries to talk to Alice
                if (ddos_attack) {
                    std::cerr << "[Eve] DDoS: Interfering with Bob's response...\n";
                    for(int i=0; i<3; i++) send(to_alice, "JUNK", 4, 0);
                }
                send(to_alice, buffer, b, 0);
            }
        }
    }

    closesocket(to_alice);
    closesocket(to_bob);
    WSACleanup();
    return 0;
}