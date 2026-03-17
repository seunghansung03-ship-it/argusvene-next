import { mkdirSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type {
  Artifact,
  CreateArtifactPayload,
  CreateDecisionPayload,
  CreateMeetingPayload,
  CreateTaskPayload,
  Decision,
  Meeting,
  MeetingMessage,
  MeetingParticipant,
  RoomState,
  Task,
  User,
  UserRole,
  Workspace,
  WorkspaceFile,
  WorkspaceMember,
  WorkspaceSnapshot
} from "@argusvene/contracts";
import { DEFAULT_AGENTS } from "@argusvene/contracts";

interface Database {
  users: User[];
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  workspaceFiles: WorkspaceFile[];
  meetings: Meeting[];
  meetingParticipants: MeetingParticipant[];
  meetingMessages: MeetingMessage[];
  artifacts: Artifact[];
  decisions: Decision[];
  tasks: Task[];
}

const DATA_DIR = join(process.cwd(), ".data");
const DB_PATH = join(DATA_DIR, "db.json");
const UPLOADS_DIR = join(DATA_DIR, "uploads");

const EMPTY_DB: Database = {
  users: [],
  workspaces: [],
  workspaceMembers: [],
  workspaceFiles: [],
  meetings: [],
  meetingParticipants: [],
  meetingMessages: [],
  artifacts: [],
  decisions: [],
  tasks: []
};

function now() {
  return new Date().toISOString();
}

function ensureDataDir() {
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify(EMPTY_DB, null, 2));
  }
}

function readDb(): Database {
  ensureDataDir();
  return JSON.parse(readFileSync(DB_PATH, "utf8")) as Database;
}

