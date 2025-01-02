import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });

    const [isEmailChecked, setIsEmailChecked] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false); // 이메일 사용 가능 여부
    const [statusMessage, setStatusMessage] = useState(null); // 상태 메시지 관리
    const navigate = useNavigate(); // useNavigate 훅 초기화

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        setStatusMessage(null); // 입력 중에는 상태 메시지 초기화
    };

    const handleEmailCheck = async () => {
        if (formData.email === '') {
            setStatusMessage({ type: 'error', text: '이메일을 입력한 후 확인해주세요.' });
            return;
        }

        try {
            const response = await fetch(`http://43.200.155.29:8080/sign-up/valid?email=${encodeURIComponent(formData.email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to check email.');
            }

            const isDuplicated = await response.json(); // 서버 응답 처리
            setIsEmailChecked(true);
            setIsEmailValid(!isDuplicated); // 중복 여부 설정
            setStatusMessage({
                type: isDuplicated ? 'error' : 'success',
                text: isDuplicated ? '이 이메일은 이미 사용 중입니다.' : '사용 가능한 이메일입니다!',
            });
        } catch (error) {
            setStatusMessage({ type: 'error', text: '이메일 확인 중 문제가 발생했습니다.' });
            console.error('Error during email check:', error);
        }
    };

    const handleSubmit = async () => {
        if (!isEmailChecked || !isEmailValid) {
            setStatusMessage({ type: 'error', text: '이메일 중복 검사를 완료해주세요.' });
            return;
        }

        try {
            const response = await fetch('http://43.200.155.29:8080/sign-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatusMessage({ type: 'success', text: '회원가입이 성공적으로 완료되었습니다!' });
                setTimeout(() => navigate('/'), 2000); // 2초 후 로그인 페이지로 이동
            } else {
                const errorMessage = await response.text();
                setStatusMessage({ type: 'error', text: `회원가입 실패: ${errorMessage}` });
            }
        } catch (error) {
            console.error('Error during sign up:', error);
            setStatusMessage({ type: 'error', text: '회원가입 중 문제가 발생했습니다.' });
        }
    };

    return (
        <div
            className="flex items-center justify-center h-screen bg-cover bg-center"
            style={{
                backgroundImage: `url(${process.env.PUBLIC_URL}/login_back.jpg)`,
            }}
        >
            <div className="bg-white p-8 rounded shadow-md w-[30rem]">
                {/* 서비스 로고 */}
                <div className="flex justify-center mb-8">
                    <img
                        src={`${process.env.PUBLIC_URL}/calendar_logo.jpg`}
                        alt="Service Logo"
                        className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 shadow"
                    />
                </div>

                <h2 className="text-xl font-bold mb-4 text-center">Sign Up</h2>

                {/* 상태 메시지 */}
                {statusMessage && (
                    <div
                        className={`p-4 mb-4 rounded ${
                            statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {statusMessage.text}
                    </div>
                )}

                {/* Name 입력 필드 */}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        이름
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your name"
                    />
                </div>

                {/* Email 입력 필드 */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <div className="flex items-center">
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 flex-grow px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your email"
                        />
                        <button
                            onClick={handleEmailCheck}
                            className="ml-2 bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 whitespace-nowrap"
                        >
                            중복 검사
                        </button>
                    </div>
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

                {/* Submit 버튼 */}
                <button
                    onClick={handleSubmit}
                    disabled={!isEmailChecked || !isEmailValid}
                    className={`w-full py-2 rounded shadow ${
                        !isEmailChecked || !isEmailValid
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                    회원가입
                </button>
            </div>
        </div>
    );
}
