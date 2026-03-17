import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
import { clearStoredSessionUser, getStoredSessionUser } from "../lib/session";
export function AppShell({ title, subtitle, actions, children }) {
    const user = getStoredSessionUser();
    const navigate = useNavigate();
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("header", { className: "topbar", children: [_jsxs("div", { className: "brand-block", children: [_jsxs(Link, { className: "brand-mark", to: "/", children: [_jsx("span", { className: "brand-mark__glyph", children: "A" }), _jsx("span", { className: "brand-mark__text", children: "ArgusVene" })] }), _jsxs("div", { children: [_jsx("h1", { children: title }), subtitle ? _jsx("p", { children: subtitle }) : null] })] }), _jsxs("div", { className: "topbar__meta", children: [actions, user ? (_jsxs("button", { className: "ghost-button", onClick: () => {
                                    clearStoredSessionUser();
                                    navigate("/login");
                                }, type: "button", children: [user.name, " sign out"] })) : null] })] }), _jsx("main", { children: children })] }));
}
