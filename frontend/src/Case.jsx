function Case() {
    return (
        <div className="w-100 h-100 bg-dark" style={{ minHeight: '400px' }}>
            <div className="d-flex justify-content-between align-items-center h-100 px-5">
                <div
                    className="bg-primary text-white d-flex justify-content-center align-items-center rounded shadow flex-shrink-0"
                    style={{ width: '120px', height: '120px', zIndex: 2 }}
                >
                    Komputer A
                </div>

                <div className="flex-grow-1 position-relative h-100">
                    <svg
                        className="position-absolute w-100 h-100"
                        style={{ top: 0, left: 0, pointerEvents: 'none' }}
                    >
                        <line
                            x1="0" y1="50%"
                            x2="100%" y2="50%"
                            stroke="white"
                            strokeWidth="3"
                            strokeDasharray="10,5"
                            style={{ transform: 'translateY(-20px)' }}
                        />
                        <line
                            x1="0" y1="50%"
                            x2="100%" y2="50%"
                            stroke="white"
                            strokeWidth="3"
                            strokeDasharray="10,5"
                            style={{ transform: 'translateY(20px)' }}
                        />
                    </svg>
                </div>

                <div
                    className="bg-success text-white d-flex justify-content-center align-items-center rounded shadow flex-shrink-0"
                    style={{ width: '120px', height: '120px', zIndex: 2 }}
                >
                    Komputer B
                </div>

            </div>
        </div>
    );
}

export default Case;