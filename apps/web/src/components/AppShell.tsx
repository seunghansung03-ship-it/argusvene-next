import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearStoredSessionUser, getStoredSessionUser } from "../lib/session";

interface AppShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  const user = getStoredSessionUser();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <Link className="brand-mark" to="/">
            <span className="brand-mark__glyph">A</span>
            <span className="brand-mark__text">ArgusVene</span>
          </Link>
          <div>
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </div>
        <div className="topbar__meta">
          {actions}
          {user ? (
            <button
              className="ghost-button"
              onClick={() => {
                clearStoredSessionUser();
                navigate("/login");
              }}
              type="button"
            >
              {user.name} sign out
            </button>
          ) : null}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
