import apiClient from "./index";

export const acceptRequest = (invitationId) => {
    return apiClient.post("/invitation/accept", null, {
        params: { invitationId },
    });
};

export const rejectRequest = (invitationId) => {
    return apiClient.post("/invitation/denied", null, {
        params: { invitationId },
    });
};

export const cancelRequest = (invitationId) => {
    return apiClient.delete("/invitation", {
        params: { invitationId },
    });
};
