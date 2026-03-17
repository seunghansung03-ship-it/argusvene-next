import { mkdirSync } from "node:fs";
import { join } from "node:path";
import cors from "cors";
import express from "express";
import multer from "multer";
import type {
  AddMemberPayload,
  AddParticipantPayload,
  CreateArtifactPayload,
  CreateDecisionPayload,
  CreateMeetingPayload,
  CreateTaskPayload,
  CreateWorkspacePayload,
  LoginPayload,
  SendTurnPayload,
  UpdateParticipantPayload
} from "@argusvene/contracts";
import {
  addMeetingParticipant,
  addWorkspaceMember,
  clearDatabase,
  createArtifact,
  createDecision,
  createMeeting,
  createTask,
  createWorkspace,
  deleteWorkspaceFile,
  endMeeting,
  getFileOnDisk,
  getOutcomes,
  getRoomState,
  getUploadsDir,
  getWorkspaceFile,
  getWorkspaceSnapshot,
  listWorkspaceFiles,
  listWorkspaces,
  loginUser,
  registerWorkspaceFile,
  removeMeetingParticipant,
  removeWorkspaceMember,
  sendTurn,
  updateMeetingParticipant
} from "./store.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: "4mb" }));

const uploadRoot = getUploadsDir();
const storage = multer.diskStorage({
  destination(req, _file, callback) {
    const workspaceId = routeParam(req.params.workspaceId, "Workspace id");
    const workspaceDir = join(uploadRoot, workspaceId);
    mkdirSync(workspaceDir, { recursive: true });
    callback(null, workspaceDir);
  },
  filename(_req, file, callback) {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    callback(null, safeName);
  }
});

const upload = multer({ storage });

function handleError(error: unknown, response: express.Response) {
  const message = error instanceof Error ? error.message : "Unknown server error.";
  response.status(400).json({ error: message });
}

function routeParam(value: string | string[] | undefined, label: string) {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  throw new Error(`${label} is required.`);
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/auth/login", (request, response) => {
  try {
    const payload = request.body as LoginPayload;
    const user = loginUser(payload.name ?? "");
    response.json(user);
  } catch (error) {
    handleError(error, response);
  }
});

app.get("/api/workspaces", (request, response) => {
  try {
    const userId = String(request.query.userId ?? "");
    response.json(listWorkspaces(userId));
  } catch (error) {
    handleError(error, response);
  }
});

app.post("/api/workspaces", (request, response) => {
  try {
    const payload = request.body as CreateWorkspacePayload;
    response.json(createWorkspace(payload.ownerUserId, payload.name, payload.goal));
  } catch (error) {
    handleError(error, response);
  }
});

app.get("/api/workspaces/:workspaceId", (request, response) => {
  try {
    response.json(getWorkspaceSnapshot(routeParam(request.params.workspaceId, "Workspace id")));
  } catch (error) {
    handleError(error, response);
  }
});

app.post("/api/workspaces/:workspaceId/members", (request, response) => {
  try {
    const payload = request.body as AddMemberPayload;
    response.json(addWorkspaceMember(routeParam(request.params.workspaceId, "Workspace id"), payload.name, payload.role));
  } catch (error) {
    handleError(error, response);
  }
});

app.delete("/api/workspaces/:workspaceId/members/:memberId", (request, response) => {
  try {
    removeWorkspaceMember(
      routeParam(request.params.workspaceId, "Workspace id"),
      routeParam(request.params.memberId, "Member id")
    );
    response.status(204).send();
  } catch (error) {
    handleError(error, response);
  }
});

app.get("/api/workspaces/:workspaceId/files", (request, response) => {
  try {
    response.json(listWorkspaceFiles(routeParam(request.params.workspaceId, "Workspace id")));
  } catch (error) {
    handleError(error, response);
  }
});

app.post("/api/workspaces/:workspaceId/files", upload.single("file"), (request, response) => {
  try {
    if (!request.file) {
      throw new Error("File upload is required.");
    }

    response.json(
      registerWorkspaceFile(
        routeParam(request.params.workspaceId, "Workspace id"),
        request.file.originalname,
        request.file.mimetype,
        request.file.filename,
        request.file.size
      )
    );
  } catch (error) {
    handleError(error, response);
  }
});

