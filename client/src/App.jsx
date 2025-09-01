import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import WorkAreaPage from "./pages/WorkAreaPage";
import ProfilePage from "./pages/ProfilePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import RequireAuth from "./utils/requireAuth";
import AIChatPage from "./pages/AIChatPage";
import ScrollWatcher from "./components/scrolling";

export default function App() {
  return (
    <>
      <ScrollWatcher />
      <Routes>
        <Route path="/" element={<Navigate to="/work" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/work"
          element={
            <RequireAuth>
              <WorkAreaPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/subscription"
          element={
            <RequireAuth>
              <SubscriptionPage />
            </RequireAuth>
          }
        />
        <Route
          path="/ai"
          element={
            <RequireAuth>
              <AIChatPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<div className="container">Not Found</div>} />
      </Routes>
    </>
  );
}
