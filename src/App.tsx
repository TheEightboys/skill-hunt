import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetail from "./pages/ProjectDetail";
import SubmitProject from "./pages/SubmitProject";
import ReviewPage from "./pages/ReviewPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ResultsPage from "./pages/ResultsPage";
import AdminPage from "./pages/AdminPage";
import FacultyDashboard from "./pages/FacultyDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/submit" element={<SubmitProject />} />
      <Route path="/edit/:id" element={<SubmitProject />} />
      <Route path="/review/:projectId" element={<ReviewPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/faculty" element={<FacultyDashboard />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
