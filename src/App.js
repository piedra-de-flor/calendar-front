import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './member/Login';
import MainPage from './root/MainPage';
import SignUp from './member/SignUp';
import { AlertProvider } from './root/AlertProvider'; // AlertProvider 추가

function App() {
    return (
        <AlertProvider>
            <Router>
                <BackButtonHandler /> {/* 뒤로 가기 처리 컴포넌트 */}
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/main" element={<MainPage />} />
                    <Route path="/signup" element={<SignUp />} />
                </Routes>
            </Router>
        </AlertProvider>
    );
}

// 뒤로 가기 버튼을 처리하는 컴포넌트
function BackButtonHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        const handlePopState = () => {
            // 뒤로 가기 버튼이 눌리면 /main으로 이동
            navigate('/main', { replace: true });
        };

        // popstate 이벤트 리스너 추가
        window.addEventListener('popstate', handlePopState);

        return () => {
            // 컴포넌트 언마운트 시 이벤트 리스너 제거
            window.removeEventListener('popstate', handlePopState);
        };
    }, [navigate]);

    return null;
}

export default App;
