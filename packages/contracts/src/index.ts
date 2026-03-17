export type UserRole = "owner" | "member" | "viewer";
export type MeetingStatus = "live" | "ended";
export type ParticipantKind = "human" | "agent";
export type ArtifactKind = "spec" | "prototype" | "research" | "note";
export type DecisionStatus = "open" | "locked";
export type TaskStatus = "open" | "done";

export interface User {
  id: string;
  name: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  goal: string;
  ownerUserId: string;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface WorkspaceFile {
  id: string;
  workspaceId: string;
  name: string;
  size: number;
  mimeType: string;
  storedName: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  workspaceId: string;
  title: string;
  goal: string;
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  kind: ParticipantKind;
  name: string;
  role: string;
  linkedUserId?: string;
  active: boolean;
  createdAt: string;
}

export interface MeetingMessage {
  id: string;
  meetingId: string;
  authorId: string;
  authorKind: ParticipantKind | "system";
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Artifact {
  id: string;
  meetingId: string;
  title: string;
  summary: string;
  body: string;
  kind: ArtifactKind;
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  meetingId: string;
  title: string;
  summary: string;
  status: DecisionStatus;
  createdAt: string;
}

export interface Task {
  id: string;
  meetingId: string;
  title: string;
  ownerName: string;
  status: TaskStatus;
  createdAt: string;
}

export interface WorkspaceSnapshot {
  workspace: Workspace;
  members: WorkspaceMember[];
  files: WorkspaceFile[];
  meetings: Meeting[];
}

export interface RoomState {
  workspace: Workspace;
  members: WorkspaceMember[];
  files: WorkspaceFile[];
  meeting: Meeting;
  participants: MeetingParticipant[];
  messages: MeetingMessage[];
  artifacts: Artifact[];
  decisions: Decision[];
  tasks: Task[];
}

export interface DefaultAgentBlueprint {
  name: string;
  role: string;
  purpose: string;
}

export const DEFAULT_AGENTS: DefaultAgentBlueprint[] = [
  {
    name: "Atlas",
    role: "strategist",
    purpose: "Keeps the room aligned on goal, scope, and decision framing."
  },
  {
    name: "Nova",
    role: "builder",
    purpose: "Turns conversation into draftable specs, prototypes, and concrete next steps."
  },
  {
    name: "Sera",
    role: "critic",
    purpose: "Pushes on gaps, hidden risks, and revision pressure before the room locks a call."
  }
];

export interface LoginPayload {
  name: string;
}

export interface CreateWorkspacePayload {
  ownerUserId: string;
  name: string;
  goal: string;
}

export interface AddMemberPayload {
  name: string;
  role: UserRole;
}

export interface CreateMeetingPayload {
  title: string;
  goal: string;
}

export interface SendTurnPayload {
  authorId: string;
  content: string;
}

export interface AddParticipantPayload {
  kind: ParticipantKind;
  name: string;
  role: string;
}

export interface UpdateParticipantPayload {
  active: boolean;
}

export interface CreateArtifactPayload {
  title: string;
  summary: string;
  body: string;
  kind: ArtifactKind;
}

export interface CreateDecisionPayload {
  title: string;
  summary: string;
}

export interface CreateTaskPayload {
  title: string;
  ownerName: string;
}
