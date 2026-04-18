#pragma once
#include <iostream>
#include <complex>
#include <cmath>
#include <vector>
#include <cassert>
#include <map>
#include <string>
#include <random>
#include <functional>
#include <stdexcept>
#include <algorithm>
using namespace std;

const double invSqrt2 = 1.0 / sqrt(2.0);
const double PI = acos(-1.0);

//Logic gates
const complex<double> X[2][2] = {
{ {0.0, 0.0}, {1.0, 0.0} },
{ {1.0, 0.0}, {0.0, 0.0} }
};
const complex<double> H[2][2] = {
    { {invSqrt2, 0.0},  {invSqrt2, 0.0} },
    { {invSqrt2, 0.0}, {-invSqrt2, 0.0} }
};
const complex<double> I[2][2] = {
    { {1.0, 0.0}, {0.0, 0.0} },
    { {0.0, 0.0}, {1.0, 0.0} }
};
const complex<double> Y[2][2] = {
    { {0.0, 0.0}, {0.0, -1.0} },
    { {0.0, 1.0}, {0.0,  0.0} }
};
const complex<double> Z[2][2] = {
    { {1.0, 0.0},  {0.0, 0.0} },
    { {0.0, 0.0}, {-1.0, 0.0} }
};
const complex<double> S[2][2] = {
    { {1.0, 0.0}, {0.0, 0.0} },
    { {0.0, 0.0}, {cos(PI / 2.0), sin(PI / 2.0)}}
};
const complex<double> T[2][2] = {
    { {1.0, 0.0}, {0.0, 0.0} },
    { {0.0, 0.0}, {cos(PI / 4.0), sin(PI / 4.0)} }
};

