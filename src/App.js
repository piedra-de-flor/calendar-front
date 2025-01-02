import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './member/Login';
import MainPage from './root/MainPage';
import SignUp from './member/SignUp';
import { AlertProvider } from './root/AlertProvider'; // AlertProvider 추가

function App() {
    return (
        <AlertProvider> {/* AlertProvider로 전체 감싸기 */}
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/main" element={<MainPage />} />
                    <Route path="/signup" element={<SignUp />} />
                </Routes>
            </Router>
        </AlertProvider>
    );
}

export default App;
