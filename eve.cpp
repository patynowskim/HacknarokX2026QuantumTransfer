#include <iostream>
#include <vector>
#include <string>
#define NOMINMAX
#include <winsock2.h>
#include <ws2tcpip.h>
#include "bb84.hpp"

#pragma comment(lib, "Ws2_32.lib")

void relay_data(
    SOCKET from,
    SOCKET to,
    const std::string& label,
    bool modify_quantum = false,
    bool pns_attack = false,
    bool ddos_attack = false
) {
    char buffer[4096];
    int bytes = recv(from, buffer, sizeof(buffer), 0);
    if (bytes > 0) {
        if (modify_quantum && bytes >= (int)sizeof(bb84::Qubit)) {
            int num_qubits = bytes / sizeof(bb84::Qubit);
            bb84::Qubit* qubits = (bb84::Qubit*)buffer;

            if (pns_attack) {
                std::cerr << "[Eve] Performing PNS attack on quantum channel...\n";

                for (int i = 0; i < num_qubits; i++) {
                    if (qubits[i].pulse_type == bb84::SIGNAL) {
                    }
                    else if (qubits[i].pulse_type == bb84::DECOY) {
                        uint8_t eve_basis = rand() % 2;
                        if (qubits[i].basis != eve_basis) {
                            qubits[i].value = rand() % 2;
                            qubits[i].basis = eve_basis;
                        }
                    }
                }

            } else {
                std::cerr << "[Eve] Intercept-resend attack...\n";

                for (int i = 0; i < num_qubits; i++) {
                    uint8_t eve_basis = rand() % 2;
                    if (qubits[i].basis != eve_basis) {
                        qubits[i].value = rand() % 2;
                        qubits[i].basis = eve_basis;
                    }
                }
            }
        }
        std::cerr << "[Eve] Relaying " << bytes << " bytes from " << label << "\n";
        send(to, buffer, bytes, 0);

        // DDoS implementation
        if (ddos_attack) {
            std::cerr << "[Eve] DDoS: flooding channel...\n";

            for (int i = 0; i < 5; i++) {
                send(to, buffer, bytes, 0);
            }

            char junk[512];
            for (int i = 0; i < 512; i++) {
                junk[i] = rand() % 256;
            }

            for (int i = 0; i < 5; i++) {
                send(to, junk, sizeof(junk), 0);
            }
        }
    }
}

int main(int argc, char* argv[]) {
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);

    std::string alice_ip = "127.0.0.1";
    int alice_port = 8080;
    int listen_port = 8081;

    if (argc >= 2) alice_ip = argv[1];
    if (argc >= 3) alice_port = std::stoi(argv[2]);
    if (argc >= 4) listen_port = std::stoi(argv[3]);

    bool pns_attack = false;
    bool ddos_attack = false;

    for (int i = 1; i < argc; i++) {
        std::string arg = argv[i];
        if (arg == "--pns") pns_attack = true;
        if (arg == "--ddos") ddos_attack = true;
    }

    // 1. Connect to Alice
    SOCKET to_alice = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in alice_addr{};
    alice_addr.sin_family = AF_INET;
    inet_pton(AF_INET, alice_ip.c_str(), &alice_addr.sin_addr);
    alice_addr.sin_port = htons(alice_port);

    if (connect(to_alice, (struct sockaddr*)&alice_addr, sizeof(alice_addr)) == SOCKET_ERROR) {
        std::cerr << "Could not connect to Alice. Is she running?\n";
        return 1;
    }

    // 2. Listen for Bob
    SOCKET listen_sock = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in listen_addr{};
    listen_addr.sin_family = AF_INET;
    listen_addr.sin_addr.s_addr = INADDR_ANY;
    listen_addr.sin_port = htons(listen_port);
    bind(listen_sock, (struct sockaddr*)&listen_addr, sizeof(listen_addr));
    listen(listen_sock, 1);

    std::cerr << "[Eve] MITM Active. Alice: " << alice_port << " <-> Bob: " << listen_port << "\n";
    SOCKET to_bob = accept(listen_sock, nullptr, nullptr);

    // 3. Intercept Phase 1: The Qubits (Alice -> Bob)
    relay_data(to_alice, to_bob, "Alice (Qubits)", true, pns_attack, ddos_attack);

    // 4. Relay all subsequent traffic (Classical Channels)
    while (true) {
        fd_set read_fds;
        FD_ZERO(&read_fds);
        FD_SET(to_alice, &read_fds);
        FD_SET(to_bob, &read_fds);

        if (select(0, &read_fds, nullptr, nullptr, nullptr) > 0) {
            if (FD_ISSET(to_alice, &read_fds)) relay_data(to_alice, to_bob, "Alice -> Bob");
            if (FD_ISSET(to_bob, &read_fds)) relay_data(to_bob, to_alice, "Bob -> Alice");
        }
    }

    closesocket(to_alice);
    closesocket(to_bob);
    WSACleanup();
    return 0;
}