import { FC, useState } from 'react';
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
      <nav className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-8">
          <a href="/" className="flex items-center">
            <img src={admitlyLogo} alt="Admitly" className="h-12 sm:h-14 md:h-16 lg:h-18" />
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <div className="flex gap-6">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </a>
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
              <a
                key={item.name}
                href={item.href}
                className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground"
              >
                {item.name}
              </a>
            ))}
            <div className="pt-3 border-t space-y-2">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" className="w-full" asChild>
                    <a href="/dashboard">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </a>
                  </Button>
                  {onLogout && (
                    <Button variant="outline" className="w-full" onClick={onLogout}>
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
