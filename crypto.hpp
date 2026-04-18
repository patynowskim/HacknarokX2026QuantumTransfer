#pragma once
#include <vector>
#include <string>
#include <winsock2.h>
#include <iostream>

namespace crypto {
    // Prototypical XOR Cipher using the session key to act as AES-256 for symmetric payload encryption
    // In production, this would be replaced by AES-256-GCM or ChaCha20-Poly1305.
    void encrypt_decrypt(std::string& data, const std::vector<uint8_t>& key) {
        if (key.empty()) return;
        for (size_t i = 0; i < data.size(); ++i) {
            data[i] ^= key[i % key.size()];
        }
    }

    void send_framed_payload(SOCKET s, const std::string& plaintext, const std::vector<uint8_t>& key) {
        std::string ciphertext = plaintext;
        encrypt_decrypt(ciphertext, key);
        
        // 1. Send Frame Length Prefix (4 bytes - network byte order)
        uint32_t len = htonl(static_cast<uint32_t>(ciphertext.size()));
        send(s, (const char*)&len, sizeof(len), 0);
        
        // 2. Send Encrypted Payload
        int total = 0;
        int remaining = ciphertext.size();
        while (remaining > 0) {
            int r = send(s, ciphertext.data() + total, remaining, 0);
            if (r <= 0) break;
            total += r;
            remaining -= r;
        }
    }

    std::string recv_framed_payload(SOCKET s, const std::vector<uint8_t>& key) {
        // 1. Receive Frame Length Prefix
        uint32_t nlen = 0;
        int r = recv(s, (char*)&nlen, sizeof(nlen), 0);
        if (r <= 0) return "";
        uint32_t len = ntohl(nlen);
        
        if (len == 0) return "";

        // 2. Receive Encrypted Payload precisely
        std::vector<char> buffer(len);
        uint32_t total = 0;
        while (total < len) {
            r = recv(s, buffer.data() + total, len - total, 0);
            if (r <= 0) break;
            total += r;
        }

        std::string ciphertext(buffer.data(), total);
        encrypt_decrypt(ciphertext, key);
        return ciphertext;
    }
}