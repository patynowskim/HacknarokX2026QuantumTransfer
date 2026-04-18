#include <iostream>
#include <vector>
#include <string>
#ifdef _WIN32
  #define NOMINMAX
  #include <winsock2.h>
  #include <ws2tcpip.h>
  #pragma comment(lib, "Ws2_32.lib")
#else
  #include <sys/socket.h>
  #include <arpa/inet.h>
  #include <unistd.h>
  #include <netdb.h>
  #include <algorithm>
  #define SOCKET int
  #define INVALID_SOCKET (-1)
  #define SOCKET_ERROR (-1)
  #define closesocket close
#endif

#include "bb84.hpp"

void relay_data(SOCKET from, SOCKET to, const std::string& label, bool modify_quantum = false) {
    char buffer[4096];
    int bytes = recv(from, buffer, sizeof(buffer), 0);
    if (bytes > 0) {
        if (modify_quantum && bytes >= (int)sizeof(bb84::Qubit)) {
            std::cerr << "[Eve] Intercepting Qubits! Measuring and resending...\n";
            int num_qubits = bytes / sizeof(bb84::Qubit);
            bb84::Qubit* qubits = (bb84::Qubit*)buffer;
            
            for (int i = 0; i < num_qubits; i++) {
                uint8_t eve_basis = rand() % 2;
                if (qubits[i].basis != eve_basis) {
                    qubits[i].value = rand() % 2;
                    qubits[i].basis = eve_basis;
                }
            }
        }
        std::cerr << "[Eve] Relaying " << bytes << " bytes from " << label << "\n";
        send(to, buffer, bytes, 0);
    }
}

int main(int argc, char* argv[]) {
#ifdef _WIN32
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);
#endif

    std::string alice_ip = "127.0.0.1";
    int alice_port = 8080;
    int listen_port = 8081;

    if (argc >= 2) alice_ip = argv[1];
    if (argc >= 3) alice_port = std::stoi(argv[2]);
    if (argc >= 4) listen_port = std::stoi(argv[3]);

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
    relay_data(to_alice, to_bob, "Alice (Qubits)", true);

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
#ifdef _WIN32
    WSACleanup();
#endif
    return 0;
}