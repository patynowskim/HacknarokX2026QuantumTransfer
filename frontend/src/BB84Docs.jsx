import { Link } from 'react-router-dom';

function BB84Docs() {
  return (
    <div className='documentation'>
      <h1>Dokumentacja: BB-84 Protocol Implementation</h1>

      <section>
        <h3>Opis Modułu</h3>
        <p>Moduł odpowiedzialny za symulację wymiany klucza kryptograficznego i protokół Decoy-State dla obrony przed atakami typu Photon Number Splitting (PNS).</p>
      </section>

      <section>
        <h3>Plik: bb84.hpp</h3>
        <pre><code className='language-cpp'>
#pragma once
#include &lt;vector&gt;
#include &lt;random&gt;
#include "QuantumCircuit.hpp"

namespace bb84 &#123;
    const int NUM_QUBITS = 1024;
    const int CHECK_BITS = 32;

    //Decoy States for Photon Number Split attack
    enum PulseType &#123; SIGNAL = 0, DECOY = 1, VACUUM = 2 &#125;;

    #pragma pack(push, 1)
    struct Qubit &#123;
        uint8_t value;
        uint8_t basis;
        uint8_t pulse_type;
    &#125;;
    #pragma pack(pop)

    inline uint8_t select_pulse_type() &#123;
        static std::random_device rd;
        static std::mt19937 gen(rd());
        std::uniform_real_distribution&lt;&gt; dis(0.0, 1.0);
        double r = dis(gen);
        if (r &lt; 0.70) return SIGNAL;
        if (r &lt; 0.90) return DECOY;
        return VACUUM;
    &#125;

    //QRNG instead of default RNG to prevent reconstructing pseudo-number generator
    inline uint8_t qrng_bit() &#123;
        QuantumCircuit qc(1);
        qc.apply_gate(QG::H, 0);
        
        auto probs = qc.probabilities();
        static std::random_device rd;
        static std::mt19937 gen(rd());
        std::uniform_real_distribution&lt;&gt; dis(0.0, 1.0);
        
        double p0 = (probs.count("0")) ? probs.at("0") : 0.0;
        return (dis(gen) &lt; p0) ? 0 : 1;
    &#125;

    inline std::vector&lt;uint8_t&gt; generate_bits_qrng(int n) &#123;
        std::vector&lt;uint8_t&gt; v(n);
        for(auto &amp;x : v) x = qrng_bit();
        return v;
    &#125;

    // Deprecated RNG functions
    inline uint8_t random_bit() &#123;
        static std::mt19937 gen(std::random_device&#123;&#125;());
        std::uniform_int_distribution&lt;&gt; dis(0, 1);
        return dis(gen);
    &#125;

    inline std::vector&lt;uint8_t&gt; generate_bits(int n) &#123;
        std::vector&lt;uint8_t&gt; v(n);
        for(auto &amp;x : v) x = random_bit();
        return v;
    &#125;

    inline std::vector&lt;Qubit&gt; encode(const std::vector&lt;uint8_t&gt;&amp; bits, const std::vector&lt;uint8_t&gt;&amp; bases) &#123;
        std::vector&lt;Qubit&gt; q(bits.size());
        for(size_t i = 0; i &lt; bits.size(); i++) &#123;
            q[i].value = bits[i];
            q[i].basis = bases[i];
        &#125;
        return q;
    &#125;

    inline std::vector&lt;uint8_t&gt; measure(const std::vector&lt;Qubit&gt;&amp; qubits, const std::vector&lt;uint8_t&gt;&amp; bob_bases) &#123;
        std::vector&lt;uint8_t&gt; measured(qubits.size());
        QuantumCircuit qc(1); 

        for(size_t i = 0; i &lt; qubits.size(); i++) &#123;
            qc.reset();
            // Alice prepares state
            if (qubits[i].value == 1) qc.apply_gate(QG::X, 0);
            if (qubits[i].basis == 1) qc.apply_gate(QG::H, 0);

            // Bob chooses measurement basis
            if (bob_bases[i] == 1) qc.apply_gate(QG::H, 0);

            // Simulation of measurement via probabilities
            auto probs = qc.probabilities();
            double p1 = (probs.count("1")) ? probs.at("1") : 0.0;

            if (qubits[i].basis == bob_bases[i]) &#123;
                measured[i] = qubits[i].value;
            &#125; else &#123;
                measured[i] = qrng_bit();
            &#125;
        &#125;
        return measured;
    &#125;

    inline std::vector&lt;uint8_t&gt; universal_hash(const std::vector&lt;uint8_t&gt;&amp; input_bits) &#123;
        std::vector&lt;uint8_t&gt; output_key(32, 0);
        
        for (int i = 0; i &lt; 256; ++i) &#123;
            uint8_t bit_sum = 0;
            std::mt19937 gen(1337 + i); 
            
            for (size_t j = 0; j &lt; input_bits.size(); j++) &#123;
                uint8_t matrix_element = gen() % 2; 
                bit_sum ^= (input_bits[j] &amp; matrix_element);
            &#125;
            
            if (bit_sum) &#123;
                output_key[i / 8] |= (1 &lt;&lt; (i % 8));
            &#125;
        &#125;
        return output_key;
    &#125;
&#125;
        </code></pre>
      </section>

      <div className="row justify-content-center mt-4">
        <div className="col-auto">
          <Link to="/">
            <button className='btn btn-secondary p-2'>Strona główna</button>
          </Link>
        </div>
        <div className="col-auto">
          <Link to="/simulation">
            <button className='btn btn-secondary p-2'>Symulacja</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BB84Docs;
