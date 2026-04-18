# Quantum Transfer Simulation API & Deployment Docs

## 1. Frontend Implementation Guide

Your Flask backend is configured to accept POST requests at `/api/simulate`. It perfectly matches the React frontend you have inside the `frontend/` folder.

### Expected Request and Response Structure

**HTTP Method:** `POST`  
**Endpoint:** `http://<YOUR-SERVER-DOMAIN-OR-IP>:80/api/simulate` *(If served over NGINX port 80)*

**JSON Request Body:**
```json
{
  "alice_payload": "Hello from Alice!",
  "bob_payload": "Hi, Bob here.",
  "scenario": "pns"
}
```
*Note: `scenario` can be `"normal"` (standard exchange), `"mlkem"` (quantum-safe exchange using ML-KEM), `"eavesdropping"` (standard intercept), `"pns"` (Photon Number Splitting attack), or `"ddos"` (Denial of Service attack).*

**JSON Response format:**
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

### Frontend Integration (React/Vite Example)
Inside your `frontend/src/Simulation.jsx` (or similar file), you can call the API like this:

```javascript
const simulateQuantumExchange = async (aliceMsg, bobMsg, enableEve, scenario = "normal") => {
  try {
    const response = await fetch('/api/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        alice_payload: aliceMsg,
        bob_payload: bobMsg,
        scenario: scenario // "normal", "mlkem", "eavesdropping", "pns", "ddos"
      })
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      // 'logs' is an array of objects: { role, type, msg }
      // Split them by role to render them separately in Alice's, Bob's, and Eve's panels
      const aliceLogs = data.logs.filter(log => log.role === 'Alice');
      const bobLogs = data.logs.filter(log => log.role === 'Bob');
      const eveLogs = data.logs.filter(log => log.role === 'Eve');

      // Highlight received payload (stdout) vs telemetry (stderr)
      console.log('Alice logs:', aliceLogs);
    }
  } catch (error) {
    console.error("API call failed:", error);
  }
}
```

---

## 2. Server Deployment Guide (Production setup)

Since the development Flask server is not meant for production, you should wrap it with `gunicorn` and configure `NGINX` as a reverse proxy.

### Step 1: Install Gunicorn
First, enter your virtual environment and install gunicorn:
```bash
source venv/bin/activate
pip install gunicorn
```

### Step 2: Create a Systemd Service
To ensure the backend runs continuously and restarts on failure, create a background service.
Run: `sudo nano /etc/systemd/system/quantum-api.service`

Add the following configuration:
```ini
[Unit]
Description=Gunicorn daemon for Quantum Transfer API
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/HacknarokX2026QuantumTransfer
Environment="PATH=/home/ubuntu/HacknarokX2026QuantumTransfer/venv/bin"
# Run with 4 threads. Adjust bind address if needed.
ExecStart=/home/ubuntu/HacknarokX2026QuantumTransfer/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
```

Enable and start it:
```bash
sudo systemctl daemon-reload
sudo systemctl start quantum-api
sudo systemctl enable quantum-api
```

### Step 3: Build the Frontend
Navigate to your `frontend/` directory and compile the React app:
```bash
cd /home/ubuntu/HacknarokX2026QuantumTransfer/frontend
npm install
npm run build
```
*(This produces the static files in `frontend/dist`).*

### Step 4: Configure Nginx
Create an Nginx configuration file.
Run: `sudo nano /etc/nginx/sites-available/quantum`

```nginx
server {
    listen 80;
    server_name _; 

    # Serve the React Frontend Build
    location / {
        root /home/ubuntu/HacknarokX2026QuantumTransfer/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy the API requests to Flask/Gunicorn
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # Increase timeouts since the C++ execution might take a couple of seconds
        proxy_read_timeout 60;
        proxy_connect_timeout 60;
    }
}
```

Enable the configuration:
```bash
sudo rm /etc/nginx/sites-enabled/default  # remove default if it conflicts
sudo ln -s /etc/nginx/sites-available/quantum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Now, visiting your Server's IP address on port 80 will serve the Vite React frontend, and the frontend will correctly proxy its requests to the Python Flask backend at `/api/simulate`!