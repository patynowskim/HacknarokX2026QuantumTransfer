import { useState } from 'react';
import './Case.css';

function Case() {
    const [packets, setPackets] = useState([]);
    const [logs, setLogs] = useState(["Oczekuję na przesyłanie pakietów..."]);

    const sendPacketAtoB = () => {
        const packetId = Date.now() + Math.random();
        setPackets(prev => [...prev, { id: packetId, direction: 'AtoB' }]);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [A -> B] Wysłano pakiet...`].slice(-4));
        setTimeout(() => {
            setPackets(prev => prev.filter(p => p.id !== packetId));
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [A -> B] Pakiet dotarł do Komputera B.`].slice(-4));
        }, 2000);
    };

    const sendPacketBtoA = () => {
        const packetId = Date.now() + Math.random();
        setPackets(prev => [...prev, { id: packetId, direction: 'BtoA' }]);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [B -> A] Wysłano pakiet...`].slice(-4));
        setTimeout(() => {
            setPackets(prev => prev.filter(p => p.id !== packetId));
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [B -> A] Pakiet dotarł do Komputera A.`].slice(-4));
        }, 2000);
    };

    return (
        <div className="d-flex flex-column w-100 h-100 bg-dark" style={{ minHeight: '400px' }}>
            <div className="d-flex justify-content-between align-items-center flex-grow-1 px-5 w-100">
                
                <div
                    onClick={sendPacketAtoB}
                    className="bg-primary text-white d-flex justify-content-center align-items-center rounded shadow flex-shrink-0"
                    style={{ width: '120px', height: '120px', zIndex: 2, cursor: 'pointer' }}
                >
                    Komputer A
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
                    onClick={sendPacketBtoA}
                    className="bg-success text-white d-flex justify-content-center align-items-center rounded shadow flex-shrink-0"
                    style={{ width: '120px', height: '120px', zIndex: 2, cursor: 'pointer' }}
                >
                    Komputer B
                </div>
            </div>
            <div className="w-100 bg-black text-secondary m-0 p-3 consoleP overflow-hidden d-flex flex-column justify-content-end" style={{ height: '10%' }}>
                {logs.map((log, index) => (
                    <div key={index} className="text-white" style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                        {log}
                    </div>
                ))}
            </div>
            
        </div>
    );
}

export default Case;