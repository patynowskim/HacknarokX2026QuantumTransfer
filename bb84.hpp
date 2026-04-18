#pragma once
#include <vector>
#include <random>
#include "QuantumCircuit.hpp"

namespace bb84 {
    const int NUM_QUBITS = 1024;
    const int CHECK_BITS = 32;

    enum PulseType { SIGNAL = 0, DECOY = 1, VACUUM = 2 };

    struct Qubit {
        uint8_t value;
        uint8_t basis;
        uint8_t pulse_type;
    };

    inline uint8_t select_pulse_type() {
        static std::random_device rd;
        static std::mt19937 gen(rd());
        std::uniform_real_distribution<> dis(0.0, 1.0);
        double r = dis(gen);
        if (r < 0.70) return SIGNAL;
        if (r < 0.90) return DECOY;
        return VACUUM;
    }

    //QRNG instead of default RNG to prevent reconstructing pseudo-number generator
    inline uint8_t qrng_bit() {
        QuantumCircuit qc(1);
        qc.apply_gate(QG::H, 0);
        
        auto probs = qc.probabilities();
        static std::random_device rd;
        static std::mt19937 gen(rd());
        std::uniform_real_distribution<> dis(0.0, 1.0);
        
        double p0 = (probs.count("0")) ? probs.at("0") : 0.0;
        return (dis(gen) < p0) ? 0 : 1;
    }

    inline std::vector<uint8_t> generate_bits_qrng(int n) {
        std::vector<uint8_t> v(n);
        for(auto &x : v) x = qrng_bit();
        return v;
    }

    // Deprecated RNG functions
    inline uint8_t random_bit() {
        static std::mt19937 gen(std::random_device{}());
        std::uniform_int_distribution<> dis(0, 1);
        return dis(gen);
    }

    inline std::vector<uint8_t> generate_bits(int n) {
        std::vector<uint8_t> v(n);
        for(auto &x : v) x = random_bit();
        return v;
    }

    inline std::vector<Qubit> encode(const std::vector<uint8_t>& bits, const std::vector<uint8_t>& bases) {
        std::vector<Qubit> q(bits.size());
        for(size_t i = 0; i < bits.size(); i++) {
            q[i].value = bits[i];
            q[i].basis = bases[i];
        }
        return q;
    }

    inline std::vector<uint8_t> measure(const std::vector<Qubit>& qubits, const std::vector<uint8_t>& bob_bases) {
        std::vector<uint8_t> measured(qubits.size());
        QuantumCircuit qc(1); 

        for(size_t i = 0; i < qubits.size(); i++) {
            qc.reset();
            // Alice prepares state
            if (qubits[i].value == 1) qc.apply_gate(QG::X, 0);
            if (qubits[i].basis == 1) qc.apply_gate(QG::H, 0);

            // Bob chooses measurement basis
            if (bob_bases[i] == 1) qc.apply_gate(QG::H, 0);

            // Simulation of measurement via probabilities
            auto probs = qc.probabilities();
            double p1 = (probs.count("1")) ? probs.at("1") : 0.0;

            if (p1 > 0.9) measured[i] = 1;
            else if (p1 < 0.1) measured[i] = 0;
            else measured[i] = random_bit();
        }
        return measured;
    }

    inline std::vector<uint8_t> universal_hash(const std::vector<uint8_t>& input_bits) {
        std::vector<uint8_t> output_key(32, 0);
        if (input_bits.size() < 256) return input_bits;

        std::mt19937 gen(42); 
        std::uniform_int_distribution<> dis(0, 1);

        for (int i = 0; i < 256; ++i) {
            uint8_t bit_sum = 0;
            for (size_t j = 0; j < input_bits.size(); j++) {
                uint8_t matrix_element = dis(gen);
                bit_sum ^= (input_bits[j] & matrix_element);
            }
            if (bit_sum) {
                output_key[i / 8] |= (1 << (i % 8));
            }
        }
        return output_key;
    }
}