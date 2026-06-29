import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useYear } from '../contexts/YearContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { selectedYear } = useYear();
  const { theme, setTheme, actualTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/select-feature', label: 'Home' },
    { to: '/', label: 'Explorer' },
    { to: '/practice', label: 'Practice' },
    { to: '/saved', label: 'Saved' },
    { to: '/settings', label: 'Settings' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <nav className="bg-stone-900 border-b border-stone-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <span className="text-orange-500">📋</span>
            <span>JD Explorer</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-orange-600 text-white'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {selectedYear && (
              <button
                onClick={() => navigate('/select-year')}
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-orange-400 bg-stone-800 border border-stone-700 px-2.5 py-1 rounded-lg hover:bg-stone-700 hover:border-stone-600 transition-colors"
              >
                <span>{selectedYear}</span>
                <span className="text-stone-500">↕</span>
              </button>
            )}
            <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center w-8 h-7 rounded-md transition-all ${
                  theme === 'light' ? 'bg-stone-800 text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-300'
                }`}
                title="Light Mode"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center w-8 h-7 rounded-md transition-all ${
                  theme === 'dark' ? 'bg-stone-800 text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-300'
                }`}
                title="Dark Mode"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center w-8 h-7 rounded-md transition-all ${
                  theme === 'system' ? 'bg-stone-800 text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-300'
                }`}
                title="System Theme"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <span className="hidden md:block text-sm text-stone-500">{user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-stone-500 hover:text-stone-200 transition-colors"
            >
              Sign out
            </button>
            <button
              className="md:hidden text-stone-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-800 px-4 py-2 space-y-1 bg-stone-900">
            {selectedYear && (
              <button
                onClick={() => { navigate('/select-year'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-orange-400 font-semibold hover:bg-stone-800"
              >
                Year: {selectedYear} (change)
              </button>
            )}
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-100 hover:bg-stone-800"
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
