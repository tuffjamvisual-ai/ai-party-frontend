'use client';

import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/policies', label: 'Policies' },
  { href: '/departments', label: 'Departments' },
  { href: '/our-team', label: 'Our Team' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/polls', label: 'Polls' },
  { href: '/about', label: 'About' },
];

export default function Navigation() {
  const { user, logout } = useAuth();

  if (typeof window !== 'undefined' && user) {
    const lastActive = localStorage.getItem('lastActive')
    const now = Date.now()
    if (lastActive && now - parseInt(lastActive) > 2 * 60 * 60 * 1000) {
      logout()
    }
    localStorage.setItem('lastActive', now.toString())
  }
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const openLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <>
      <nav className="bg-[#1a1a1a] border-b border-[#2e2e2e]/50 relative mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex-shrink-0 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-[#1a1a1a] flex items-center justify-center font-black text-lg tracking-tight">AI</div>
              <div>
                <div className="text-sm font-bold text-white tracking-widest leading-none">THE AI PARTY</div>
                <div className="text-[10px] text-[#C9C9C9] tracking-wider mt-1">Every policy decided by you</div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm transition-colors ${isActive(item.href) ? 'text-white font-semibold' : 'text-[#C9C9C9] hover:text-white'}`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="ml-3 pl-3 border-l border-[#2e2e2e] flex items-center">
                <a
                  href="mailto:info@theaiparty.uk"
                  className="px-3 py-1.5 text-[#C9C9C9] hover:text-white text-sm"
                >
                  Contact
                </a>
                {user ? (
                  <>
                    <span className="text-white text-sm truncate max-w-[150px] mr-2">{user.email}</span>
                    <button onClick={logout} className="px-3 py-1.5 text-[#C9C9C9] hover:text-white text-sm">
                      Logout
                    </button>
                  </>
                ) : (
                  <button onClick={openLogin} className="px-3 py-1.5 text-[#C9C9C9] hover:text-white text-sm">
                    Login
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -mr-2 text-white hover:text-white flex-shrink-0"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-[#2e2e2e]/50 mt-2">
              <div className="flex flex-col py-2">
                {NAV_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 text-sm ${isActive(item.href) ? 'text-white font-semibold' : 'text-[#C9C9C9]'}`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-[#2e2e2e]/50 mt-2 pt-2">
                  <a
                    href="mailto:info@theaiparty.uk"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-3 py-2 text-[#C9C9C9] text-sm"
                  >
                    Contact
                  </a>
                  {user ? (
                    <>
                      <div className="px-3 py-2 text-white text-sm truncate">{user.email}</div>
                      <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-[#C9C9C9] text-sm">
                        Logout
                      </button>
                    </>
                  ) : (
                    <button onClick={openLogin} className="w-full text-left px-3 py-2 text-[#C9C9C9] text-sm">
                      Login
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
}
