import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ArtifactKind, RoomState } from "@argusvene/contracts";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { api } from "../lib/api";
import { getStoredSessionUser } from "../lib/session";

export function MeetingPage() {
  const { meetingId = "" } = useParams();
  const navigate = useNavigate();
  const sessionUser = getStoredSessionUser();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [message, setMessage] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participantRole, setParticipantRole] = useState("");
  const [artifactTitle, setArtifactTitle] = useState("");
  const [artifactSummary, setArtifactSummary] = useState("");
  const [artifactBody, setArtifactBody] = useState("");
  const [artifactKind, setArtifactKind] = useState<ArtifactKind>("spec");
  const [decisionTitle, setDecisionTitle] = useState("");
  const [decisionSummary, setDecisionSummary] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskOwner, setTaskOwner] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadRoom() {
    setRoom(await api.getRoom(meetingId));
  }

  useEffect(() => {
    loadRoom().catch((fetchError: unknown) => {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load meeting room.");
    });
  }, [meetingId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadRoom();
    }, 4000);
    return () => window.clearInterval(interval);
  }, [meetingId]);

  const humanParticipant = useMemo(() => {
    if (!room || !sessionUser) {
      return null;
    }

    return (
      room.participants.find(
        (participant) => participant.kind === "human" && participant.linkedUserId === sessionUser.id
      ) ?? null
    );
  }, [room, sessionUser]);

  async function handleSendTurn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!humanParticipant) {
      setError("Current user is not in this room yet.");
      return;
    }

    const nextRoom = await api.sendTurn(meetingId, {
      authorId: humanParticipant.id,
      content: message
    });
    setRoom(nextRoom);
    setMessage("");
  }

  async function handleAddParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.addParticipant(meetingId, {
      kind: "human",
      name: participantName,
      role: participantRole
    });
    setParticipantName("");
    setParticipantRole("");
    await loadRoom();
  }

  async function handleAddArtifact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.createArtifact(meetingId, {
      title: artifactTitle,
      summary: artifactSummary,
      body: artifactBody,
      kind: artifactKind
    });
    setArtifactTitle("");
    setArtifactSummary("");
    setArtifactBody("");
    await loadRoom();
  }

  async function handleAddDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.createDecision(meetingId, {
      title: decisionTitle,
      summary: decisionSummary
    });
    setDecisionTitle("");
    setDecisionSummary("");
    await loadRoom();
  }

  async function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.createTask(meetingId, {
      title: taskTitle,
      ownerName: taskOwner
    });
    setTaskTitle("");
    setTaskOwner("");
    await loadRoom();
  }

  async function toggleParticipant(participantId: string, active: boolean) {
    await api.updateParticipant(meetingId, participantId, active);
    await loadRoom();
  }

  async function removeParticipant(participantId: string) {
    await api.removeParticipant(meetingId, participantId);
    await loadRoom();
  }

  async function handleEndMeeting() {
    await api.endMeeting(meetingId);
    navigate(`/meeting/${meetingId}/outcomes`);
  }

  if (!room) {
    return (
      <AppShell title="Meeting Room" subtitle="Loading live room...">
        <section className="panel">Loading...</section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={room.meeting.title}
      subtitle={room.meeting.goal || "No meeting goal set yet."}
      actions={
        <div className="row-actions">
          <Link className="ghost-link" to={`/workspace/${room.workspace.id}`}>
            Workspace
          </Link>
          <button className="secondary-button" onClick={() => void handleEndMeeting()} type="button">
            End meeting
          </button>
        </div>
      }
    >
      <div className="room-layout">
        <section className="room-panel room-panel--transcript">
          <div className="section-heading compact">
            <span className="eyebrow">Transcript</span>
            <h2>Human conversation and direct instructions</h2>
          </div>
          <div className="message-feed">
            {room.messages.map((entry) => (
              <article className={`message-bubble message-bubble--${entry.authorKind}`} key={entry.id}>
                <header>
                  <strong>{entry.authorName}</strong>
                  <span>{new Date(entry.createdAt).toLocaleTimeString()}</span>
                </header>
                <p>{entry.content}</p>
              </article>
            ))}
          </div>
          <form className="stack-form" onSubmit={handleSendTurn}>
            <label>
              Send to the room
              <textarea
                onChange={(event) => setMessage(event.target.value)}
                placeholder="State the next thing the room should work on."
                rows={4}
                value={message}
              />
            </label>
            {error ? <p className="error-text">{error}</p> : null}
            <button className="primary-button" type="submit">Send turn</button>
          </form>
        </section>

        <section className="room-panel room-panel--canvas">
          <div className="section-heading compact">
            <span className="eyebrow">Live canvas</span>
            <h2>Capture what the room is making, deciding, and assigning.</h2>
          </div>

          <div className="canvas-stack">
            <form className="stack-form" onSubmit={handleAddArtifact}>
              <h3>Create artifact</h3>
              <input
                onChange={(event) => setArtifactTitle(event.target.value)}
                placeholder="Artifact title"
                value={artifactTitle}
              />
              <input
                onChange={(event) => setArtifactSummary(event.target.value)}
                placeholder="What is this artifact for?"
                value={artifactSummary}
              />
              <select onChange={(event) => setArtifactKind(event.target.value as ArtifactKind)} value={artifactKind}>
                <option value="spec">Spec</option>
                <option value="prototype">Prototype</option>
                <option value="research">Research</option>
                <option value="note">Note</option>
              </select>
              <textarea
                onChange={(event) => setArtifactBody(event.target.value)}
                placeholder="Artifact body"
                rows={5}
                value={artifactBody}
              />
              <button className="secondary-button" type="submit">Save artifact</button>
            </form>

            <div className="stack-list">
              {room.artifacts.map((artifact) => (
                <article className="list-card" key={artifact.id}>
                  <header>
                    <strong>{artifact.title}</strong>
                    <span className="pill">{artifact.kind}</span>
                  </header>
                  <p>{artifact.summary}</p>
                  <pre>{artifact.body}</pre>
                </article>
              ))}
              {room.artifacts.length === 0 ? <p className="muted-copy">No artifacts yet.</p> : null}
            </div>

            <div className="outcome-row">
              <form className="stack-form" onSubmit={handleAddDecision}>
                <h3>Lock decision</h3>
                <input
                  onChange={(event) => setDecisionTitle(event.target.value)}
                  placeholder="Decision title"
                  value={decisionTitle}
                />
                <textarea
                  onChange={(event) => setDecisionSummary(event.target.value)}
                  placeholder="What is the actual call?"
                  rows={3}
                  value={decisionSummary}
                />
                <button className="secondary-button" type="submit">Save decision</button>
              </form>

              <form className="stack-form" onSubmit={handleAddTask}>
                <h3>Open task</h3>
                <input
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="Task title"
                  value={taskTitle}
                />
                <input
                  onChange={(event) => setTaskOwner(event.target.value)}
                  placeholder="Owner"
                  value={taskOwner}
                />
                <button className="secondary-button" type="submit">Save task</button>
              </form>
            </div>
          </div>
        </section>

        <section className="room-panel room-panel--ops">
          <div className="section-heading compact">
            <span className="eyebrow">Operators</span>
            <h2>Invite, remove, and control who is active in the room.</h2>
          </div>
          <form className="stack-form" onSubmit={handleAddParticipant}>
            <input
              onChange={(event) => setParticipantName(event.target.value)}
              placeholder="Participant name"
              value={participantName}
            />
            <input
              onChange={(event) => setParticipantRole(event.target.value)}
              placeholder="Role"
              value={participantRole}
            />
            <button className="secondary-button" type="submit">Add human</button>
          </form>
          <div className="stack-list">
            {room.participants.map((participant) => (
              <article className="list-card" key={participant.id}>
                <header>
                  <strong>{participant.name}</strong>
                  <span className="pill">{participant.kind}</span>
                </header>
                <p>{participant.role}</p>
                <div className="row-actions">
                  <button
                    className="ghost-button"
                    onClick={() => void toggleParticipant(participant.id, !participant.active)}
                    type="button"
                  >
                    {participant.active ? "Deactivate" : "Activate"}
                  </button>
                  <button className="ghost-button" onClick={() => void removeParticipant(participant.id)} type="button">
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="section-heading compact">
            <span className="eyebrow">Context files</span>
            <h3>Files available to this room</h3>
          </div>
          <div className="stack-list">
            {room.files.map((file) => (
              <a
                className="list-row"
                href={`/api/workspaces/${room.workspace.id}/files/${file.id}/download`}
                key={file.id}
              >
                <div>
                  <strong>{file.name}</strong>
                  <p>{Math.round(file.size / 1024)} KB</p>
                </div>
              </a>
            ))}
            {room.files.length === 0 ? <p className="muted-copy">No context files attached.</p> : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
