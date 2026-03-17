import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { api } from "../lib/api";
import { getStoredSessionUser } from "../lib/session";
export function HomePage() {
    const user = getStoredSessionUser();
    const [workspaces, setWorkspaces] = useState([]);
    const [name, setName] = useState("");
    const [goal, setGoal] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        if (!user) {
            return;
        }
        api.listWorkspaces(user.id).then(setWorkspaces).catch((fetchError) => {
            setError(fetchError instanceof Error ? fetchError.message : "Failed to load workspaces.");
        });
    }, [user]);
    if (!user) {
        return null;
    }
    const currentUser = user;
    async function handleCreateWorkspace(event) {
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
        }
        catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : "Workspace creation failed.");
        }
        finally {
            setIsSubmitting(false);
        }
    }
    return (_jsx(AppShell, { title: "Organization Home", subtitle: "Open a workspace, prepare the room, then move straight into live operations.", children: _jsxs("div", { className: "two-column-layout", children: [_jsxs("section", { className: "panel", children: [_jsxs("div", { className: "section-heading", children: [_jsx("span", { className: "eyebrow", children: "Create workspace" }), _jsx("h2", { children: "Start from a real problem, not a blank room." })] }), _jsxs("form", { className: "stack-form", onSubmit: handleCreateWorkspace, children: [_jsxs("label", { children: ["Workspace name", _jsx("input", { onChange: (event) => setName(event.target.value), value: name })] }), _jsxs("label", { children: ["Mission", _jsx("textarea", { onChange: (event) => setGoal(event.target.value), placeholder: "Launch a live agent meeting room that can turn discussion into concrete outputs.", rows: 4, value: goal })] }), error ? _jsx("p", { className: "error-text", children: error }) : null, _jsx("button", { className: "primary-button", disabled: isSubmitting, type: "submit", children: isSubmitting ? "Opening workspace..." : "Create workspace" })] })] }), _jsxs("section", { className: "panel", children: [_jsxs("div", { className: "section-heading", children: [_jsx("span", { className: "eyebrow", children: "Your workspaces" }), _jsx("h2", { children: "Keep the list short and actionable." })] }), _jsx("div", { className: "workspace-list", children: workspaces.length === 0 ? (_jsx("p", { className: "muted-copy", children: "No workspaces yet. Create one and we will use it as the meeting source of truth." })) : (workspaces.map((workspace) => (_jsxs(Link, { className: "workspace-card", to: `/workspace/${workspace.id}`, children: [_jsxs("div", { children: [_jsx("strong", { children: workspace.name }), _jsx("p", { children: workspace.goal || "No mission set yet." })] }), _jsx("span", { className: "pill", children: "Open" })] }, workspace.id)))) })] })] }) }));
}
