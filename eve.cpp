#include <iostream>
#include <vector>
#include <string>
#include <time.h>
#define NOMINMAX
#include <winsock2.h>
#include <ws2tcpip.h>
#include "bb84.hpp"
#include <thread>
#include <chrono>

#pragma comment(lib, "Ws2_32.lib")

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
    char first_byte;

    // 1. Bob → Eve
    if (!recv_exact(to_bob, &first_byte, 1)) {
        std::cerr << "[Eve] Failed to receive handshake from Bob\n";
        return 1;
    }

    // 2. Eve → Alice
    send(to_alice, &first_byte, 1, 0);

    // 3. Alice → Eve (mode)
    if (!recv_exact(to_alice, &first_byte, 1)) {
        std::cerr << "[Eve] Failed to receive mode from Alice\n";
        return 1;
    }
    
    char mode = first_byte;

    // 4. Eve → Bob
    send(to_bob, &first_byte, 1, 0);

    std::cerr << "[Eve] Relayed handshake + mode\n";

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
                        qubits[i].basis = rand() % 2;
                        qubits[i].value = rand() % 2;
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

                send(to_alice, buffer, b, 0);

                if (ddos_attack) {
                    ddos_attack = false; // Only trigger the background attack once
                    std::cerr << "[Eve] DDoS: Launching Slowloris-style connection exhaustion...\n";

                    std::thread([alice_addr]() {
                        const int attack_connections = 50;

                        for (int i = 0; i < attack_connections; i++) {
                            SOCKET spam_sock = socket(AF_INET, SOCK_STREAM, 0);
                            if (spam_sock == INVALID_SOCKET) continue;

                            // Set a short timeout for the socket so we don't wait forever on full Linux backlog
                            struct timeval timeout;
                            timeout.tv_sec = 1;
                            timeout.tv_usec = 0;
                            setsockopt(spam_sock, SOL_SOCKET, SO_SNDTIMEO, (const char*)&timeout, sizeof(timeout));

                            sockaddr_in target = alice_addr;

                            if (connect(spam_sock, (struct sockaddr*)&target, sizeof(target)) != SOCKET_ERROR) {
                                char partial = 0x01;
                                send(spam_sock, &partial, 1, 0);
                            } else {
                                closesocket(spam_sock);
                            }

                            std::this_thread::sleep_for(std::chrono::milliseconds(50));
                        }
                    }).detach();
                }
            }
        }
    }

    closesocket(to_alice);
    closesocket(to_bob);
    WSACleanup();
    return 0;
}