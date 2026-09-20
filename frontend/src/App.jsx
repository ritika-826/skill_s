import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RecruiterNavbar from "./components/recruiter/RecruiterNavbar";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QuizSetup from "./pages/QuizSetup";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import Profile from "./pages/Profile";
import ResultHistory from "./pages/ResultHistory";

// Recruiter Workspace Pages
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterStudents from "./pages/recruiter/RecruiterStudents";
import RecruiterStudentDetail from "./pages/recruiter/RecruiterStudentDetail";
import RecruiterAssessments from "./pages/recruiter/RecruiterAssessments";
import RecruiterAssessmentDetail from "./pages/recruiter/RecruiterAssessmentDetail";
import RecruiterAnalytics from "./pages/recruiter/RecruiterAnalytics";

// Protected Route for Candidate / Student Pages
function StudentRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const role = user.role ? user.role.toLowerCase() : "";
  if (role === "recruiter") {
    return <Navigate to="/recruiter/dashboard" replace />;
  }
  return children;
}

// Protected Route for Recruiter Pages
function RecruiterRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const role = user.role ? user.role.toLowerCase() : "";
  if (role !== "recruiter") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// General Protected Route (e.g. Profile)
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function MainLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();

  const isQuizPage = location.pathname === "/quiz";
  const isRecruiterPath = location.pathname.startsWith("/recruiter");
  const isRecruiter = user?.role?.toLowerCase() === "recruiter";

  const showRecruiterNavbar = isRecruiterPath || (isRecruiter && !isQuizPage);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!isQuizPage && (showRecruiterNavbar ? <RecruiterNavbar /> : <Navbar />)}
      <div style={{ flex: 1 }}>{children}</div>
      {!isQuizPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Public / Landing Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <StudentRoute>
                <Dashboard />
              </StudentRoute>
            }
          />
          <Route
            path="/quiz-setup"
            element={
              <StudentRoute>
                <QuizSetup />
              </StudentRoute>
            }
          />
          <Route
            path="/quiz/setup"
            element={
              <StudentRoute>
                <QuizSetup />
              </StudentRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <StudentRoute>
                <Quiz />
              </StudentRoute>
            }
          />
          <Route
            path="/result/:id"
            element={
              <StudentRoute>
                <Result />
              </StudentRoute>
            }
          />
          <Route
            path="/result"
            element={
              <StudentRoute>
                <Result />
              </StudentRoute>
            }
          />
          <Route
            path="/result-history"
            element={
              <StudentRoute>
                <ResultHistory />
              </StudentRoute>
            }
          />
          <Route
            path="/history"
            element={
              <StudentRoute>
                <ResultHistory />
              </StudentRoute>
            }
          />

          {/* Recruiter Workspace Protected Routes */}
          <Route
            path="/recruiter/dashboard"
            element={
              <RecruiterRoute>
                <RecruiterDashboard />
              </RecruiterRoute>
            }
          />
          <Route
            path="/recruiter/students"
            element={
              <RecruiterRoute>
                <RecruiterStudents />
              </RecruiterRoute>
            }
          />
          <Route
            path="/recruiter/students/:studentId"
            element={
              <RecruiterRoute>
                <RecruiterStudentDetail />
              </RecruiterRoute>
            }
          />
          <Route
            path="/recruiter/assessments"
            element={
              <RecruiterRoute>
                <RecruiterAssessments />
              </RecruiterRoute>
            }
          />
          <Route
            path="/recruiter/assessments/:assessmentId"
            element={
              <RecruiterRoute>
                <RecruiterAssessmentDetail />
              </RecruiterRoute>
            }
          />
          <Route
            path="/recruiter/analytics"
            element={
              <RecruiterRoute>
                <RecruiterAnalytics />
              </RecruiterRoute>
            }
          />

          {/* General User Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;