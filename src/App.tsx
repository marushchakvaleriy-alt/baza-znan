import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar as Layout } from './components/Layout';
import { Handbook } from './pages/Handbook';
import { Login } from './pages/Login';
import { Tools } from './pages/Tools';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/tools" replace />} />
        <Route path="section/:sectionId" element={<Handbook />} />
        <Route path="tools" element={<Tools />} />
        <Route path="admin" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
