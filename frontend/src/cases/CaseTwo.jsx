import { useState, useEffect } from 'react';
import './CaseTwo.css';

function CaseTwo() {
    const [packets, setPackets] = useState([]);
    const [logs, setLogs] = useState(["Oczekuję na logi z backendu..."]);
    const FLASK_API_URL = 'http://127.0.0.1:5000/logs';
    const fetchLogs = async () => {
        try {
            const response = await fetch(FLASK_API_URL);
            if (response.ok) {
                const data = await response.json();
                if (data.logs && data.logs.length > 0) {
                    setLogs(data.logs.slice(-6));
                }
            }
        } catch (error) {
            console.error("Błąd połączenia z backendem:", error);
        }
    };
    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 1000); 
        
        return () => clearInterval(interval);
    }, []);

    const sendPacketAtoB = () => {
        const packetId = Date.now() + Math.random();
        setPackets(prev => [...prev, { id: packetId, direction: 'AtoB' }]);
        setTimeout(() => {
            setPackets(prev => prev.filter(p => p.id !== packetId));
        }, 2000);
    };

    const sendPacketBtoA = () => {
        const packetId = Date.now() + Math.random();
        setPackets(prev => [...prev, { id: packetId, direction: 'BtoA' }]);
        setTimeout(() => {
            setPackets(prev => prev.filter(p => p.id !== packetId));
        }, 2000);
    };

    return (
        <div className="d-flex flex-column w-100 h-100 bg-dark" style={{ minHeight: '400px' }}>
            <h1 className='p-5 text-white w-100 d-flex justify-content-center align-items-center'>Case Two - EAVESDROPPINGr</h1>
            <div className="d-flex justify-content-between align-items-center flex-grow-1 px-5 w-100">

                <div
                    className="bg-primary text-white d-flex justify-content-center align-items-center rounded shadow flex-shrink-0"
                    style={{ width: '120px', height: '120px', zIndex: 2, cursor: 'pointer' }}
                >
                    Alice
                </div>

                <div className="flex-grow-1 position-relative h-100">
                    <svg
                        className="position-absolute w-100 h-100"
                        style={{ top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
                    >
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="3" strokeDasharray="10,5" style={{ transform: 'translateY(-20px)' }} />
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="3" strokeDasharray="10,5" style={{ transform: 'translateY(20px)' }} />
                    </svg>
                    {packets.map(packet => {
                        if (packet.direction === 'AtoB') {
                            return <div key={packet.id} className="network-packet packet-a-to-b" />;
                        } else {
                            return <div key={packet.id} className="network-packet packet-b-to-a" />;
                        }
                    })}
                </div>

                <div
                    className="bg-success text-white d-flex justify-content-center align-items-center rounded shadow flex-shrink-0"
                    style={{ width: '120px', height: '120px', zIndex: 2, cursor: 'pointer' }}
                >
                    Bob
                </div>
            </div>
            
            <div className="w-100 bg-black m-0 p-3 consoleP overflow-hidden d-flex flex-column justify-content-end" style={{ height: '10%' }}>
                {logs.map((log, index) => {
                    let colorClass = "text-secondary";
                    if (log.includes("[Bob]")) {
                        colorClass = "text-success";
                    }
                    else if (log.includes("[Alice]")) {
                        colorClass = "text-primary";
                    }
                    
                    return (
                        <div key={index} className={colorClass} style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                            {log}
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

export default CaseTwo;