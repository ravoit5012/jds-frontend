import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { YearProvider, useYear } from './contexts/YearContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExplorePage from './pages/ExplorePage';
import JdDetailPage from './pages/JdDetailPage';
import SavedPage from './pages/SavedPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import YearSelectPage from './pages/YearSelectPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0d0a05] flex items-center justify-center">
      <div className="text-amber-700 text-sm animate-pulse">Loading…</div>
    </div>
  );
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function YearGate({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const { selectedYear } = useYear();
  if (loading) return (
    <div className="min-h-screen bg-[#0d0a05] flex items-center justify-center">
      <div className="text-amber-700 text-sm animate-pulse">Loading…</div>
    </div>
  );
  if (!token) return <Navigate to="/login" replace />;
  if (!selectedYear) return <Navigate to="/select-year" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/select-year" element={<ProtectedRoute><YearSelectPage /></ProtectedRoute>} />
      <Route path="/" element={<YearGate><ExplorePage /></YearGate>} />
      <Route path="/jd/:id" element={<YearGate><JdDetailPage /></YearGate>} />
      <Route path="/saved" element={<YearGate><SavedPage /></YearGate>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <YearProvider>
          <AppRoutes />
        </YearProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
