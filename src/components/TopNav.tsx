import { useState } from 'react';
import { Moon, Sun, Globe, Menu, X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

export const TopNav = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('uyir_lang', newLang);
  };

  const navLinks = [
    { path: '/emergency', label: t('landing.emergencySOS'), isEmergency: true },
    { path: '/book', label: t('landing.bookAmbulance'), isEmergency: false },
    { path: '/partner', label: t('partner.title'), isEmergency: false },
    { path: '/dashboard', label: t('dashboard.title'), isEmergency: false },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary">
            <span className="text-lg font-bold text-primary-foreground">உ</span>
          </div>
          <span className="text-xl font-bold">Uyirkappan</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(link => (
            <Button
              key={link.path}
              asChild
              variant={link.isEmergency ? 'destructive' : isActive(link.path) ? 'secondary' : 'ghost'}
              size="sm"
              className={link.isEmergency ? 'gap-1' : ''}
            >
              <Link to={link.path}>
                {link.isEmergency && <AlertTriangle className="h-3.5 w-3.5" />}
                {link.label}
              </Link>
            </Button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Toggle language">
            <Globe className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xs font-semibold text-primary">{(user?.name || 'U')[0].toUpperCase()}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link to="/auth">{t('auth.signIn')}</Link>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map(link => (
              <Button
                key={link.path}
                asChild
                variant={link.isEmergency ? 'destructive' : isActive(link.path) ? 'secondary' : 'ghost'}
                className="justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to={link.path}>
                  {link.isEmergency && <AlertTriangle className="mr-2 h-4 w-4" />}
                  {link.label}
                </Link>
              </Button>
            ))}
            {isAuthenticated ? (
              <Button variant="ghost" className="justify-start" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                Logout ({user?.name})
              </Button>
            ) : (
              <Button asChild variant="ghost" className="justify-start" onClick={() => setMobileMenuOpen(false)}>
                <Link to="/auth">{t('auth.signIn')}</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
