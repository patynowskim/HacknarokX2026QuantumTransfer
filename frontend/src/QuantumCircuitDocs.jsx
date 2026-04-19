import { Link } from 'react-router-dom';

function QuantumCircuitDocs() {
  return (
    <div className='documentation'>
      <h1>Dokumentacja: Quantum Circuit Simulator</h1>

      <section>
        <h3>Opis Modułu</h3>
        <p>Wewnętrzny silnik symulacji operacji na kubitach, obsługujący bramki Hadamard, Pauli-X, Z, Y oraz prawdopodobieństwa pomiaru stanu.</p>
      </section>

      <section>
        <h3>Plik: QuantumCircuit.hpp</h3>
        <pre><code className='language-cpp'>
#pragma once
#include &lt;iostream&gt;
#include &lt;complex&gt;
#include &lt;cmath&gt;
#include &lt;vector&gt;
#include &lt;cassert&gt;
#include &lt;map&gt;
#include &lt;string&gt;
#include &lt;stdexcept&gt;
#include &lt;algorithm&gt;

namespace QG &#123;
    inline const double invSqrt2 = 1.0 / std::sqrt(2.0);
    inline const double PI = std::acos(-1.0);

    inline const std::complex&lt;double&gt; X[2][2] = &#123;&#123;&#123;0,0&#125;,&#123;1,0&#125;&#125;, &#123;&#123;1,0&#125;,&#123;0,0&#125;&#125;&#125;;
    inline const std::complex&lt;double&gt; H[2][2] = &#123;&#123;&#123;invSqrt2,0&#125;,&#123;invSqrt2,0&#125;&#125;, &#123;&#123;invSqrt2,0&#125;,&#123;-invSqrt2,0&#125;&#125;&#125;;
    inline const std::complex&lt;double&gt; I[2][2] = &#123;&#123;&#123;1,0&#125;,&#123;0,0&#125;&#125;, &#123;&#123;0,0&#125;,&#123;1,0&#125;&#125;&#125;;
    inline const std::complex&lt;double&gt; Y[2][2] = &#123;&#123;&#123;0,0&#125;,&#123;0,-1&#125;&#125;, &#123;&#123;0,1&#125;,&#123;0,0&#125;&#125;&#125;;
    inline const std::complex&lt;double&gt; Z[2][2] = &#123;&#123;&#123;1,0&#125;,&#123;0,0&#125;&#125;, &#123;&#123;0,0&#125;,&#123;-1,0&#125;&#125;&#125;;
&#125;

class QuantumCircuit &#123;
private:
    int n;
    size_t dim;
    std::vector&lt;std::complex&lt;double&gt;&gt; state;

public:
    QuantumCircuit(int num_qubits) : n(num_qubits) &#123;
        assert(n &gt;= 1);
        dim = 1ULL &lt;&lt; n;
        state.assign(dim, &#123;0.0, 0.0&#125;);
        state[0] = &#123;1.0, 0.0&#125;;
    &#125;

    void apply_gate(const std::complex&lt;double&gt; gate[2][2], int target) &#123;
        if (target &lt; 0 || target &gt;= n) throw std::out_of_range("target out of range");
        size_t bit = 1ULL &lt;&lt; target;
        for (size_t i = 0; i &lt; dim; ++i) &#123;
            if ((i &amp; bit) == 0) &#123;
                size_t j = i | bit;
                std::complex&lt;double&gt; v0 = state[i];
                std::complex&lt;double&gt; v1 = state[j];
                state[i] = gate[0][0] * v0 + gate[0][1] * v1;
                state[j] = gate[1][0] * v0 + gate[1][1] * v1;
            &#125;
        &#125;
    &#125;

    void reset() &#123;
        std::fill(state.begin(), state.end(), std::complex&lt;double&gt;&#123;0.0, 0.0&#125;);
        state[0] = &#123;1.0, 0.0&#125;;
    &#125;

    std::map&lt;std::string, double&gt; probabilities() &#123;
        std::map&lt;std::string, double&gt; probs_map;
        for (size_t i = 0; i &lt; dim; ++i) &#123;
            double p = std::norm(state[i]);
            if (p &gt; 1e-10) &#123;
                std::string s = "";
                for (int b = n - 1; b &gt;= 0; --b) s += ((i &gt;&gt; b) &amp; 1) ? '1' : '0';
                probs_map[s] = p;
            &#125;
        &#125;
        return probs_map;
    &#125;
&#125;;
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

export default QuantumCircuitDocs;
