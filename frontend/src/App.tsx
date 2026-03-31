import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import BudgetPage from './pages/BudgetPage';
import CashFlowPage from './pages/CashFlowPage';
import ReportsPage from './pages/ReportsPage';
import DocumentsPage from './pages/DocumentsPage';
import BusinessCasePage from './pages/BusinessCasePage';
import AlertsPage from './pages/AlertsPage';
import CronogramaPage from './pages/CronogramaPage';
import { useAuthStore } from './stores/authStore';

export default function App() {
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/projects" replace />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId/dashboard" element={<DashboardPage />} />
        <Route path="projects/:projectId/budget" element={<BudgetPage />} />
        <Route path="projects/:projectId/cash-flow" element={<CashFlowPage />} />
        <Route path="projects/:projectId/reports" element={<ReportsPage />} />
        <Route path="projects/:projectId/documents" element={<DocumentsPage />} />
        <Route path="projects/:projectId/business-case" element={<BusinessCasePage />} />
        <Route path="projects/:projectId/alerts" element={<AlertsPage />} />
        <Route path="projects/:projectId/cronograma" element={<CronogramaPage />} />
      </Route>

      {/* Catch-all: redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
