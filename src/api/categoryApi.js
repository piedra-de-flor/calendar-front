import apiClient from "./index"; // 공통 API 클라이언트

export const createCategory = (categoryData) => {
    return apiClient
        .post("/schedule/category", categoryData)
        .then((response) => response.data);
};

export const updateCategory = (categoryData) => {
    return apiClient
        .patch("/schedule/category", categoryData)
        .then((response) => response.data);
};

export const deleteCategory = (categoryId) => {
    return apiClient.delete("/schedule/category", {
        params: { categoryId },
    });
};
