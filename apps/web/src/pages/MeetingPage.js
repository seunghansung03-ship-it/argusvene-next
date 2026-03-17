import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { api } from "../lib/api";
import { getStoredSessionUser } from "../lib/session";
export function MeetingPage() {
    const { meetingId = "" } = useParams();
    const navigate = useNavigate();
    const sessionUser = getStoredSessionUser();
    const [room, setRoom] = useState(null);
    const [message, setMessage] = useState("");
    const [participantName, setParticipantName] = useState("");
    const [participantRole, setParticipantRole] = useState("");
    const [artifactTitle, setArtifactTitle] = useState("");
    const [artifactSummary, setArtifactSummary] = useState("");
    const [artifactBody, setArtifactBody] = useState("");
    const [artifactKind, setArtifactKind] = useState("spec");
    const [decisionTitle, setDecisionTitle] = useState("");
    const [decisionSummary, setDecisionSummary] = useState("");
    const [taskTitle, setTaskTitle] = useState("");
    const [taskOwner, setTaskOwner] = useState("");
    const [error, setError] = useState(null);
    async function loadRoom() {
        setRoom(await api.getRoom(meetingId));
    }
    useEffect(() => {
        loadRoom().catch((fetchError) => {
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
        return (room.participants.find((participant) => participant.kind === "human" && participant.linkedUserId === sessionUser.id) ?? null);
    }, [room, sessionUser]);
    async function handleSendTurn(event) {
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
    async function handleAddParticipant(event) {
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
    async function handleAddArtifact(event) {
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
    async function handleAddDecision(event) {
        event.preventDefault();
        await api.createDecision(meetingId, {
            title: decisionTitle,
            summary: decisionSummary
        });
        setDecisionTitle("");
        setDecisionSummary("");
        await loadRoom();
    }
    async function handleAddTask(event) {
        event.preventDefault();
        await api.createTask(meetingId, {
            title: taskTitle,
            ownerName: taskOwner
        });
        setTaskTitle("");
        setTaskOwner("");
        await loadRoom();
    }
    async function toggleParticipant(participantId, active) {
        await api.updateParticipant(meetingId, participantId, active);
        await loadRoom();
    }
    async function removeParticipant(participantId) {
        await api.removeParticipant(meetingId, participantId);
        await loadRoom();
    }
    async function handleEndMeeting() {
        await api.endMeeting(meetingId);
        navigate(`/meeting/${meetingId}/outcomes`);
    }
    if (!room) {
        return (_jsx(AppShell, { title: "Meeting Room", subtitle: "Loading live room...", children: _jsx("section", { className: "panel", children: "Loading..." }) }));
    }
    return (_jsx(AppShell, { title: room.meeting.title, subtitle: room.meeting.goal || "No meeting goal set yet.", actions: _jsxs("div", { className: "row-actions", children: [_jsx(Link, { className: "ghost-link", to: `/workspace/${room.workspace.id}`, children: "Workspace" }), _jsx("button", { className: "secondary-button", onClick: () => void handleEndMeeting(), type: "button", children: "End meeting" })] }), children: _jsxs("div", { className: "room-layout", children: [_jsxs("section", { className: "room-panel room-panel--transcript", children: [_jsxs("div", { className: "section-heading compact", children: [_jsx("span", { className: "eyebrow", children: "Transcript" }), _jsx("h2", { children: "Human conversation and direct instructions" })] }), _jsx("div", { className: "message-feed", children: room.messages.map((entry) => (_jsxs("article", { className: `message-bubble message-bubble--${entry.authorKind}`, children: [_jsxs("header", { children: [_jsx("strong", { children: entry.authorName }), _jsx("span", { children: new Date(entry.createdAt).toLocaleTimeString() })] }), _jsx("p", { children: entry.content })] }, entry.id))) }), _jsxs("form", { className: "stack-form", onSubmit: handleSendTurn, children: [_jsxs("label", { children: ["Send to the room", _jsx("textarea", { onChange: (event) => setMessage(event.target.value), placeholder: "State the next thing the room should work on.", rows: 4, value: message })] }), error ? _jsx("p", { className: "error-text", children: error }) : null, _jsx("button", { className: "primary-button", type: "submit", children: "Send turn" })] })] }), _jsxs("section", { className: "room-panel room-panel--canvas", children: [_jsxs("div", { className: "section-heading compact", children: [_jsx("span", { className: "eyebrow", children: "Live canvas" }), _jsx("h2", { children: "Capture what the room is making, deciding, and assigning." })] }), _jsxs("div", { className: "canvas-stack", children: [_jsxs("form", { className: "stack-form", onSubmit: handleAddArtifact, children: [_jsx("h3", { children: "Create artifact" }), _jsx("input", { onChange: (event) => setArtifactTitle(event.target.value), placeholder: "Artifact title", value: artifactTitle }), _jsx("input", { onChange: (event) => setArtifactSummary(event.target.value), placeholder: "What is this artifact for?", value: artifactSummary }), _jsxs("select", { onChange: (event) => setArtifactKind(event.target.value), value: artifactKind, children: [_jsx("option", { value: "spec", children: "Spec" }), _jsx("option", { value: "prototype", children: "Prototype" }), _jsx("option", { value: "research", children: "Research" }), _jsx("option", { value: "note", children: "Note" })] }), _jsx("textarea", { onChange: (event) => setArtifactBody(event.target.value), placeholder: "Artifact body", rows: 5, value: artifactBody }), _jsx("button", { className: "secondary-button", type: "submit", children: "Save artifact" })] }), _jsxs("div", { className: "stack-list", children: [room.artifacts.map((artifact) => (_jsxs("article", { className: "list-card", children: [_jsxs("header", { children: [_jsx("strong", { children: artifact.title }), _jsx("span", { className: "pill", children: artifact.kind })] }), _jsx("p", { children: artifact.summary }), _jsx("pre", { children: artifact.body })] }, artifact.id))), room.artifacts.length === 0 ? _jsx("p", { className: "muted-copy", children: "No artifacts yet." }) : null] }), _jsxs("div", { className: "outcome-row", children: [_jsxs("form", { className: "stack-form", onSubmit: handleAddDecision, children: [_jsx("h3", { children: "Lock decision" }), _jsx("input", { onChange: (event) => setDecisionTitle(event.target.value), placeholder: "Decision title", value: decisionTitle }), _jsx("textarea", { onChange: (event) => setDecisionSummary(event.target.value), placeholder: "What is the actual call?", rows: 3, value: decisionSummary }), _jsx("button", { className: "secondary-button", type: "submit", children: "Save decision" })] }), _jsxs("form", { className: "stack-form", onSubmit: handleAddTask, children: [_jsx("h3", { children: "Open task" }), _jsx("input", { onChange: (event) => setTaskTitle(event.target.value), placeholder: "Task title", value: taskTitle }), _jsx("input", { onChange: (event) => setTaskOwner(event.target.value), placeholder: "Owner", value: taskOwner }), _jsx("button", { className: "secondary-button", type: "submit", children: "Save task" })] })] })] })] }), _jsxs("section", { className: "room-panel room-panel--ops", children: [_jsxs("div", { className: "section-heading compact", children: [_jsx("span", { className: "eyebrow", children: "Operators" }), _jsx("h2", { children: "Invite, remove, and control who is active in the room." })] }), _jsxs("form", { className: "stack-form", onSubmit: handleAddParticipant, children: [_jsx("input", { onChange: (event) => setParticipantName(event.target.value), placeholder: "Participant name", value: participantName }), _jsx("input", { onChange: (event) => setParticipantRole(event.target.value), placeholder: "Role", value: participantRole }), _jsx("button", { className: "secondary-button", type: "submit", children: "Add human" })] }), _jsx("div", { className: "stack-list", children: room.participants.map((participant) => (_jsxs("article", { className: "list-card", children: [_jsxs("header", { children: [_jsx("strong", { children: participant.name }), _jsx("span", { className: "pill", children: participant.kind })] }), _jsx("p", { children: participant.role }), _jsxs("div", { className: "row-actions", children: [_jsx("button", { className: "ghost-button", onClick: () => void toggleParticipant(participant.id, !participant.active), type: "button", children: participant.active ? "Deactivate" : "Activate" }), _jsx("button", { className: "ghost-button", onClick: () => void removeParticipant(participant.id), type: "button", children: "Remove" })] })] }, participant.id))) }), _jsxs("div", { className: "section-heading compact", children: [_jsx("span", { className: "eyebrow", children: "Context files" }), _jsx("h3", { children: "Files available to this room" })] }), _jsxs("div", { className: "stack-list", children: [room.files.map((file) => (_jsx("a", { className: "list-row", href: `/api/workspaces/${room.workspace.id}/files/${file.id}/download`, children: _jsxs("div", { children: [_jsx("strong", { children: file.name }), _jsxs("p", { children: [Math.round(file.size / 1024), " KB"] })] }) }, file.id))), room.files.length === 0 ? _jsx("p", { className: "muted-copy", children: "No context files attached." }) : null] })] })] }) }));
}
