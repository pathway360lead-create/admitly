import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InstitutionsListPage } from './pages/InstitutionsListPage';
import { InstitutionFormPage } from './pages/InstitutionFormPage';
import ProgramsListPage from './pages/ProgramsListPage';
import ProgramFormPage from './pages/ProgramFormPage';
import { CMSPage } from './pages/CMSPage';
import { DeadlinesListPage } from './pages/DeadlinesListPage';
import { DeadlineFormPage } from './pages/DeadlineFormPage';
import { BulkUploadPage } from './pages/BulkUploadPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected admin routes with layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/institutions" element={<InstitutionsListPage />} />
                    <Route path="/institutions/new" element={<InstitutionFormPage />} />
                    <Route path="/institutions/:id/edit" element={<InstitutionFormPage />} />
                    <Route path="/programs" element={<ProgramsListPage />} />
                    <Route path="/programs/new" element={<ProgramFormPage />} />
                    <Route path="/programs/:id/edit" element={<ProgramFormPage />} />
                    <Route path="/deadlines" element={<DeadlinesListPage />} />
                    <Route path="/deadlines/new" element={<DeadlineFormPage />} />
                    <Route path="/deadlines/:id/edit" element={<DeadlineFormPage />} />
                    <Route path="/cms" element={<CMSPage />} />
                    <Route path="/bulk-upload" element={<BulkUploadPage />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
