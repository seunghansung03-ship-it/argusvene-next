import { useEffect, useState } from "react";
import type { Artifact, Decision, Task } from "@argusvene/contracts";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { api } from "../lib/api";

interface OutcomesState {
  artifacts: Artifact[];
  decisions: Decision[];
  tasks: Task[];
}

export function OutcomesPage() {
  const { meetingId = "" } = useParams();
  const [outcomes, setOutcomes] = useState<OutcomesState | null>(null);

  useEffect(() => {
    api.getOutcomes(meetingId).then(setOutcomes).catch(console.error);
  }, [meetingId]);

  return (
    <AppShell
      title="Meeting Outcomes"
      subtitle="Everything the room decided, created, and assigned."
      actions={<Link className="ghost-link" to={`/meeting/${meetingId}`}>Back to room</Link>}
    >
      {!outcomes ? (
        <section className="panel">Loading...</section>
      ) : (
        <div className="three-column-layout">
          <section className="panel">
            <div className="section-heading compact">
              <span className="eyebrow">Artifacts</span>
              <h2>{outcomes.artifacts.length}</h2>
            </div>
            <div className="stack-list">
              {outcomes.artifacts.map((artifact) => (
                <article className="list-card" key={artifact.id}>
                  <strong>{artifact.title}</strong>
                  <p>{artifact.summary}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-heading compact">
              <span className="eyebrow">Decisions</span>
              <h2>{outcomes.decisions.length}</h2>
            </div>
            <div className="stack-list">
              {outcomes.decisions.map((decision) => (
                <article className="list-card" key={decision.id}>
                  <strong>{decision.title}</strong>
                  <p>{decision.summary}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-heading compact">
              <span className="eyebrow">Tasks</span>
              <h2>{outcomes.tasks.length}</h2>
            </div>
            <div className="stack-list">
              {outcomes.tasks.map((task) => (
                <article className="list-card" key={task.id}>
                  <strong>{task.title}</strong>
                  <p>{task.ownerName}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
