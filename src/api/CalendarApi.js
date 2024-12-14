import apiClient from "./index"; // Axios 인스턴스 가져오기

// 일정 데이터 가져오기
export const fetchCalendarEvents = ({ startDate, endDate }) => {
    return apiClient.get("/schedule/task/month", {
        params: {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
        },
    });
};

// 카테고리 데이터 가져오기
export const fetchCategories = () => {
    return apiClient.get("/schedule/category");
};

// 일정 삭제
export const deleteTask = (taskId) => {
    return apiClient.delete("/schedule/task", {
        params: { taskId },
    });
};

// 일정 수정
export const updateTask = (updatedTask) => {
    return apiClient.patch(
        "/schedule/task",
        {
            taskId: updatedTask.taskId,
            description: updatedTask.description,
            start: `${updatedTask.date}T${updatedTask.startTime}`,
            end: `${updatedTask.date}T${updatedTask.endTime}`,
            categoryId: updatedTask.categoryId,
        }
    );
};

// 일정 카테고리 업데이트
export const updateTaskCategory = (taskId, categoryId) => {
    return apiClient.patch("/schedule/task/category", {
        taskId,
        categoryId,
    });
};

export const createTask = (taskData) => {
    return apiClient.post("/schedule/task", taskData);
};
