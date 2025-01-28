import axios from "axios";

// Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: "https://woodking2-server.site:443",
    //baseURL: "http://localhost:8080",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },

    withCredentials: true, // 쿠키를 포함하도록 설정
});

// 요청 인터셉터
apiClient.interceptors.request.use(
    (config) => {
        // 쿠키에서 accessToken 가져오기
        const cookies = document.cookie.split("; ");
        const accessTokenCookie = cookies.find((cookie) =>
            cookie.startsWith("accessToken=")
        );

        if (accessTokenCookie) {
            const accessToken = accessTokenCookie.split("=")[1];
            config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
            console.warn("Access token is missing in cookies.");
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
