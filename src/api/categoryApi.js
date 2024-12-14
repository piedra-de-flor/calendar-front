import apiClient from "./index"; // 공통 API 클라이언트

/**
 * 카테고리 생성
 * @param {object} categoryData - 카테고리 데이터
 * @returns {Promise} 생성된 카테고리 ID
 */
export const createCategory = (categoryData) => {
    return apiClient
        .post("/schedule/category", categoryData)
        .then((response) => response.data);
};

/**
 * 카테고리 수정
 * @param {object} categoryData - 수정할 카테고리 데이터
 * @returns {Promise} 수정된 카테고리 ID
 */
export const updateCategory = (categoryData) => {
    return apiClient
        .patch("/schedule/category", categoryData)
        .then((response) => response.data);
};

/**
 * 카테고리 삭제
 * @param {number} categoryId - 삭제할 카테고리 ID
 * @returns {Promise} 삭제 결과
 */
export const deleteCategory = (categoryId) => {
    return apiClient.delete("/schedule/category", {
        params: { categoryId },
    });
};
