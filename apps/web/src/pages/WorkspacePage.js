import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { api } from "../lib/api";
export function WorkspacePage() {
    const { workspaceId = "" } = useParams();
    const navigate = useNavigate();
    const [snapshot, setSnapshot] = useState(null);
    const [inviteName, setInviteName] = useState("");
    const [meetingTitle, setMeetingTitle] = useState("");
    const [meetingGoal, setMeetingGoal] = useState("");
    const [error, setError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    async function loadWorkspace() {
        setSnapshot(await api.getWorkspace(workspaceId));
    }
    useEffect(() => {
        loadWorkspace().catch((fetchError) => {
            setError(fetchError instanceof Error ? fetchError.message : "Workspace load failed.");
        });
    }, [workspaceId]);
    async function handleInvite(event) {
        event.preventDefault();
        await api.addWorkspaceMember(workspaceId, { name: inviteName, role: "member" });
        setInviteName("");
        await loadWorkspace();
    }
    async function handleUpload(file) {
        if (!file) {
            return;
        }
        setIsUploading(true);
        try {
            await api.uploadWorkspaceFile(workspaceId, file);
            await loadWorkspace();
        }
        finally {
            setIsUploading(false);
        }
    }
    async function handleCreateMeeting(event) {
        event.preventDefault();
        const meeting = await api.createMeeting(workspaceId, {
            title: meetingTitle,
            goal: meetingGoal
        });
        navigate(`/meeting/${meeting.id}`);
    }
    async function deleteFile(file) {
        await api.removeWorkspaceFile(workspaceId, file.id);
        await loadWorkspace();
    }
    if (!snapshot) {
        return (_jsx(AppShell, { title: "Workspace Prep", subtitle: "Loading workspace...", children: _jsx("section", { className: "panel", children: "Loading..." }) }));
    }
    return (_jsx(AppShell, { title: snapshot.workspace.name, subtitle: snapshot.workspace.goal || "Set a clear mission, then open the room.", actions: _jsx(Link, { className: "ghost-link", to: "/", children: "Back home" }), children: _jsxs("div", { className: "workspace-grid", children: [_jsxs("section", { className: "panel", children: [_jsxs("div", { className: "section-heading", children: [_jsx("span", { className: "eyebrow", children: "Open room" }), _jsx("h2", { children: "Move quickly from prep into live operations." })] }), _jsxs("form", { className: "stack-form", onSubmit: handleCreateMeeting, children: [_jsxs("label", { children: ["Meeting title", _jsx("input", { onChange: (event) => setMeetingTitle(event.target.value), value: meetingTitle })] }), _jsxs("label", { children: ["Meeting goal", _jsx("textarea", { onChange: (event) => setMeetingGoal(event.target.value), rows: 4, value: meetingGoal })] }), _jsx("button", { className: "primary-button", type: "submit", children: "Open live room" })] }), _jsxs("div", { className: "section-heading compact", children: [_jsx("span", { className: "eyebrow", children: "Meetings" }), _jsx("h3", { children: "Recent rooms" })] }), _jsxs("div", { className: "stack-list", children: [snapshot.meetings.map((meeting) => (_jsxs(Link, { className: "list-row", to: `/meeting/${meeting.id}`, children: [_jsxs("div", { children: [_jsx("strong", { children: meeting.title }), _jsx("p", { children: meeting.goal || "No room goal recorded." })] }), _jsx("span", { className: "pill", children: meeting.status })] }, meeting.id))), snapshot.meetings.length === 0 ? _jsx("p", { className: "muted-copy", children: "No rooms yet." }) : null] })] }), _jsxs("section", { className: "panel", children: [_jsxs("div", { className: "section-heading", children: [_jsx("span", { className: "eyebrow", children: "People" }), _jsx("h2", { children: "Invite the humans who should be in the room." })] }), _jsxs("form", { className: "inline-form", onSubmit: handleInvite, children: [_jsx("input", { onChange: (event) => setInviteName(event.target.value), placeholder: "New member name", value: inviteName }), _jsx("button", { className: "secondary-button", type: "submit", children: "Invite" })] }), _jsx("div", { className: "stack-list", children: snapshot.members.map((member) => (_jsxs("div", { className: "list-row", children: [_jsxs("div", { children: [_jsx("strong", { children: member.displayName }), _jsx("p", { children: member.role })] }), _jsx("button", { className: "ghost-button", onClick: () => void api.removeWorkspaceMember(workspaceId, member.id).then(loadWorkspace), type: "button", children: "Remove" })] }, member.id))) })] }), _jsxs("section", { className: "panel", children: [_jsxs("div", { className: "section-heading", children: [_jsx("span", { className: "eyebrow", children: "Context files" }), _jsx("h2", { children: "Upload source material the room should reference." })] }), _jsxs("label", { className: "file-picker", children: [_jsx("input", { onChange: (event) => void handleUpload(event.target.files?.[0]), type: "file" }), _jsx("span", { children: isUploading ? "Uploading..." : "Choose file" })] }), _jsxs("div", { className: "stack-list", children: [snapshot.files.map((file) => (_jsxs("div", { className: "list-row", children: [_jsxs("div", { children: [_jsx("strong", { children: file.name }), _jsxs("p", { children: [Math.round(file.size / 1024), " KB"] })] }), _jsxs("div", { className: "row-actions", children: [_jsx("a", { className: "ghost-link", href: `/api/workspaces/${workspaceId}/files/${file.id}/download`, children: "Download" }), _jsx("button", { className: "ghost-button", onClick: () => void deleteFile(file), type: "button", children: "Delete" })] })] }, file.id))), snapshot.files.length === 0 ? _jsx("p", { className: "muted-copy", children: "No files uploaded yet." }) : null] }), error ? _jsx("p", { className: "error-text", children: error }) : null] })] }) }));
}