class QuantumCircut {
private:
    //qubits number
    int n;
    size_t dim;
    vector<complex<double>> state;

public:
    //Constructor
    QuantumCircut(int num_qubits) {
        assert(num_qubits >= 1);
        n = num_qubits;
        dim = 1ULL << n;
        state.assign(dim, { 0.0, 0.0 });
        state[0] = { 1.0, 0.0 };
    }
    void apply_gate(const complex<double> gate[2][2], int target) {
        if (target < 0 || target >= n) {
            throw out_of_range("target out of range");
        }

        size_t bit = 1ULL << target;

        for (size_t i = 0; i < dim; ++i) {
            if ((i & bit) == 0) {
                size_t j = i | bit;

                complex<double> v0 = state[i];
                complex<double> v1 = state[j];

                state[i] = gate[0][0] * v0 + gate[0][1] * v1;
                state[j] = gate[1][0] * v0 + gate[1][1] * v1;
            }
        }
    }
    void apply_control(const complex<double> gate[2][2], int control, int target) {
        if (control == target) {
            throw invalid_argument("control and target must be different");
        }
        if (control < 0 || control >= n || target < 0 || target >= n) {
            throw out_of_range("control/target out of range");
        }

        vector<complex<double>> new_state = state;

        for (size_t base = 0; base < dim; ++base) {
            if (((base >> target) & 1) != 0) {
                continue;
            }
            if (((base >> control) & 1) == 1) {
                size_t i0 = base;
                size_t i1 = base | (1ULL << target);

                complex<double> a0 = state[i0];
                complex<double> a1 = state[i1];

                new_state[i0] = gate[0][0] * a0 + gate[0][1] * a1;
                new_state[i1] = gate[1][0] * a0 + gate[1][1] * a1;
            }
        }
        state = new_state;
    }
    void apply_multi_control(const complex<double> gate[2][2], const vector<int>& controls, int target) {
        size_t n_controls = controls.size();

        if (n_controls == 0) {
            apply_gate(gate, target);
        }
        else if (n_controls == 1) {
            apply_control(gate, controls[0], target);
        }
        else if (n_controls == 2) {
            vector<complex<double>> new_state = state;
            size_t mask1 = 1ULL << controls[0];
            size_t mask2 = 1ULL << controls[1];

            for (size_t base = 0; base < dim; ++base) {
                if (((base >> target) & 1) != 0) {
                    continue;
                }
                if ((base & mask1) && (base & mask2)) {
                    size_t i0 = base;
                    size_t i1 = base | (1ULL << target);

                    complex<double> a0 = state[i0];
                    complex<double> a1 = state[i1];

                    new_state[i0] = gate[0][0] * a0 + gate[0][1] * a1;
                    new_state[i1] = gate[1][0] * a0 + gate[1][1] * a1;
                }
            }
            state = new_state;
        }
        else {
            int temp = controls.back();
            vector<int> remaining(controls.begin(), controls.end() - 1);
            vector<int> two_controls = { temp, controls[n_controls - 2] };

            apply_multi_control(X, remaining, temp);
            apply_multi_control(gate, two_controls, target);
            apply_multi_control(X, remaining, temp);
        }
    }
    void apply_swap(int qubit1, int qubit2) {
        if (qubit1 == qubit2) {
            return;
        }
        if (qubit1 < 0 || qubit1 >= n || qubit2 < 0 || qubit2 >= n) {
            throw out_of_range("qubit index out of range");
        }

        vector<complex<double>> new_state = state;

        for (size_t i = 0; i < dim; ++i) {
            size_t bit1 = (i >> qubit1) & 1;
            size_t bit2 = (i >> qubit2) & 1;

            if (bit1 != bit2) {
                size_t j = i ^ ((1ULL << qubit1) | (1ULL << qubit2));
                new_state[j] = state[i];
                new_state[i] = state[j];
            }
        }
        state = new_state;
    }
    void get_r(int k, complex<double> Rk[2][2]) {
        double theta = PI / (1ULL << k);
        Rk[0][0] = { 1.0, 0.0 };
        Rk[0][1] = { 0.0, 0.0 };
        Rk[1][0] = { 0.0, 0.0 };
        Rk[1][1] = { cos(theta), sin(theta) };
    }
    void get_r_inv(int k, complex<double> Rk[2][2]) {
        double theta = -PI / (1ULL << k);
        Rk[0][0] = { 1.0, 0.0 };
        Rk[0][1] = { 0.0, 0.0 };
        Rk[1][0] = { 0.0, 0.0 };
        Rk[1][1] = { cos(theta), sin(theta) };
    }
    void apply_qft(const vector<int>& qubits, bool inverse = false) {
        int n_q = qubits.size();

        if (!inverse) {
            for (int i = 0; i < n_q; ++i) {
                apply_gate(H, qubits[i]);
                for (int j = 1; j < n_q - i; ++j) {
                    int ctrl = qubits[i + j];
                    int target = qubits[i];
                    complex<double> Rk[2][2];
                    get_r(j, Rk);
                    apply_control(Rk, ctrl, target);
                }
            }
        }
        else {
            for (int i = n_q - 1; i >= 0; --i) {
                for (int j = n_q - i - 1; j >= 1; --j) {
                    int ctrl = qubits[i + j];
                    int target = qubits[i];
                    complex<double> Rk[2][2];
                    get_r_inv(j, Rk);
                    apply_control(Rk, ctrl, target);
                }
                apply_gate(H, qubits[i]);
            }
        }

        for (int i = 0; i < n_q / 2; ++i) {
            apply_swap(qubits[i], qubits[n_q - i - 1]);
        }
    }
    string to_binary_string(size_t val, int width) {
        string s = "";
        for (int i = width - 1; i >= 0; --i) {
            s += ((val >> i) & 1) ? '1' : '0';
        }
        return s;
    }
    map<string, double> probabilities() {
        map<string, double> probs_map;
        for (size_t i = 0; i < dim; ++i) {
            double p = norm(state[i]);
            if (p > 1e-15) {
                probs_map[to_binary_string(i, n)] = p;
            }
        }
        return probs_map;
    }
    map<string, int> sample_measurement(int shots = 1) {
        vector<double> probs(dim);
        for (size_t i = 0; i < dim; ++i) {
            probs[i] = norm(state[i]);
        }

        random_device rd;
        mt19937 gen(rd());
        discrete_distribution<size_t> d(probs.begin(), probs.end());

        map<string, int> counts;
        for (int i = 0; i < shots; ++i) {
            size_t idx = d(gen);
            counts[to_binary_string(idx, n)]++;
        }
        return counts;
    }
    void reset() {
        fill(state.begin(), state.end(), complex<double>{0.0, 0.0});
        state[0] = { 1.0, 0.0 };
    }
    void apply_qpe(const function<void(int, const vector<int>&, int)>& unitary_func, const vector<int>& target_qubits, const vector<int>& eigenstate_qubits) {
        int n_count = target_qubits.size();

        for (int q : target_qubits) {
            apply_gate(H, q);
        }

        for (int j = 0; j < n_count; ++j) {
            int power = 1ULL << j;
            unitary_func(power, eigenstate_qubits, target_qubits[j]);
        }

        vector<int> reversed_targets = target_qubits;
        reverse(reversed_targets.begin(), reversed_targets.end());
        apply_qft(reversed_targets, false);
    }
    void apply_Uf(const function<int(int, const vector<int>&)>& f, const vector<int>& controls, int target, bool per_qubit = false) {
        vector<complex<double>> new_state = state;

        for (size_t i = 0; i < dim; ++i) {
            vector<int> bits;
            int x_int = 0;

            for (size_t idx = 0; idx < controls.size(); ++idx) {
                int q = controls[idx];
                int bit = (i >> q) & 1;
                bits.push_back(bit);
                x_int += (bit << idx);
            }

            int fx = 0;
            if (per_qubit) {
                for (int b : bits) {
                    fx ^= f(b, vector<int>{b});
                }
            }
            else {
                fx = f(x_int, bits);
            }

            if (fx != 0 && fx != 1) {
                throw invalid_argument("f(x) must return 0 or 1");
            }

            if (fx == 1) {
                size_t j = i ^ (1ULL << target);
                new_state[j] = state[i];
            }
            else {
                new_state[i] = state[i];
            }
        }
        state = new_state;
    }
};

