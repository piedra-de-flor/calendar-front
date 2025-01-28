import apiClient from "./index";

export const createVote = async (voteData) => {
    try {
        const response = await apiClient.post('/vote', voteData);
        return response.data;
    } catch (error) {
        console.error('Failed to create vote:', error);
        throw error;
    }
};

export const vote = async (voteId, optionIds) => {
    try {
        // CastVoteOptionsDto 형식으로 요청 본문 생성
        const response = await apiClient.post(`/vote/cast/${voteId}`, {
            optionIds, // JSON 형태로 optionIds를 감싸서 전달
        });
        return response.data;
    } catch (error) {
        console.error('Failed to cast vote:', error);
        throw error;
    }
};

export const readVotes = async (teamId) => {
    try {
        const response = await apiClient.get(`/votes/${teamId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to read vote:', error);
        throw error;
    }
};


export const readVote = async (voteId) => {
    try {
        const response = await apiClient.get(`/vote/${voteId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to read vote:', error);
        throw error;
    }
};

export const completeVote = async (voteId) => {
    try {
        const response = await apiClient.patch(`/vote/status/${voteId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to create vote:', error);
        throw error;
    }
};

export const resultVote = async (voteId) => {
    try {
        const response = await apiClient.get(`/vote/result/${voteId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to create vote:', error);
        throw error;
    }
};

export const isCasted = async (voteId) => {
    try {
        const response = await apiClient.get(`/cast/whether/${voteId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to read whether cast:', error);
        throw error;
    }
};

export const whatICasted = async (voteId) => {
    try {
        const response = await apiClient.get(`/casted/options/${voteId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to read what I casted:', error);
        throw error;
    }
};