app.get("/api/workspaces/:workspaceId/files/:fileId/download", (request, response) => {
  try {
    const workspaceId = routeParam(request.params.workspaceId, "Workspace id");
    const fileId = routeParam(request.params.fileId, "File id");
    const file = getWorkspaceFile(workspaceId, fileId);
    if (!file) {
      throw new Error("File not found.");
    }

    response.download(getFileOnDisk(workspaceId, file.storedName), file.name);
  } catch (error) {
    handleError(error, response);
  }
});

app.delete("/api/workspaces/:workspaceId/files/:fileId", (request, response) => {
  try {
    deleteWorkspaceFile(
      routeParam(request.params.workspaceId, "Workspace id"),
      routeParam(request.params.fileId, "File id")
    );
    response.status(204).send();
  } catch (error) {
    handleError(error, response);
  }
});

app.post("/api/workspaces/:workspaceId/meetings", (request, response) => {
  try {
    const payload = request.body as CreateMeetingPayload;
    response.json(createMeeting(routeParam(request.params.workspaceId, "Workspace id"), payload));
  } catch (error) {
    handleError(error, response);
  }
});

app.get("/api/meetings/:meetingId/room", (request, response) => {
  try {
    response.json(getRoomState(routeParam(request.params.meetingId, "Meeting id")));
  } catch (error) {
    handleError(error, response);
  }
});

app.post("/api/meetings/:meetingId/turn", (request, response) => {
  try {
    const payload = request.body as SendTurnPayload;
    response.json(sendTurn(routeParam(request.params.meetingId, "Meeting id"), payload.authorId, payload.content));
  } catch (error) {
    handleError(error, response);
  }
});

app.post("/api/meetings/:meetingId/participants", (request, response) => {
  try {
    const payload = request.body as AddParticipantPayload;
    response.json(
      addMeetingParticipant(routeParam(request.params.meetingId, "Meeting id"), payload.kind, payload.name, payload.role)
    );
  } catch (error) {
    handleError(error, response);
  }
});

app.patch("/api/meetings/:meetingId/participants/:participantId", (request, response) => {
  try {
    const payload = request.body as UpdateParticipantPayload;
    response.json(
      updateMeetingParticipant(
        routeParam(request.params.meetingId, "Meeting id"),
        routeParam(request.params.participantId, "Participant id"),
        payload.active
      )
    );
  } catch (error) {
    handleError(error, response);
  }
});

app.delete("/api/meetings/:meetingId/participants/:participantId", (request, response) => {
  try {
    removeMeetingParticipant(
      routeParam(request.params.meetingId, "Meeting id"),
      routeParam(request.params.participantId, "Participant id")
    );
    response.status(204).send();
  } catch (error) {
    handleError(error, response);
  }
});

app.post("/api/meetings/:meetingId/artifacts", (request, response) => {
  try {
    const payload = request.body as CreateArtifactPayload;
    response.json(createArtifact(routeParam(request.params.meetingId, "Meeting id"), payload));
  } catch (error) {
    handleError(error, response);
  }
});

app.post("/api/meetings/:meetingId/decisions", (request, response) => {
  try {
    const payload = request.body as CreateDecisionPayload;
    response.json(createDecision(routeParam(request.params.meetingId, "Meeting id"), payload));
  } catch (error) {
    handleError(error, response);
  }
});

app.post("/api/meetings/:meetingId/tasks", (request, response) => {
  try {
    const payload = request.body as CreateTaskPayload;
    response.json(createTask(routeParam(request.params.meetingId, "Meeting id"), payload));
  } catch (error) {
    handleError(error, response);
  }
});

app.get("/api/meetings/:meetingId/outcomes", (request, response) => {
  try {
    response.json(getOutcomes(routeParam(request.params.meetingId, "Meeting id")));
  } catch (error) {
    handleError(error, response);
  }
});

app.post("/api/meetings/:meetingId/end", (request, response) => {
  try {
    response.json(endMeeting(routeParam(request.params.meetingId, "Meeting id")));
  } catch (error) {
    handleError(error, response);
  }
});

app.post("/api/dev/reset", (_request, response) => {
  clearDatabase();
  response.status(204).send();
});

app.listen(port, () => {
  console.log(`ArgusVene API listening on http://localhost:${port}`);
});
