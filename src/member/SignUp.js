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
    const navigate = useNavigate(); // useNavigate 훅 초기화

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleEmailCheck = async () => {
        if (formData.email === '') {
            alert('Please enter an email to check.');
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
                const errorText = await response.text();
                console.error(`HTTP Error: ${response.status} - ${errorText}`);
                throw new Error('Failed to check email.');
            }

            // 서버 응답을 JSON으로 처리
            const isDuplicated = await response.json(); // true = 중복, false = 사용 가능
            console.log('Email check response:', isDuplicated);
            setIsEmailChecked(true);
            setIsEmailValid(!isDuplicated); // 중복 여부를 반대로 설정
        } catch (error) {
            console.error('Error during email check:', error);
            alert('Error checking email. Please try again.');
        }
    };



    const handleSubmit = async () => {
        if (!isEmailChecked || !isEmailValid) {
            alert('Please check the email for duplicates first.');
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
                alert('SignUp successful! Redirecting to login page...');
                navigate('/'); // 로그인 페이지로 이동
            } else {
                const errorMessage = await response.text();
                console.error(`SignUp failed: ${errorMessage}`);
                alert(`SignUp failed: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error during sign up:', error);
            alert('Error during sign up. Please try again.');
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
                    {isEmailChecked && (
                        <p
                            className={`mt-2 ${
                                isEmailValid ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                            {isEmailValid
                                ? 'Email is available!'
                                : 'This email is already in use.'}
                        </p>
                    )}
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
