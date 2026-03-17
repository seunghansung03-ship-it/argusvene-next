import { FormEvent, useEffect, useState } from "react";
import type { WorkspaceFile, WorkspaceSnapshot } from "@argusvene/contracts";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { api } from "../lib/api";

export function WorkspacePage() {
  const { workspaceId = "" } = useParams();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot | null>(null);
  const [inviteName, setInviteName] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingGoal, setMeetingGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function loadWorkspace() {
    setSnapshot(await api.getWorkspace(workspaceId));
  }

  useEffect(() => {
    loadWorkspace().catch((fetchError: unknown) => {
      setError(fetchError instanceof Error ? fetchError.message : "Workspace load failed.");
    });
  }, [workspaceId]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.addWorkspaceMember(workspaceId, { name: inviteName, role: "member" });
    setInviteName("");
    await loadWorkspace();
  }

  async function handleUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      await api.uploadWorkspaceFile(workspaceId, file);
      await loadWorkspace();
    } finally {
      setIsUploading(false);
    }
  }

  async function handleCreateMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const meeting = await api.createMeeting(workspaceId, {
      title: meetingTitle,
      goal: meetingGoal
    });
    navigate(`/meeting/${meeting.id}`);
  }

  async function deleteFile(file: WorkspaceFile) {
    await api.removeWorkspaceFile(workspaceId, file.id);
    await loadWorkspace();
  }

  if (!snapshot) {
    return (
      <AppShell title="Workspace Prep" subtitle="Loading workspace...">
        <section className="panel">Loading...</section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={snapshot.workspace.name}
      subtitle={snapshot.workspace.goal || "Set a clear mission, then open the room."}
      actions={<Link className="ghost-link" to="/">Back home</Link>}
    >
      <div className="workspace-grid">
        <section className="panel">
          <div className="section-heading">
            <span className="eyebrow">Open room</span>
            <h2>Move quickly from prep into live operations.</h2>
          </div>
          <form className="stack-form" onSubmit={handleCreateMeeting}>
            <label>
              Meeting title
              <input onChange={(event) => setMeetingTitle(event.target.value)} value={meetingTitle} />
            </label>
            <label>
              Meeting goal
              <textarea
                onChange={(event) => setMeetingGoal(event.target.value)}
                rows={4}
                value={meetingGoal}
              />
            </label>
            <button className="primary-button" type="submit">
              Open live room
            </button>
          </form>

          <div className="section-heading compact">
            <span className="eyebrow">Meetings</span>
            <h3>Recent rooms</h3>
          </div>
          <div className="stack-list">
            {snapshot.meetings.map((meeting) => (
              <Link className="list-row" key={meeting.id} to={`/meeting/${meeting.id}`}>
                <div>
                  <strong>{meeting.title}</strong>
                  <p>{meeting.goal || "No room goal recorded."}</p>
                </div>
                <span className="pill">{meeting.status}</span>
              </Link>
            ))}
            {snapshot.meetings.length === 0 ? <p className="muted-copy">No rooms yet.</p> : null}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <span className="eyebrow">People</span>
            <h2>Invite the humans who should be in the room.</h2>
          </div>
          <form className="inline-form" onSubmit={handleInvite}>
            <input
              onChange={(event) => setInviteName(event.target.value)}
              placeholder="New member name"
              value={inviteName}
            />
            <button className="secondary-button" type="submit">Invite</button>
          </form>
          <div className="stack-list">
            {snapshot.members.map((member) => (
              <div className="list-row" key={member.id}>
                <div>
                  <strong>{member.displayName}</strong>
                  <p>{member.role}</p>
                </div>
                <button
                  className="ghost-button"
                  onClick={() => void api.removeWorkspaceMember(workspaceId, member.id).then(loadWorkspace)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <span className="eyebrow">Context files</span>
            <h2>Upload source material the room should reference.</h2>
          </div>
          <label className="file-picker">
            <input onChange={(event) => void handleUpload(event.target.files?.[0])} type="file" />
            <span>{isUploading ? "Uploading..." : "Choose file"}</span>
          </label>
          <div className="stack-list">
            {snapshot.files.map((file) => (
              <div className="list-row" key={file.id}>
                <div>
                  <strong>{file.name}</strong>
                  <p>{Math.round(file.size / 1024)} KB</p>
                </div>
                <div className="row-actions">
                  <a className="ghost-link" href={`/api/workspaces/${workspaceId}/files/${file.id}/download`}>
                    Download
                  </a>
                  <button className="ghost-button" onClick={() => void deleteFile(file)} type="button">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {snapshot.files.length === 0 ? <p className="muted-copy">No files uploaded yet.</p> : null}
          </div>
          {error ? <p className="error-text">{error}</p> : null}
        </section>
      </div>
    </AppShell>
  );
}
