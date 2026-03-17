import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { setStoredSessionUser } from "../lib/session";
export function LoginPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const user = await api.login({ name });
            setStoredSessionUser(user);
            navigate("/");
        }
        catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : "Login failed.");
        }
        finally {
            setIsSubmitting(false);
        }
    }
    return (_jsx("div", { className: "login-page", children: _jsxs("section", { className: "login-card", children: [_jsx("div", { className: "eyebrow", children: "Live meeting operating system" }), _jsx("h1", { children: "ArgusVene" }), _jsx("p", { className: "login-copy", children: "Enter with the name you want other people in the room to see. We will use this identity across workspace membership, transcript authorship, and meeting operations." }), _jsxs("form", { className: "login-form", onSubmit: handleSubmit, children: [_jsxs("label", { children: ["Display name", _jsx("input", { autoFocus: true, onChange: (event) => setName(event.target.value), placeholder: "Seongseunghan", value: name })] }), error ? _jsx("p", { className: "error-text", children: error }) : null, _jsx("button", { className: "primary-button", disabled: isSubmitting, type: "submit", children: isSubmitting ? "Entering room system..." : "Enter ArgusVene" })] })] }) }));
}
