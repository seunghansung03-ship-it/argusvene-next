import { FormEvent, useEffect, useState } from "react";
import type { Workspace } from "@argusvene/contracts";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { api } from "../lib/api";
import { getStoredSessionUser } from "../lib/session";

export function HomePage() {
  const user = getStoredSessionUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    api.listWorkspaces(user.id).then(setWorkspaces).catch((fetchError: unknown) => {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load workspaces.");
    });
  }, [user]);

  if (!user) {
    return null;
  }

  const currentUser = user;

  async function handleCreateWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await api.createWorkspace({
        ownerUserId: currentUser.id,
        name,
        goal
      });
      setName("");
      setGoal("");
      setWorkspaces(await api.listWorkspaces(currentUser.id));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Workspace creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell title="Organization Home" subtitle="Open a workspace, prepare the room, then move straight into live operations.">
      <div className="two-column-layout">
        <section className="panel">
          <div className="section-heading">
            <span className="eyebrow">Create workspace</span>
            <h2>Start from a real problem, not a blank room.</h2>
          </div>
          <form className="stack-form" onSubmit={handleCreateWorkspace}>
            <label>
              Workspace name
              <input onChange={(event) => setName(event.target.value)} value={name} />
            </label>
            <label>
              Mission
              <textarea
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Launch a live agent meeting room that can turn discussion into concrete outputs."
                rows={4}
                value={goal}
              />
            </label>
            {error ? <p className="error-text">{error}</p> : null}
            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Opening workspace..." : "Create workspace"}
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="section-heading">
            <span className="eyebrow">Your workspaces</span>
            <h2>Keep the list short and actionable.</h2>
          </div>
          <div className="workspace-list">
            {workspaces.length === 0 ? (
              <p className="muted-copy">No workspaces yet. Create one and we will use it as the meeting source of truth.</p>
            ) : (
              workspaces.map((workspace) => (
                <Link className="workspace-card" key={workspace.id} to={`/workspace/${workspace.id}`}>
                  <div>
                    <strong>{workspace.name}</strong>
                    <p>{workspace.goal || "No mission set yet."}</p>
                  </div>
                  <span className="pill">Open</span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
