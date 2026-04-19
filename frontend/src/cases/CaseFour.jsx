import { useState, useRef, useEffect } from 'react';
import './CaseFour.css';

function CaseFour() {
    const [packets, setPackets] = useState([]);
    const [logs, setLogs] = useState([{ role: 'System', msg: 'Oczekuję na rozpoczęcie symulacji...' }]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [eveActive, setEveActive] = useState(false);
    const logsEndRef = useRef(null);

    const API_URL = 'https://api.patynow.ski/api/simulate';

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const startSimulation = async () => {
        setIsSimulating(true);
        setLogs([{ role: 'System', msg: 'Inicjowanie transmisji kwantowej...' }]);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alice_payload: "Zrozumiałam, Bob.",
                    bob_payload: "Tajny klucz od Alice",
                    scenario: "pns"  
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                playLogsInSequence(data.logs);
            } else {
                setLogs(prev => [...prev, { role: 'System', msg: 'Błąd symulacji: Zły status z backendu.' }]);
                setIsSimulating(false);
            }
        } catch (error) {
            console.error("API call failed:", error);
            setLogs(prev => [...prev, { role: 'System', msg: 'Błąd połączenia z backendem!' }]);
            setIsSimulating(false);
        }
    };

    const playLogsInSequence = (logArray) => {
        let index = 0;

        const timer = setInterval(() => {
            if (index < logArray.length) {
                const currentLog = logArray[index];
                setLogs(prev => [...prev, currentLog]);

                if (currentLog.role === 'Eve') {
                    setEveActive(true);
                    setTimeout(() => setEveActive(false), 400);
                }

                const msgLower = currentLog.msg.toLowerCase();
                const isSendingEvent =
                    msgLower.includes('wysłano') ||
                    msgLower.includes('send') ||
                    msgLower.includes('sent') ||
                    msgLower.includes('wysyła') ||
                    msgLower.includes('przesłano');

                if (isSendingEvent) {
                    if (currentLog.role === 'Alice') {
                        shootPacket('AtoB');
                    } else if (currentLog.role === 'Bob') {
                        shootPacket('BtoA');
                    }
                }

                index++;
            } else {
                clearInterval(timer);
                setIsSimulating(false);
                setLogs(prev => [...prev, { role: 'System', msg: '--- KONIEC SYMULACJI ---' }]);
            }
        }, 800);
    };

    const shootPacket = (direction) => {
        const packetId = Date.now() + Math.random();
        setPackets(prev => [...prev, { id: packetId, direction: direction }]);

        setTimeout(() => {
            setPackets(prev => prev.filter(p => p.id !== packetId));
        }, 2000);
    };

    return (
        <div className="d-flex flex-column w-100 h-100 bg-dark" style={{ minHeight: '400px' }}>
            <h1 className='pt-5 text-white w-100 d-flex justify-content-center align-items-center'>Scenariusz czwarty - Photon Number Speeding</h1>
            <div className='d-flex justify-content-center  w-100'>
            <p className='lead p-3 text-white w-40 d-flex text-center justify-content-center align-items-center'>Jest to wyrafinowana technika ataku, w której intruz przechwytuje nadmiarowe fotony z impulsów wielofotonowych, nie zaburzając przy tym stanu polaryzacji cząstek docierających do odbiorcy. Dzięki temu atakujący może potajemnie odczytać część przesyłanych informacji kryptograficznych, unikając wykrycia przez standardowe mechanizmy alarmowe systemu.</p>
            </div>
            <div className="d-flex justify-content-between align-items-center flex-grow-1 px-5 w-100">

                <div
                    className="bg-primary text-white d-flex justify-content-center align-items-center rounded shadow flex-shrink-0"
                    style={{ width: '120px', height: '120px', zIndex: 4 }}
                >
                    Alice
                </div>

                <div className="flex-grow-1 position-relative h-100 d-flex justify-content-center align-items-center">

                    <div className="position-absolute w-100 h-20 d-flex flex-column justify-content-center align-items-center gap-3" style={{ zIndex: 5 }}>
                        <button
                            className="btn btn-warning shadow-lg px-4 py-2"
                            onClick={startSimulation}
                            disabled={isSimulating}
                        >
                            {isSimulating ? "Trwa symulacja..." : "Rozpocznij Symulację"}
                        </button>
                    </div>

                    <div 
                        className="bg-danger text-white d-flex flex-column justify-content-center align-items-center rounded-circle shadow-lg position-absolute"
                        style={{ 
                            width: '100px', 
                            height: '100px', 
                            zIndex: 3,
                            transition: 'all 0.2s ease-in-out',
                            transform: eveActive ? 'scale(1.2)' : 'scale(1)',
                            boxShadow: eveActive ? '0 0 20px 5px rgba(220, 53, 69, 0.8)' : ''
                        }}
                    >
                        <span className="fw-bold fs-5">Eve</span>
                    </div>

                    <svg
                        className="position-absolute w-100 h-100"
                        style={{ top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
                    >
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="3" strokeDasharray="10,5" style={{ transform: 'translateY(-20px)' }} />
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="3" strokeDasharray="10,5" style={{ transform: 'translateY(20px)' }} />
                    </svg>

                    {packets.map(packet => {
                        if (packet.direction === 'AtoB') {
                            return <div key={packet.id} className="network-packet packet-a-to-b" style={{ zIndex: 2 }} />;
                        } else {
                            return <div key={packet.id} className="network-packet packet-b-to-a" style={{ zIndex: 2 }} />;
                        }
                    })}
                </div>

                <div
                    className="bg-success text-white d-flex justify-content-center align-items-center rounded shadow flex-shrink-0"
                    style={{ width: '120px', height: '120px', zIndex: 4 }}
                >
                    Bob
                </div>
            </div>

            <div className="w-100 bg-black m-0 p-3 consoleP overflow-auto d-flex flex-column" style={{ height: '25%' }}>
                {logs.map((logObj, index) => {
                    let colorClass = "text-secondary";

                    if (logObj.role === 'Alice') {
                        colorClass = "text-primary";
                    } else if (logObj.role === 'Bob') {
                        colorClass = "text-success";
                    } else if (logObj.role === 'Eve') {
                        colorClass = "text-danger";
                    }

                    const isStdout = logObj.type === 'stdout';

                    return (
                        <div key={index} className={`${colorClass} ${isStdout ? 'fw-bold fs-6' : ''}`} style={{ fontSize: '0.9rem', fontFamily: 'monospace', marginBottom: '4px' }}>
                            {logObj.msg}
                        </div>
                    );
                })}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
}

export default CaseFour;