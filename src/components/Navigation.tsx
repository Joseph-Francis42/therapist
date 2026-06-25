'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('aura_username');
      setUsername(storedUser);
    };

    checkUser();

    // Listen to changes in localStorage
    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('aura_user_id');
    localStorage.removeItem('aura_username');
    localStorage.removeItem('aura_current_session_id');
    setUsername(null);
    router.push('/auth');
  };

  // Do not show links on the auth page to keep it clean and focused
  const isAuthPage = pathname === '/auth';

  return (
    <>
      <nav className="nav-container">
        <Link href="/" className="nav-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.4rem' }}>
            <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
            <path d="M12 2a10 10 0 0 1 10 10H12V2Z" style={{ opacity: 0.5 }} />
          </svg>
          Aura
        </Link>

        {!isAuthPage && (
          <div className="nav-links">
            <Link href="/chat" className={`nav-link ${pathname === '/chat' ? 'active' : ''}`}>
              Chat
            </Link>
            <Link href="/history" className={`nav-link ${pathname === '/history' ? 'active' : ''}`}>
              History
            </Link>
            <Link href="/emergency" className="btn-emergency">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Crisis Help
            </Link>
            
            {username && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {username}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px' }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
