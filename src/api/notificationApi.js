import apiClient from "./index";
import config from "tailwindcss/defaultConfig"; // apiClient import

export const getNotifications = async (page, size) => {
    const response = await apiClient.get("/notifications", {
        params: { page, size },
    });
    return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
    await apiClient.patch(`/notification/${notificationId}`);
};

export const subscribeToNotifications = (onMessage) => {
    // 쿠키에서 accessToken 읽기
    const cookies = document.cookie.split("; ");
    const accessTokenCookie = cookies.find((cookie) =>
        cookie.startsWith("accessToken=")
    );

    if (!accessTokenCookie) {
        console.warn("Access token is missing in cookies.");
        return;
    }

    const accessToken = accessTokenCookie.split("=")[1];

    // SSE 요청을 Authorization 헤더를 통해 전달
    const source = new EventSource(`${apiClient.defaults.baseURL}/notification/subscribe/${accessToken}`);

    // SSE 메시지 처리
    source.onmessage = (event) => {
        const newNotification = JSON.parse(event.data);
        onMessage(newNotification);
    };

    // SSE 오류 처리
    source.onerror = (error) => {
        console.error("SSE connection error:", error);
        source.close();
    };

    return source;
};

