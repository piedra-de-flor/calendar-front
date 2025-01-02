import apiClient from './index';
import moment from "moment";

// 공통 일정 가져오기
export const fetchAvailableSlots = async ({
                                              teamId,
                                              startDate,
                                              endDate,
                                              availableFrom,
                                              availableTo,
                                              minDurationMinutes,
                                              minMembers,
                                              minGapMinutes,
                                          }) => {
    if (!teamId || !startDate || !endDate || !availableFrom || !availableTo || minDurationMinutes <= 0 || minMembers <= 0) {
        throw new Error('모든 필드를 올바르게 입력하세요.');
    }

    try {
        const response = await apiClient.get(`${teamId}/available-slots`, {
            params: {
                startDate,
                endDate,
                availableFrom,
                availableTo,
                minDurationMinutes,
                minMembers,
                minGapMinutes,
            },
        });

        // 응답 변환: LocalDateTime -> JavaScript Date 객체로 변환
        return response.data.map((slot) => ({
            start: moment(slot.start).toDate(),
            end: moment(slot.end).toDate(),
            availableMembers: slot.availableMembers, // 그대로 전달
        }));
    } catch (error) {
        console.error('Error fetching available slots:', error);
        throw new Error('공통 일정 검색에 실패했습니다. 다시 시도해주세요.');
    }
};
