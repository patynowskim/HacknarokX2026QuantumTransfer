#pragma once
#include <vector>
#include <random>
#include <iostream>

namespace bb84 {
    const int NUM_QUBITS = 1024;
    const int CHECK_BITS = 32; // Simplified for display

    uint8_t random_bit() {
        static std::mt19937 gen(std::random_device{}());
        std::uniform_int_distribution<> dis(0, 1);
        return dis(gen);
    }

    std::vector<uint8_t> generate_bits(int n) {
        std::vector<uint8_t> v(n);
        for(auto &x : v) x = random_bit();
        return v;
    }

    struct Qubit {
        uint8_t value;
        uint8_t basis; // 0 for Z, 1 for X
    };

    std::vector<Qubit> encode(const std::vector<uint8_t>& bits, const std::vector<uint8_t>& bases) {
        std::vector<Qubit> q(bits.size());
        for(size_t i = 0; i < bits.size(); i++) {
            q[i].value = bits[i];
            q[i].basis = bases[i];
        }
        return q;
    }

    std::vector<uint8_t> measure(const std::vector<Qubit>& qubits, const std::vector<uint8_t>& bob_bases) {
        std::vector<uint8_t> measured(qubits.size());
        for(size_t i = 0; i < qubits.size(); i++) {
            // Quantum mechanics simulation: if bases match, bit is 100% accurate. Else 50/50.
            if (qubits[i].basis == bob_bases[i]) {
                measured[i] = qubits[i].value;
            } else {
                measured[i] = random_bit();
            }
        }
        return measured;
    }
}