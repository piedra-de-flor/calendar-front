import React, { createContext, useContext, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';

// 알림 Context 생성
const AlertContext = createContext();

// AlertProvider 정의
export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    const addAlert = useCallback((message) => {
        const id = Math.random().toString(36).substr(2, 9); // 고유 ID 생성
        setAlerts((prev) => [...prev, { id, message, isVisible: true }]);

        // 1초 후 서서히 사라지도록 설정
        setTimeout(() => {
            setAlerts((prev) =>
                prev.map((alert) =>
                    alert.id === id ? { ...alert, isVisible: false } : alert
                )
            );
        }, 1000);

        // 3초 후 완전히 제거
        setTimeout(() => {
            setAlerts((prev) => prev.filter((alert) => alert.id !== id));
        }, 3000);
    }, []);

    return (
        <AlertContext.Provider value={{ addAlert }}>
            {children}
            {/* Portal로 알림 렌더링 */}
            {ReactDOM.createPortal(
                <div className="fixed inset-0 z-50 flex justify-center items-center pointer-events-none">
                    <div className="relative">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`relative bg-gray-100 text-black px-6 py-4 rounded-lg shadow-lg border-2 border-black transition-opacity duration-300 ease-in-out mb-4 ${
                                    alert.isVisible ? 'opacity-100' : 'opacity-0'
                                }`}
                            >
                                <h3 className="font-bold text-lg">알림</h3>
                                <p>{alert.message}</p>
                            </div>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </AlertContext.Provider>
    );
};

// AlertContext를 사용하는 커스텀 Hook
export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
