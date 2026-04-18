import subprocess
import time
import threading
import sys

def run_node(role, cmd, payload_to_send):
    print(f"[{role.upper()}] Starting node...")
    
    # Run the C++ executable
    process = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,  # We can feed the custom message in via stdin!
        stdout=subprocess.PIPE, # Only the final transferred data will come here
        stderr=subprocess.PIPE, # All the BB84 telemetry/logs go here
        text=True
    )
    
    # Pass the data payload we want to transmit seamlessly through the quantum link
    process.stdin.write(payload_to_send)
    process.stdin.close()
    
    # Read Telemetry Logs (stderr) line by line in real-time
    def read_telemetry():
        for line in process.stderr:
            print(f"  {role}-log: {line.strip()}")
            
            # --- VIZUALIZATION HOOKS ---
            # You can parse JSON here or match string patterns:
            if "EAVESDROPPER DETECTED" in line:
                print(f"🚨 {role.upper()} GUI: FLASH RED SCREEN - SWITCHING TO ML-KEM!")
            elif "BB84 SUCCESS" in line:
                print(f"✅ {role.upper()} GUI: FLASH GREEN - QUANTUM SECURED LINK!")

    t = threading.Thread(target=read_telemetry)
    t.start()
    
    # Read the final payload received seamlessly from the other side!
    received_data = process.stdout.read()
    process.wait()
    t.join()
    
    print(f"\n[{role.upper()}] >>> Payload Received From Network <<<")
    print(received_data)
    print("="*50)

# --- Simulation ---
if __name__ == "__main__":
    ALICE_CMD = ["build/Release/alice.exe", "127.0.0.1", "9090"]
    BOB_CMD = ["build/Release/bob.exe", "127.0.0.1", "9090"]

    alice_payload = "SEAMLESS DATA: To jest tajny raport przeslany przez kwantowy tunel do Boba."
    bob_payload = "SEAMLESS DATA: Raport odebrany! Pozdrowienia od Boba."

    # Start Alice Server
    t_alice = threading.Thread(target=run_node, args=("Alice", ALICE_CMD, alice_payload))
    t_alice.start()

    time.sleep(1) # wait for bind

    # Start Bob Client
    run_node("Bob", BOB_CMD, bob_payload)
    
    t_alice.join()