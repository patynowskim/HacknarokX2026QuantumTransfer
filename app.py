from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import threading
import time
import socket

def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    return port

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

def run_node(role, cmd, payload_to_send, output_list):
    print(f"[{role.upper()}] Starting node...")
    
    process = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    if payload_to_send:
        process.stdin.write(payload_to_send)
        process.stdin.close()
        
    def read_telemetry():
        for line in process.stderr:
            line_str = line.strip()
            print(f"  {role}-log: {line_str}")
            output_list.append({"role": role, "type": "stderr", "msg": line_str})

    t = threading.Thread(target=read_telemetry)
    t.start()
    
    try:
        process.wait(timeout=5.5)
    except subprocess.TimeoutExpired:
        print(f"[{role.upper()}] Timeout reached! Killing process to prevent lockup...")
        process.terminate()
        time.sleep(0.5)
        process.kill()
        
    received_data = process.stdout.read()
    t.join(timeout=1.0)
    
    if received_data:
        output_list.append({"role": role, "type": "stdout", "msg": received_data.strip()})
        print(f"\n[{role.upper()}] >>> Payload Received <<<: {received_data.strip()}")

@app.route('/')
def index():
    return "<img src='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia0.giphy.com%2Fmedia%2Fv1.Y2lkPTc5MGI3NjExMGM2MDUzNG5oZjRxcW90c2h6bHo3b3czb3g2dGt3eXMyNDdjMXE5aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n%2FIUW7UtVQsBI1kVzurj%2F200w.gif' alt='Quantum GIF'>"

@app.route('/api/simulate', methods=['POST'])
def simulate():
    data = request.json
    alice_payload = data.get('alice_payload', 'Hello from Alice')
    bob_payload = data.get('bob_payload', 'Hello from Bob')
    use_eve = data.get('use_eve', False)
    eve_attack_type = data.get('eve_attack_type', '')
    
    output_list = []
    threads = []
    
    # Ports
    alice_port = str(get_free_port())
    bob_port = alice_port
    if use_eve:
        bob_port = str(get_free_port()) # Bob connects to Eve
        
    # Start Alice
    alice_cmd = ["./build/alice", "127.0.0.1", alice_port]
    t_alice = threading.Thread(target=run_node, args=("Alice", alice_cmd, alice_payload, output_list))
    t_alice.start()
    threads.append(t_alice)
    
    time.sleep(1) # wait for bind
    
    # Start Eve if requested
    eve_process = None
    if use_eve:
        eve_cmd = ["./build/eve", "127.0.0.1", alice_port, bob_port]
        if eve_attack_type == "pns":
            eve_cmd.append("--pns")
        elif eve_attack_type == "ddos":
            eve_cmd.append("--ddos")
            
        # Eve runs continuously, we don't wait for her to finish but we should read her logs
        print(f"[EVE] Starting... (Attack Type: {eve_attack_type if eve_attack_type else 'standard intercepts'})")
        eve_process = subprocess.Popen(
            eve_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        def read_eve_logs():
            for line in eve_process.stderr:
                line_str = line.strip()
                print(f"  Eve-log: {line_str}")
                output_list.append({"role": "Eve", "type": "stderr", "msg": line_str})
        t_eve = threading.Thread(target=read_eve_logs, daemon=True)
        t_eve.start()
        time.sleep(1) # wait for bind
        
    # Start Bob
    bob_cmd = ["./build/bob", "127.0.0.1", bob_port]
    t_bob = threading.Thread(target=run_node, args=("Bob", bob_cmd, bob_payload, output_list))
    t_bob.start()
    threads.append(t_bob)
    
    # Wait for completion
    t_alice.join()
    t_bob.join()
    
    # Kill Eve if she was running
    if eve_process:
        eve_process.terminate()
        
    return jsonify({"status": "success", "logs": output_list})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)