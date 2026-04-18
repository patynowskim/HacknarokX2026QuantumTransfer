# Quantum Transfer Simulation

Witaj w projekcie symulacji transferu kwantowego. Poniżej znajdziesz kompletny przewodnik, jak skompilować narzędzia, uruchomić interfejs webowy lub korzystać z symulacji bezpośrednio przez terminal.

---

## 1. Kompilacja projektu

Zanim zaczniesz, upewnij się, że projekt został poprawnie zbudowany. Wykonaj poniższe polecenia w głównym katalogu projektu:

```bash
# Konfiguracja środowiska budowania
cmake -B build

# Kompilacja projektu (wersja Release)
cmake --build build --config Release
```

Dla systemów **ARM**, użyj dostarczonego skryptu:
```bash
./arm_build.sh
```

---

## 2. CLI: Uruchomienie Symulacji

Możesz przeprowadzać symulacje ręcznie, uruchamiając poszczególne komponenty w osobnych terminalach.

### Scenariusze ataków

| Scenariusz | Opis |
| :--- | :--- |
| `normal` | Standardowa wymiana danych. |
| `mlkem` | Bezpieczna wymiana z użyciem ML-KEM. |
| `eavesdropping` | Standardowy podsłuch. |
| `pns` | Atak typu *Photon Number Splitting*. |
| `ddos` | Atak typu *Denial of Service*. |

#### Przykład: Standardowa wymiana
```bash
# Terminal 1: Alice
./alice.exe 0.0.0.0 8080 "A: SZYNKA WOLOWA"

# Terminal 2: Bob
./bob.exe 127.0.0.1 8080 "B: TEST TEST"
```

#### Przykład: Eavesdropping (Podsłuch)
```bash
./alice.exe 0.0.0.0 8080 "A: SZYNKA WOLOWA"
./eve.exe 127.0.0.1 8080 8081
./bob.exe 127.0.0.1 8081 "B: TEST TEST"
```

#### Przykład: Atak PNS
```bash
./alice.exe 0.0.0.0 8080 "A: SZYNKA WOLOWA"
./eve.exe 127.0.0.1 8080 8081 --pns
./bob.exe 127.0.0.1 8081 "B: TEST TEST"
```

#### Przykład: Atak DDoS
```bash
./alice.exe 0.0.0.0 8080 "A: DUPA WOLOWA"
./eve.exe 127.0.0.1 8080 8081 --ddos
./bob.exe 127.0.0.1 8081 "B: TEST TEST"
```

---

## 3. Web API: Interfejs WWW

Dla wygody możesz skorzystać z interfejsu przeglądarkowego. Backend Flask nasłuchuje na `/api/simulate`.

### Endpoint: `POST /api/simulate`

**Request Body:**
```json
{
  "alice_payload": "Hello from Alice!",
  "bob_payload": "Hi, Bob here.",
  "scenario": "pns"
}
```

**Response Format:**
```json
{
  "status": "success",
  "logs": [
    { "role": "Alice", "type": "stderr", "msg": "[Alice] Starting node..." },
    { "role": "Eve", "type": "stderr", "msg": "[Eve] Intercepting Qubits!" },
    { "role": "Bob", "type": "stderr", "msg": "[Bob] Warning: High Noise!" },
    { "role": "Alice", "type": "stdout", "msg": "Hi, Bob here." }
  ]
}
```

### Implementacja Frontendowa (React/Vite)
Przykład zapytania w aplikacji:

```javascript
const simulate = async (aliceMsg, bobMsg, scenario) => {
  const response = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alice_payload: aliceMsg, bob_payload: bobMsg, scenario })
  });

  const data = await response.json();
  if (data.status === 'success') {
    // Logika renderowania logów...
    console.log(data.logs);
  }
};
```

---

## 4. Wdrożenie Produkcyjne (Linux)

Aby uruchomić aplikację w środowisku produkcyjnym, użyj **Gunicorn** oraz **Nginx**.

### Krok 1: Gunicorn (Backend)
Skonfiguruj usługę systemd (`/etc/systemd/system/quantum-api.service`):

```ini
[Unit]
Description=Gunicorn daemon for Quantum Transfer API
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/HacknarokX2026QuantumTransfer
ExecStart=/home/ubuntu/HacknarokX2026QuantumTransfer/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
```

Aktywuj usługę:
```bash
sudo systemctl daemon-reload
sudo systemctl start quantum-api
sudo systemctl enable quantum-api
```

### Krok 2: Nginx (Proxy i Frontend)
Skompiluj frontend (`npm run build`) i skonfiguruj Nginx (`/etc/nginx/sites-available/quantum`):

```nginx
server {
    listen 80;
    server_name _; 

    location / {
        root /home/ubuntu/HacknarokX2026QuantumTransfer/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_read_timeout 60;
    }
}
```

Na koniec zrestartuj Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/quantum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```