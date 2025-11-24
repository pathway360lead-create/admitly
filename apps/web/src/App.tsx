import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { InstitutionDetailPage } from './pages/InstitutionDetailPage';
import { ProgramDetailPage } from './pages/ProgramDetailPage';
import { SearchPage } from './pages/SearchPage';
import { ComparePage } from './pages/ComparePage';
import { DeadlinesPage } from './pages/DeadlinesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';

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
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public routes without layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Routes with layout */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/institutions" element={<InstitutionsPage />} />
                  <Route path="/institutions/:slug" element={<InstitutionDetailPage />} />
                  <Route path="/programs" element={<ProgramsPage />} />
                  <Route path="/programs/:slug" element={<ProgramDetailPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/deadlines" element={<DeadlinesPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
