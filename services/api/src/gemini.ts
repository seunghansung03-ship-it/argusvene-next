import { GoogleGenAI } from "@google/genai";
import type { ArtifactKind, MeetingParticipant, RoomState } from "@argusvene/contracts";

interface AgentStructuredOutput {
  shouldRespond: boolean;
  reply: string;
  artifact: null | {
    title: string;
    summary: string;
    body: string;
    kind: ArtifactKind;
  };
  decision: null | {
    title: string;
    summary: string;
  };
  task: null | {
    title: string;
    ownerName: string;
  };
}

interface AgentTurnResult {
  participant: MeetingParticipant;
  output: AgentStructuredOutput;
}

const AGENT_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

function getApiKey() {
  return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "";
}

function getClient() {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini is not configured. Set GEMINI_API_KEY or GOOGLE_API_KEY.");
  }

  return new GoogleGenAI({ apiKey });
}

function recentTranscript(room: RoomState) {
  return room.messages
    .slice(-8)
    .map((message) => `${message.authorName} [${message.authorKind}]: ${message.content}`)
    .join("\n");
}

function recentArtifacts(room: RoomState) {
  return room.artifacts
    .slice(-4)
    .map((artifact) => `- ${artifact.title} (${artifact.kind}): ${artifact.summary}`)
    .join("\n");
}

function recentDecisions(room: RoomState) {
  return room.decisions
    .slice(-4)
    .map((decision) => `- ${decision.title}: ${decision.summary}`)
    .join("\n");
}

function recentTasks(room: RoomState) {
  return room.tasks
    .slice(-4)
    .map((task) => `- ${task.title} -> ${task.ownerName}`)
    .join("\n");
}

function roomFiles(room: RoomState) {
  return room.files.map((file) => `- ${file.name} (${Math.round(file.size / 1024)} KB)`).join("\n");
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    shouldRespond: {
      type: "boolean",
      description: "Whether this agent should speak right now."
    },
    reply: {
      type: "string",
      description: "Short but concrete agent response for the room."
    },
    artifact: {
      type: ["object", "null"],
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        body: { type: "string" },
        kind: {
          type: "string",
          enum: ["spec", "prototype", "research", "note"]
        }
      },
      required: ["title", "summary", "body", "kind"],
      additionalProperties: false
    },
    decision: {
      type: ["object", "null"],
      properties: {
        title: { type: "string" },
        summary: { type: "string" }
      },
      required: ["title", "summary"],
      additionalProperties: false
    },
    task: {
      type: ["object", "null"],
      properties: {
        title: { type: "string" },
        ownerName: { type: "string" }
      },
      required: ["title", "ownerName"],
      additionalProperties: false
    }
  },
  required: ["shouldRespond", "reply", "artifact", "decision", "task"],
  additionalProperties: false
} as const;

function buildPrompt(room: RoomState, participant: MeetingParticipant) {
  const artifactText = recentArtifacts(room) || "- none";
  const decisionText = recentDecisions(room) || "- none";
  const taskText = recentTasks(room) || "- none";
  const fileText = roomFiles(room) || "- none";

  return `
You are ${participant.name}, an AI participant in a live meeting room.
Your role is: ${participant.role}.

Room rules:
- You are not a generic chatbot. You are an active meeting participant.
- Respond only if your role meaningfully improves the room right now.
- If you respond, keep the reply under 120 words and make it concrete.
- You may optionally create at most one artifact, one decision, and one task.
- Only create outputs that materially advance the room in this moment.
- If there is not enough reason to speak, set shouldRespond to false and leave other outputs empty.

Workspace: ${room.workspace.name}
Workspace goal: ${room.workspace.goal || "None provided."}
Meeting title: ${room.meeting.title}
Meeting goal: ${room.meeting.goal || "None provided."}

Participants:
${room.participants.map((entry) => `- ${entry.name} (${entry.kind}, ${entry.role}, active=${entry.active})`).join("\n")}

Recent transcript:
${recentTranscript(room) || "- no messages yet"}

Current artifacts:
${artifactText}

Current decisions:
${decisionText}

Current tasks:
${taskText}

Files available in the room:
${fileText}
  `.trim();
}

function parseStructuredOutput(raw: string) {
  return JSON.parse(raw) as AgentStructuredOutput;
}

export function isGeminiConfigured() {
  return Boolean(getApiKey());
}

export async function generateAgentTurns(room: RoomState) {
  const client = getClient();
  const activeAgents = room.participants.filter((entry) => entry.kind === "agent" && entry.active).slice(0, 3);
  const results: AgentTurnResult[] = [];

  for (const participant of activeAgents) {
    const response = await client.models.generateContent({
      model: AGENT_MODEL,
      contents: buildPrompt(room, participant),
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: RESPONSE_SCHEMA
      }
    });

    if (!response.text) {
      throw new Error(`Gemini returned an empty response for agent ${participant.name}.`);
    }

    const parsed = parseStructuredOutput(response.text);
    results.push({
      participant,
      output: parsed
    });
  }

  return results;
}
