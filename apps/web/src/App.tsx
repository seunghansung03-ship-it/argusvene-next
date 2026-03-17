import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { MeetingPage } from "./pages/MeetingPage";
import { OutcomesPage } from "./pages/OutcomesPage";
import { getStoredSessionUser } from "./lib/session";

export function App() {
  const user = getStoredSessionUser();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} />
      <Route path="/workspace/:workspaceId" element={user ? <WorkspacePage /> : <Navigate to="/login" replace />} />
      <Route path="/meeting/:meetingId" element={user ? <MeetingPage /> : <Navigate to="/login" replace />} />
      <Route
        path="/meeting/:meetingId/outcomes"
        element={user ? <OutcomesPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
