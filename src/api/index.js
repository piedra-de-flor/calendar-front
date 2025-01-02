// src/api/index.js
import axios from "axios";

// Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: "http://43.200.155.29:8080",
    //baseURL: "http://localhost:8080",
    timeout: 10000, // 요청 제한 시간 설정
    headers: {
        "Content-Type": "application/json", // 모든 요청에 공통 Content-Type
    },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
    (config) => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        if (!accessToken) throw new Error('Access token is missing.');

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;