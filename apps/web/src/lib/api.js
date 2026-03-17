async function request(input, init) {
    const response = await fetch(input, {
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {})
        },
        ...init
    });
    if (!response.ok) {
        const body = (await response.json().catch(() => null));
        throw new Error(body?.error ?? "Request failed.");
    }
    if (response.status === 204) {
        return undefined;
    }
    return (await response.json());
}
export const api = {
    login(payload) {
        return request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },
    listWorkspaces(userId) {
        return request(`/api/workspaces?userId=${encodeURIComponent(userId)}`);
    },
    createWorkspace(payload) {
        return request("/api/workspaces", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },
    getWorkspace(workspaceId) {
        return request(`/api/workspaces/${workspaceId}`);
    },
    addWorkspaceMember(workspaceId, payload) {
        return request(`/api/workspaces/${workspaceId}/members`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },
    removeWorkspaceMember(workspaceId, memberId) {
        return request(`/api/workspaces/${workspaceId}/members/${memberId}`, {
            method: "DELETE"
        });
    },
    async uploadWorkspaceFile(workspaceId, file) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`/api/workspaces/${workspaceId}/files`, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            const body = (await response.json().catch(() => null));
            throw new Error(body?.error ?? "File upload failed.");
        }
        return (await response.json());
    },
    removeWorkspaceFile(workspaceId, fileId) {
        return request(`/api/workspaces/${workspaceId}/files/${fileId}`, {
            method: "DELETE"
        });
    },
    createMeeting(workspaceId, payload) {
        return request(`/api/workspaces/${workspaceId}/meetings`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },
    getRoom(meetingId) {
        return request(`/api/meetings/${meetingId}/room`);
    },
    sendTurn(meetingId, payload) {
        return request(`/api/meetings/${meetingId}/turn`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },
    addParticipant(meetingId, payload) {
        return request(`/api/meetings/${meetingId}/participants`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },
    updateParticipant(meetingId, participantId, active) {
        return request(`/api/meetings/${meetingId}/participants/${participantId}`, {
            method: "PATCH",
            body: JSON.stringify({ active })
        });
    },
    removeParticipant(meetingId, participantId) {
        return request(`/api/meetings/${meetingId}/participants/${participantId}`, {
            method: "DELETE"
        });
    },
    createArtifact(meetingId, payload) {
        return request(`/api/meetings/${meetingId}/artifacts`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },
    createDecision(meetingId, payload) {
        return request(`/api/meetings/${meetingId}/decisions`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },
    createTask(meetingId, payload) {
        return request(`/api/meetings/${meetingId}/tasks`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },
    getOutcomes(meetingId) {
        return request(`/api/meetings/${meetingId}/outcomes`);
    },
    endMeeting(meetingId) {
        return request(`/api/meetings/${meetingId}/end`, {
            method: "POST"
        });
    }
};
