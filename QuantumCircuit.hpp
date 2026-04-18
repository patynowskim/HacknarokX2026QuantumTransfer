#pragma once
#include <iostream>
#include <complex>
#include <cmath>
#include <vector>
#include <cassert>
#include <map>
#include <string>
#include <stdexcept>
#include <algorithm>

namespace QG {
    inline const double invSqrt2 = 1.0 / std::sqrt(2.0);
    inline const double PI = std::acos(-1.0);

    inline const std::complex<double> X[2][2] = {{{0,0},{1,0}}, {{1,0},{0,0}}};
    inline const std::complex<double> H[2][2] = {{{invSqrt2,0},{invSqrt2,0}}, {{invSqrt2,0},{-invSqrt2,0}}};
    inline const std::complex<double> I[2][2] = {{{1,0},{0,0}}, {{0,0},{1,0}}};
    inline const std::complex<double> Y[2][2] = {{{0,0},{0,-1}}, {{0,1},{0,0}}};
    inline const std::complex<double> Z[2][2] = {{{1,0},{0,0}}, {{0,0},{-1,0}}};
}

class QuantumCircuit {
private:
    int n;
    size_t dim;
    std::vector<std::complex<double>> state;

public:
    QuantumCircuit(int num_qubits) : n(num_qubits) {
        assert(n >= 1);
        dim = 1ULL << n;
        state.assign(dim, {0.0, 0.0});
        state[0] = {1.0, 0.0};
    }

    void apply_gate(const std::complex<double> gate[2][2], int target) {
        if (target < 0 || target >= n) throw std::out_of_range("target out of range");
        size_t bit = 1ULL << target;
        for (size_t i = 0; i < dim; ++i) {
            if ((i & bit) == 0) {
                size_t j = i | bit;
                std::complex<double> v0 = state[i];
                std::complex<double> v1 = state[j];
                state[i] = gate[0][0] * v0 + gate[0][1] * v1;
                state[j] = gate[1][0] * v0 + gate[1][1] * v1;
            }
        }
    }

    void reset() {
        std::fill(state.begin(), state.end(), std::complex<double>{0.0, 0.0});
        state[0] = {1.0, 0.0};
    }

    std::map<std::string, double> probabilities() {
        std::map<std::string, double> probs_map;
        for (size_t i = 0; i < dim; ++i) {
            double p = std::norm(state[i]);
            if (p > 1e-10) {
                std::string s = "";
                for (int b = n - 1; b >= 0; --b) s += ((i >> b) & 1) ? '1' : '0';
                probs_map[s] = p;
            }
        }
        return probs_map;
    }
};