function writeDb(db: Database) {
  ensureDataDir();
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function sortByCreatedAt<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function requireWorkspace(db: Database, workspaceId: string) {
  const workspace = db.workspaces.find((entry) => entry.id === workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found.");
  }
  return workspace;
}

function requireMeeting(db: Database, meetingId: string) {
  const meeting = db.meetings.find((entry) => entry.id === meetingId);
  if (!meeting) {
    throw new Error("Meeting not found.");
  }
  return meeting;
}

export function getUploadsDir() {
  ensureDataDir();
  return UPLOADS_DIR;
}

export function loginUser(name: string) {
  const cleanedName = name.trim();
  if (!cleanedName) {
    throw new Error("Name is required.");
  }

  const db = readDb();
  const existing = db.users.find((entry) => entry.name.toLowerCase() === cleanedName.toLowerCase());

  if (existing) {
    return existing;
  }

  const user: User = {
    id: randomUUID(),
    name: cleanedName,
    createdAt: now()
  };

  db.users.push(user);
  writeDb(db);
  return user;
}

export function listWorkspaces(userId: string) {
  const db = readDb();
  const memberWorkspaceIds = db.workspaceMembers
    .filter((member) => member.userId === userId)
    .map((member) => member.workspaceId);

  return db.workspaces
    .filter((workspace) => memberWorkspaceIds.includes(workspace.id))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function createWorkspace(ownerUserId: string, name: string, goal: string) {
  if (!name.trim()) {
    throw new Error("Workspace name is required.");
  }

  const db = readDb();
  const owner = db.users.find((entry) => entry.id === ownerUserId);
  if (!owner) {
    throw new Error("Owner user not found.");
  }

  const workspace: Workspace = {
    id: randomUUID(),
    name: name.trim(),
    goal: goal.trim(),
    ownerUserId,
    createdAt: now()
  };

  const member: WorkspaceMember = {
    id: randomUUID(),
    workspaceId: workspace.id,
    userId: owner.id,
    displayName: owner.name,
    role: "owner",
    createdAt: now()
  };

  db.workspaces.push(workspace);
  db.workspaceMembers.push(member);
  writeDb(db);
  return workspace;
}

export function getWorkspaceSnapshot(workspaceId: string): WorkspaceSnapshot {
  const db = readDb();
  const workspace = requireWorkspace(db, workspaceId);

  return {
    workspace,
    members: sortByCreatedAt(db.workspaceMembers.filter((entry) => entry.workspaceId === workspaceId)),
    files: sortByCreatedAt(db.workspaceFiles.filter((entry) => entry.workspaceId === workspaceId)),
    meetings: [...db.meetings]
      .filter((entry) => entry.workspaceId === workspaceId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  };
}

export function addWorkspaceMember(workspaceId: string, name: string, role: UserRole) {
  const cleanedName = name.trim();
  if (!cleanedName) {
    throw new Error("Member name is required.");
  }

  const db = readDb();
  requireWorkspace(db, workspaceId);

  let user = db.users.find((entry) => entry.name.toLowerCase() === cleanedName.toLowerCase());
  if (!user) {
    user = {
      id: randomUUID(),
      name: cleanedName,
      createdAt: now()
    };
    db.users.push(user);
  }

  const existing = db.workspaceMembers.find(
    (member) => member.workspaceId === workspaceId && member.userId === user.id
  );

  if (existing) {
    return existing;
  }

  const member: WorkspaceMember = {
    id: randomUUID(),
    workspaceId,
    userId: user.id,
    displayName: user.name,
    role,
    createdAt: now()
  };

  db.workspaceMembers.push(member);
  writeDb(db);
  return member;
}

export function removeWorkspaceMember(workspaceId: string, memberId: string) {
  const db = readDb();
  const nextMembers = db.workspaceMembers.filter(
    (member) => !(member.workspaceId === workspaceId && member.id === memberId)
  );
  db.workspaceMembers = nextMembers;
  writeDb(db);
}

export function registerWorkspaceFile(
  workspaceId: string,
  name: string,
  mimeType: string,
  storedName: string,
  size: number
) {
  const db = readDb();
  requireWorkspace(db, workspaceId);

  const file: WorkspaceFile = {
    id: randomUUID(),
    workspaceId,
    name,
    mimeType,
    storedName,
    size,
    createdAt: now()
  };

  db.workspaceFiles.push(file);
  writeDb(db);
  return file;
}

export function listWorkspaceFiles(workspaceId: string) {
  const db = readDb();
  requireWorkspace(db, workspaceId);
  return sortByCreatedAt(db.workspaceFiles.filter((entry) => entry.workspaceId === workspaceId));
}

export function getWorkspaceFile(workspaceId: string, fileId: string) {
  const db = readDb();
  return db.workspaceFiles.find((entry) => entry.workspaceId === workspaceId && entry.id === fileId);
}

export function deleteWorkspaceFile(workspaceId: string, fileId: string) {
  const db = readDb();
  const file = db.workspaceFiles.find((entry) => entry.workspaceId === workspaceId && entry.id === fileId);
  if (!file) {
    throw new Error("File not found.");
  }

  const storedPath = join(UPLOADS_DIR, workspaceId, file.storedName);
  if (existsSync(storedPath)) {
    unlinkSync(storedPath);
  }

  db.workspaceFiles = db.workspaceFiles.filter((entry) => entry.id !== fileId);
  writeDb(db);
}

export function createMeeting(workspaceId: string, payload: CreateMeetingPayload) {
  const db = readDb();
  requireWorkspace(db, workspaceId);
  const createdAt = now();

  const meeting: Meeting = {
    id: randomUUID(),
    workspaceId,
    title: payload.title.trim() || "Untitled meeting",
    goal: payload.goal.trim(),
    status: "live",
    createdAt,
    updatedAt: createdAt
  };

  const members = db.workspaceMembers.filter((entry) => entry.workspaceId === workspaceId);
  const humanParticipants: MeetingParticipant[] = members.map((member) => ({
    id: randomUUID(),
    meetingId: meeting.id,
    kind: "human",
    name: member.displayName,
    role: member.role,
    linkedUserId: member.userId,
    active: true,
    createdAt
  }));

  const agentParticipants: MeetingParticipant[] = DEFAULT_AGENTS.map((agent) => ({
    id: randomUUID(),
    meetingId: meeting.id,
    kind: "agent",
    name: agent.name,
    role: agent.role,
    active: true,
    createdAt
  }));

  const openingMessage: MeetingMessage = {
    id: randomUUID(),
    meetingId: meeting.id,
    authorId: "system",
    authorKind: "system",
    authorName: "ArgusVene",
    content: "Room opened. Start with the live decision you want the room to make.",
    createdAt
  };

  db.meetings.push(meeting);
  db.meetingParticipants.push(...humanParticipants, ...agentParticipants);
  db.meetingMessages.push(openingMessage);
  writeDb(db);
  return meeting;
}

function buildRoomState(db: Database, meetingId: string): RoomState {
  const meeting = requireMeeting(db, meetingId);
  const workspace = requireWorkspace(db, meeting.workspaceId);

  return {
    workspace,
    members: sortByCreatedAt(db.workspaceMembers.filter((entry) => entry.workspaceId === workspace.id)),
    files: sortByCreatedAt(db.workspaceFiles.filter((entry) => entry.workspaceId === workspace.id)),
    meeting,
    participants: sortByCreatedAt(db.meetingParticipants.filter((entry) => entry.meetingId === meetingId)),
    messages: sortByCreatedAt(db.meetingMessages.filter((entry) => entry.meetingId === meetingId)),
    artifacts: sortByCreatedAt(db.artifacts.filter((entry) => entry.meetingId === meetingId)),
    decisions: sortByCreatedAt(db.decisions.filter((entry) => entry.meetingId === meetingId)),
    tasks: sortByCreatedAt(db.tasks.filter((entry) => entry.meetingId === meetingId))
  };
}

export function getRoomState(meetingId: string) {
  const db = readDb();
  return buildRoomState(db, meetingId);
}

export function sendTurn(meetingId: string, authorId: string, content: string) {
  if (!content.trim()) {
    throw new Error("Message content is required.");
  }

  const db = readDb();
  const meeting = requireMeeting(db, meetingId);
  const author = db.meetingParticipants.find((entry) => entry.meetingId === meetingId && entry.id === authorId);
  if (!author) {
    throw new Error("Participant not found.");
  }

  const message: MeetingMessage = {
    id: randomUUID(),
    meetingId,
    authorId: author.id,
    authorKind: author.kind,
    authorName: author.name,
    content: content.trim(),
    createdAt: now()
  };

  meeting.updatedAt = now();
  db.meetingMessages.push(message);
  writeDb(db);
  return buildRoomState(db, meetingId);
}

export function addMeetingParticipant(meetingId: string, kind: "human" | "agent", name: string, role: string) {
  const cleanedName = name.trim();
  if (!cleanedName) {
    throw new Error("Participant name is required.");
  }

  const db = readDb();
  const meeting = requireMeeting(db, meetingId);

  let linkedUserId: string | undefined;
  if (kind === "human") {
    let user = db.users.find((entry) => entry.name.toLowerCase() === cleanedName.toLowerCase());
    if (!user) {
      user = {
        id: randomUUID(),
        name: cleanedName,
        createdAt: now()
      };
      db.users.push(user);
    }

    const alreadyMember = db.workspaceMembers.find(
      (entry) => entry.workspaceId === meeting.workspaceId && entry.userId === user.id
    );
    if (!alreadyMember) {
      db.workspaceMembers.push({
        id: randomUUID(),
        workspaceId: meeting.workspaceId,
        userId: user.id,
        displayName: user.name,
        role: "member",
        createdAt: now()
      });
    }
    linkedUserId = user.id;
  }

  const participant: MeetingParticipant = {
    id: randomUUID(),
    meetingId,
    kind,
    name: cleanedName,
    role: role.trim() || (kind === "agent" ? "specialist" : "member"),
    linkedUserId,
    active: true,
    createdAt: now()
  };

  db.meetingParticipants.push(participant);
  writeDb(db);
  return participant;
}

export function updateMeetingParticipant(meetingId: string, participantId: string, active: boolean) {
  const db = readDb();
  const participant = db.meetingParticipants.find(
    (entry) => entry.meetingId === meetingId && entry.id === participantId
  );
  if (!participant) {
    throw new Error("Participant not found.");
  }

  participant.active = active;
  writeDb(db);
  return participant;
}

export function removeMeetingParticipant(meetingId: string, participantId: string) {
  const db = readDb();
  db.meetingParticipants = db.meetingParticipants.filter(
    (entry) => !(entry.meetingId === meetingId && entry.id === participantId)
  );
  writeDb(db);
}

export function createArtifact(meetingId: string, payload: CreateArtifactPayload) {
  const db = readDb();
  requireMeeting(db, meetingId);

  const createdAt = now();
  const artifact: Artifact = {
    id: randomUUID(),
    meetingId,
    title: payload.title.trim(),
    summary: payload.summary.trim(),
    body: payload.body.trim(),
    kind: payload.kind,
    createdAt,
    updatedAt: createdAt
  };

  db.artifacts.push(artifact);
  writeDb(db);
  return artifact;
}

export function createDecision(meetingId: string, payload: CreateDecisionPayload) {
  const db = readDb();
  requireMeeting(db, meetingId);

  const decision: Decision = {
    id: randomUUID(),
    meetingId,
    title: payload.title.trim(),
    summary: payload.summary.trim(),
    status: "open",
    createdAt: now()
  };

  db.decisions.push(decision);
  writeDb(db);
  return decision;
}

export function createTask(meetingId: string, payload: CreateTaskPayload) {
  const db = readDb();
  requireMeeting(db, meetingId);

  const task: Task = {
    id: randomUUID(),
    meetingId,
    title: payload.title.trim(),
    ownerName: payload.ownerName.trim() || "Unassigned",
    status: "open",
    createdAt: now()
  };

  db.tasks.push(task);
  writeDb(db);
  return task;
}

export function endMeeting(meetingId: string) {
  const db = readDb();
  const meeting = requireMeeting(db, meetingId);
  meeting.status = "ended";
  meeting.updatedAt = now();
  writeDb(db);
  return meeting;
}

export function getOutcomes(meetingId: string) {
  const db = readDb();
  requireMeeting(db, meetingId);

  return {
    artifacts: sortByCreatedAt(db.artifacts.filter((entry) => entry.meetingId === meetingId)),
    decisions: sortByCreatedAt(db.decisions.filter((entry) => entry.meetingId === meetingId)),
    tasks: sortByCreatedAt(db.tasks.filter((entry) => entry.meetingId === meetingId))
  };
}

export function getFileOnDisk(workspaceId: string, storedName: string) {
  const path = join(UPLOADS_DIR, workspaceId, storedName);
  statSync(path);
  return path;
}

export function clearDatabase() {
  if (existsSync(DATA_DIR)) {
    rmSync(DATA_DIR, { recursive: true, force: true });
  }
}
