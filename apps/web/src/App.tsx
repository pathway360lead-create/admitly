import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
        <div className="min-h-screen bg-background">
          <h1 className="text-4xl font-bold text-center pt-20">
            Admitly Platform
          </h1>
          <p className="text-center text-muted-foreground mt-4">
            Nigeria Student Data Services - Coming Soon
          </p>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
