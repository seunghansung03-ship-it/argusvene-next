import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { api } from "../lib/api";
export function OutcomesPage() {
    const { meetingId = "" } = useParams();
    const [outcomes, setOutcomes] = useState(null);
    useEffect(() => {
        api.getOutcomes(meetingId).then(setOutcomes).catch(console.error);
    }, [meetingId]);
    return (_jsx(AppShell, { title: "Meeting Outcomes", subtitle: "Everything the room decided, created, and assigned.", actions: _jsx(Link, { className: "ghost-link", to: `/meeting/${meetingId}`, children: "Back to room" }), children: !outcomes ? (_jsx("section", { className: "panel", children: "Loading..." })) : (_jsxs("div", { className: "three-column-layout", children: [_jsxs("section", { className: "panel", children: [_jsxs("div", { className: "section-heading compact", children: [_jsx("span", { className: "eyebrow", children: "Artifacts" }), _jsx("h2", { children: outcomes.artifacts.length })] }), _jsx("div", { className: "stack-list", children: outcomes.artifacts.map((artifact) => (_jsxs("article", { className: "list-card", children: [_jsx("strong", { children: artifact.title }), _jsx("p", { children: artifact.summary })] }, artifact.id))) })] }), _jsxs("section", { className: "panel", children: [_jsxs("div", { className: "section-heading compact", children: [_jsx("span", { className: "eyebrow", children: "Decisions" }), _jsx("h2", { children: outcomes.decisions.length })] }), _jsx("div", { className: "stack-list", children: outcomes.decisions.map((decision) => (_jsxs("article", { className: "list-card", children: [_jsx("strong", { children: decision.title }), _jsx("p", { children: decision.summary })] }, decision.id))) })] }), _jsxs("section", { className: "panel", children: [_jsxs("div", { className: "section-heading compact", children: [_jsx("span", { className: "eyebrow", children: "Tasks" }), _jsx("h2", { children: outcomes.tasks.length })] }), _jsx("div", { className: "stack-list", children: outcomes.tasks.map((task) => (_jsxs("article", { className: "list-card", children: [_jsx("strong", { children: task.title }), _jsx("p", { children: task.ownerName })] }, task.id))) })] })] })) }));
}
