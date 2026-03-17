import type {
  AddMemberPayload,
  AddParticipantPayload,
  CreateArtifactPayload,
  CreateDecisionPayload,
  CreateMeetingPayload,
  CreateTaskPayload,
  CreateWorkspacePayload,
  LoginPayload,
  Meeting,
  RoomState,
  SendTurnPayload,
  User,
  Workspace,
  WorkspaceFile,
  WorkspaceSnapshot
} from "@argusvene/contracts";

interface HealthResponse {
  ok: boolean;
  geminiConfigured: boolean;
}

async function request<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  health() {
    return request<HealthResponse>("/api/health");
  },
  login(payload: LoginPayload) {
    return request<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  listWorkspaces(userId: string) {
    return request<Workspace[]>(`/api/workspaces?userId=${encodeURIComponent(userId)}`);
  },
  createWorkspace(payload: CreateWorkspacePayload) {
    return request<Workspace>("/api/workspaces", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getWorkspace(workspaceId: string) {
    return request<WorkspaceSnapshot>(`/api/workspaces/${workspaceId}`);
  },
  addWorkspaceMember(workspaceId: string, payload: AddMemberPayload) {
    return request(`/api/workspaces/${workspaceId}/members`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  removeWorkspaceMember(workspaceId: string, memberId: string) {
    return request(`/api/workspaces/${workspaceId}/members/${memberId}`, {
      method: "DELETE"
    });
  },
  async uploadWorkspaceFile(workspaceId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`/api/workspaces/${workspaceId}/files`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? "File upload failed.");
    }

    return (await response.json()) as WorkspaceFile;
  },
  removeWorkspaceFile(workspaceId: string, fileId: string) {
    return request(`/api/workspaces/${workspaceId}/files/${fileId}`, {
      method: "DELETE"
    });
  },
  createMeeting(workspaceId: string, payload: CreateMeetingPayload) {
    return request<Meeting>(`/api/workspaces/${workspaceId}/meetings`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getRoom(meetingId: string) {
    return request<RoomState>(`/api/meetings/${meetingId}/room`);
  },
  sendTurn(meetingId: string, payload: SendTurnPayload) {
    return request<RoomState>(`/api/meetings/${meetingId}/turn`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  runAgentTurns(meetingId: string) {
    return request<RoomState>(`/api/meetings/${meetingId}/agent-turns`, {
      method: "POST"
    });
  },
  addParticipant(meetingId: string, payload: AddParticipantPayload) {
    return request(`/api/meetings/${meetingId}/participants`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateParticipant(meetingId: string, participantId: string, active: boolean) {
    return request(`/api/meetings/${meetingId}/participants/${participantId}`, {
      method: "PATCH",
      body: JSON.stringify({ active })
    });
  },
  removeParticipant(meetingId: string, participantId: string) {
    return request(`/api/meetings/${meetingId}/participants/${participantId}`, {
      method: "DELETE"
    });
  },
  createArtifact(meetingId: string, payload: CreateArtifactPayload) {
    return request(`/api/meetings/${meetingId}/artifacts`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  createDecision(meetingId: string, payload: CreateDecisionPayload) {
    return request(`/api/meetings/${meetingId}/decisions`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  createTask(meetingId: string, payload: CreateTaskPayload) {
    return request(`/api/meetings/${meetingId}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getOutcomes(meetingId: string) {
    return request<Pick<RoomState, "artifacts" | "decisions" | "tasks">>(`/api/meetings/${meetingId}/outcomes`);
  },
  endMeeting(meetingId: string) {
    return request(`/api/meetings/${meetingId}/end`, {
      method: "POST"
    });
  }
};
