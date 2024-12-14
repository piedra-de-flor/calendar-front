import apiClient from './index';

// 팀 목록 가져오기
export const fetchTeams = async () => {
    const response = await apiClient.get('/my-teams');
    return response.data;
};

// 팀 생성
export const createTeam = async (teamName) => {
    const response = await apiClient.post('/teams', { teamName });
    return response.data; // 생성된 팀 데이터 반환
};

// 보낸 팀 초대 목록 가져오기
export const fetchSentRequests = async () => {
    const response = await apiClient.get('/invitations/send/team');
    return response.data;
};

// 받은 팀 초대 목록 가져오기
export const fetchReceivedRequests = async () => {
    const response = await apiClient.get('/invitations/receive/team');
    return response.data;
};

// 팀 초대 전송
export const sendTeamRequest = async (teamId, receiverId) => {
    const response = await apiClient.post('/invitations/send/team', { teamId, receiverId });
    return response.data;
};

// 팀 탈퇴 API
export const leaveTeam = async (teamId) => {
    try {
        const response = await apiClient.delete('/team', {
            params: { teamId }, // URL 파라미터로 팀 ID 전달
        });

        if (response.data) {
            return true; // 성공 시 true 반환
        } else {
            throw new Error('Failed to leave the team'); // 실패 시 에러 처리
        }
    } catch (error) {
        console.error('Error leaving the team:', error);
        throw error; // 호출한 곳에서 처리할 수 있도록 에러 전달
    }
};

// 팀 멤버 가져오기
export const fetchTeamMembers = async (teamId) => {
    try {
        console.log('API Call: /team/friends, teamId:', teamId); // teamId 확인
        const response = await apiClient.get('/team/friends', {
            params: { teamId }, // URL 파라미터로 전달
        });
        return response.data || []; // 멤버 목록 반환
    } catch (error) {
        console.error('Error fetching team members:', error);
        throw error; // 에러 재전달
    }
};
