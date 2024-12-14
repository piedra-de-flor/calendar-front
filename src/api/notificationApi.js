import apiClient from "./index"; // apiClient import

/**
 * 알림 목록 가져오기
 * @param {number} page - 현재 페이지 번호
 * @param {number} size - 페이지 크기
 * @returns {Promise} 알림 데이터 목록
 */
export const getNotifications = async (page, size) => {
    const response = await apiClient.get("/notifications", {
        params: { page, size },
    });
    return response.data;
};

/**
 * 알림 읽음 처리
 * @param {string} notificationId - 읽음 처리할 알림 ID
 * @returns {Promise} 읽음 처리 결과
 */
export const markNotificationAsRead = async (notificationId) => {
    await apiClient.patch(`/notification/${notificationId}`);
};

/**
 * SSE 연결 설정
 * @param {function} onMessage - 새 알림을 처리하는 콜백 함수
 * @returns {EventSource} SSE 객체
 */
export const subscribeToNotifications = (onMessage) => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");

    if (!accessToken) {
        throw new Error("Access token is missing.");
    }

    const source = new EventSource(
        `${apiClient.defaults.baseURL}/notification/subscribe?token=${accessToken}`
    );

    source.onmessage = (event) => {
        const newNotification = JSON.parse(event.data);
        onMessage(newNotification);
    };

    source.onerror = (error) => {
        console.error("SSE connection error:", error);
        source.close();
    };

    return source;
};
