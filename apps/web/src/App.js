import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { MeetingPage } from "./pages/MeetingPage";
import { OutcomesPage } from "./pages/OutcomesPage";
import { getStoredSessionUser } from "./lib/session";
export function App() {
    const user = getStoredSessionUser();
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/", element: user ? _jsx(HomePage, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/workspace/:workspaceId", element: user ? _jsx(WorkspacePage, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/meeting/:meetingId", element: user ? _jsx(MeetingPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/meeting/:meetingId/outcomes", element: user ? _jsx(OutcomesPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) })] }));
}
