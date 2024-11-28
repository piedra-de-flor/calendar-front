import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post(
                'http://localhost:8080/sign-in',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // JSON 응답에서 accessToken과 refreshToken 추출
            const { accessToken, refreshToken } = response.data;

            // 로그인 성공 메시지
            alert('Login successful!');

            // /main으로 리다이렉트하면서 accessToken을 RequestParam으로 전달
            navigate(`/main?accessToken=${encodeURIComponent(accessToken)}`);
        } catch (error) {
            console.error('Login error:', error);
            // 에러 메시지 설정
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Invalid email or password.');
            }
        }
    };

    const handleGoogleLogin = () => {
        // 브라우저 리다이렉션 방식으로 Google OAuth2 처리
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const handleResist = () => {
        console.log('Resist button clicked');
        navigate('/signup');
    };

    return (
        <div
            className="flex items-center justify-center h-screen bg-cover bg-center"
            style={{
                backgroundImage: `url(${process.env.PUBLIC_URL}/login_back.jpg)`,
            }}
        >
            <div className="bg-white p-8 rounded shadow-md w-[30rem]">
                {/* 서비스 아이콘 */}
                <div className="flex justify-center mb-8">
                    <img
                        src={`${process.env.PUBLIC_URL}/calendar_logo.jpg`}
                        alt="Service Logo"
                        className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 shadow"
                    />
                </div>

                <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

                {/* Email 입력 필드 */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="text"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                    />
                </div>

                {/* Password 입력 필드 */}
                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your password"
                    />
                </div>

                {errorMessage && (
                    <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
                )}

                {/* 로그인 버튼 */}
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 text-white py-2 rounded shadow hover:bg-blue-600 mb-4"
                >
                    로그인
                </button>

                {/* Google 로그인 버튼과 Resist 버튼 */}
                <div className="flex justify-between items-center mb-4">
                    <img
                        src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png"
                        alt="Sign in with Google"
                        className="cursor-pointer"
                        onClick={handleGoogleLogin} // 리다이렉션 처리
                    />
                    <button
                        onClick={handleResist}
                        className="bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 ml-4"
                    >
                        회원가입
                    </button>
                </div>
            </div>
        </div>
    );
}
