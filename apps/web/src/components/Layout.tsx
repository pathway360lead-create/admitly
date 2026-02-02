import { FC, ReactNode, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/organisms/Header';
import { Footer } from '@/components/organisms/Footer';
import { ComparisonTray } from './organisms/ComparisonTray';
import { Toaster } from './ui/toaster';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const isLoggingOut = useRef(false);

  const handleLogout = async () => {
    if (isLoggingOut.current) {
      console.log('[Layout] Logout already in progress, ignoring');
      return;
    }

    isLoggingOut.current = true;
    console.log('[Layout] handleLogout called');

    try {
      console.log('[Layout] Calling logout...');
      await logout();
      console.log('[Layout] Logout successful, navigating home...');
      navigate('/');
    } catch (error) {
      console.error('[Layout] Logout error:', error);
      navigate('/');
    } finally {
      // Reset after a short delay
      setTimeout(() => {
        isLoggingOut.current = false;
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        isAuthenticated={isAuthenticated}
        userEmail={user?.email}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onLogout={handleLogout}
      />
      <main className="flex-1">{children}</main>
      <Footer />
      {location.pathname !== '/compare' && <ComparisonTray />}
      <Toaster />
    </div>
  );
};

Layout.displayName = 'Layout';
