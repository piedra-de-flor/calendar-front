import apiClient from './index';

/**
 * 오늘의 작업 가져오기
 * @returns {Promise<Array>} 오늘의 작업 목록
 */
export const fetchTodayTasks = async () => {
    const today = new Date();
    const kstTodayDate = new Date(today.getTime() + 9 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    const response = await apiClient.get('/schedule/task/day', {
        params: { date: kstTodayDate },
    });

    return response.data.taskDtos
        .map((task) => ({
            id: task.taskId,
            description: task.description,
            start: task.start,
            end: task.end,
            categoryColor: task.categoryColor,
        }))
        .sort((a, b) => a.start.localeCompare(b.start)); // 시작 시간을 기준으로 정렬
};
