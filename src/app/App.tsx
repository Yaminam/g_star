import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { EmailStep }       from './pages/auth/EmailStep';
import { OtpStep }         from './pages/auth/OtpStep';
import { RoleConfirmStep } from './pages/auth/RoleConfirmStep';
import { DashboardLayout } from './layouts/DashboardLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loggedInUser } = useApp();
  if (!loggedInUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/"        element={<Navigate to="/login" replace />} />
        <Route path="/login"   element={<EmailStep />} />
        <Route path="/otp"     element={<OtpStep />} />
        <Route path="/welcome" element={<RoleConfirmStep />} />
        <Route path="/app/*"   element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        } />
        <Route path="*"        element={<Navigate to="/login" replace />} />
      </Routes>
    </AppProvider>
  );
}
