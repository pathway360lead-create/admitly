import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@admitly/ui';
import admitlyLogo from '@/assets/images/admitly-logo.png';

interface HeaderProps {
  isAuthenticated?: boolean;
  userEmail?: string;
  onLogin?: () => void;
  onLogout?: () => void;
  onSignUp?: () => void;
}

export const Header: FC<HeaderProps> = ({
  isAuthenticated = false,
  onLogin,
  onLogout,
  onSignUp,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Institutions', href: '/institutions' },
    { name: 'Programs', href: '/programs' },
    { name: 'Compare', href: '/compare' },
    { name: 'Deadlines', href: '/deadlines' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-20 md:h-24 items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-8">
          <Link to="/" className="flex items-center">
            <img src={admitlyLogo} alt="Admitly" className="h-32 sm:h-36 md:h-40" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <div className="flex gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                {onLogout && (
                  <Button variant="outline" size="sm" onClick={onLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                )}
              </>
            ) : (
              <>
                {onLogin && (
                  <Button variant="ghost" size="sm" onClick={onLogin}>
                    Login
                  </Button>
                )}
                {onSignUp && (
                  <Button variant="default" size="sm" onClick={onSignUp}>
                    Sign Up
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-3 border-t space-y-2">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  {onLogout && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {onLogin && (
                    <Button variant="ghost" className="w-full" onClick={onLogin}>
                      Login
                    </Button>
                  )}
                  {onSignUp && (
                    <Button variant="default" className="w-full" onClick={onSignUp}>
                      Sign Up
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

Header.displayName = 'Header';
