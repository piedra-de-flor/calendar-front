// src/api/friendApi.js
import apiClient from "./index";

// 친구 목록 가져오기
export const fetchFriends = () => {
    return apiClient.get("/my-friends");
};

// 보낸 친구 요청 가져오기
export const fetchSentRequests = () => {
    return apiClient.get("/invitations/send/friend");
};

// 받은 친구 요청 가져오기
export const fetchReceivedRequests = () => {
    return apiClient.get("/invitations/receive/friend");
};

// 친구 추가 요청 보내기
export const sendFriendRequest = (receiverEmail) => {
    return apiClient.post("/invitation/friend", { receiverEmail });
};

// 친구 삭제
export const deleteFriend = (friendId) => {
    return apiClient.delete("/friend", {
        params: { friendId },
    });
};

// 친구 요청 수락
export const acceptFriendRequest = (invitationId) => {
    return apiClient.post("/invitation/accept", null, {
        params: { invitationId },
    });
};

// 친구 요청 거절
export const rejectFriendRequest = (invitationId) => {
    return apiClient.post("/invitation/denied", null, {
        params: { invitationId },
    });
};
