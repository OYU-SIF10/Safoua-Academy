import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleBasedRoute from './components/RoleBasedRoute';
import ChatWidget from './components/ChatWidget';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Catalogue from './pages/Catalogue';
import CourseDetail from './pages/CourseDetail';
import LessonPlayer from './pages/LessonPlayer';
import Progression from './pages/Progression';
import Certificats from './pages/Certificats';
import EnseignantDashboard from './pages/EnseignantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Publiques ──────────────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/cours/:id" element={<CourseDetail />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/cancel" element={<PaymentCancel />} />

          {/* ── Étudiant ───────────────────────────────────────── */}
          <Route
            path="/lecon/:courseId/:lessonId"
            element={
              <RoleBasedRoute allowedRoles={['etudiant']}>
                <LessonPlayer />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/progression"
            element={
              <RoleBasedRoute allowedRoles={['etudiant']}>
                <Progression />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/certificats"
            element={
              <RoleBasedRoute allowedRoles={['etudiant']}>
                <Certificats />
              </RoleBasedRoute>
            }
          />

          {/* ── Enseignant ─────────────────────────────────────── */}
          <Route
            path="/enseignant"
            element={
              <RoleBasedRoute allowedRoles={['enseignant']}>
                <EnseignantDashboard />
              </RoleBasedRoute>
            }
          />

          {/* ── Admin ──────────────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleBasedRoute>
            }
          />

          {/* ── Fallback ───────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;