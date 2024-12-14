import apiClient from "./index";

/**
 * 사용자 정보 가져오기
 * @returns {Promise<object>} 사용자 정보 (name, email 포함)
 */
export const fetchUserInfo = async () => {
    const response = await apiClient.get("/member");
    return response.data;
};
