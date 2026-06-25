'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Disclaimers from '../../components/Disclaimers';
import { verifyUser, registerUser, createUser, createSession, listSessions } from '@/lib/db';

type AuthTab = 'login' | 'register' | 'anonymous';

export default function AuthenticationPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [anonName, setAnonName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [showDisclaimerOverlay, setShowDisclaimerOverlay] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUserId = localStorage.getItem('aura_user_id');
    const storedSession = localStorage.getItem('aura_current_session_id');
    if (storedUserId && storedSession) {
      router.push(`/chat?sessionId=${storedSession}`);
      return;
    }

    const accepted = localStorage.getItem('aura_disclaimer_accepted');
    if (accepted) {
      setTermsAccepted(true);
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!termsAccepted) {
      setShowDisclaimerOverlay(true);
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'anonymous') {
        const nameToUse = anonName.trim() || 'Anonymous';
        const user = await createUser(nameToUse);
        const session = await createSession(user.id);
        
        localStorage.setItem('aura_user_id', user.id);
        localStorage.setItem('aura_username', user.username);
        localStorage.setItem('aura_current_session_id', session.id);
        
        setSuccessMsg('Entering guest session...');
        setTimeout(() => router.push(`/chat?sessionId=${session.id}`), 800);
      } else {
        if (!username.trim() || !password.trim()) {
          throw new Error('Please fill in all fields');
        }

        const cleanUsername = username.trim();

        if (activeTab === 'register') {
          try {
            const user = await registerUser(cleanUsername, password.trim());
            const session = await createSession(user.id);
            
            localStorage.setItem('aura_user_id', user.id);
            localStorage.setItem('aura_username', user.username);
            localStorage.setItem('aura_current_session_id', session.id);
            
            setSuccessMsg('Registration successful');
            setTimeout(() => router.push(`/chat?sessionId=${session.id}`), 800);
          } catch (err: any) {
            throw new Error(err.message || 'Registration failed');
          }
        } else {
          const user = await verifyUser(cleanUsername, password.trim());
          if (!user) {
            throw new Error('Invalid username or password');
          }
          
          const sessions = await listSessions(user.id);
          const activeSession = sessions.find(s => s.endTime === null);
          let session = activeSession;
          if (!session) {
            session = await createSession(user.id);
          }

          localStorage.setItem('aura_user_id', user.id);
          localStorage.setItem('aura_username', user.username);
          localStorage.setItem('aura_current_session_id', session.id);

          setSuccessMsg('Login successful');
          setTimeout(() => router.push(`/chat?sessionId=${session.id}`), 800);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisclaimerAccepted = () => {
    localStorage.setItem('aura_disclaimer_accepted', 'true');
    setTermsAccepted(true);
    setShowDisclaimerOverlay(false);
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: 'auto',
      padding: '2.5rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 75px)',
      width: '100%'
    }}>
      
      {/* Fallback disclaimer modal if checkbox clicked but not accepted yet */}
      {showDisclaimerOverlay && (
        <Disclaimers onAccept={handleDisclaimerAccepted} />
      )}

      <div className="glass-panel" style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
        border: '1px solid var(--glass-border)'
      }}>
        <style jsx>{`
          .auth-grid {
            display: grid;
            grid-template-columns: 1fr;
          }
          @media (min-width: 768px) {
            .auth-grid {
              grid-template-columns: 1fr 1.1fr !important;
            }
          }
        `}</style>

        <div className="auth-grid" style={{ display: 'grid' }}>
          
          {/* LEFT SIDE: Calming Info Panel */}
          <div style={{
            backgroundColor: 'var(--accent-teal)',
            color: 'white',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '2.5rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
                  <path d="M12 2a10 10 0 0 1 10 10H12V2Z" style={{ opacity: 0.5 }} />
                </svg>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>AURA</span>
              </div>

              <blockquote style={{
                fontSize: '1.15rem',
                lineHeight: '1.6',
                fontStyle: 'italic',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '400',
                borderLeft: '2px solid rgba(255, 255, 255, 0.3)',
                paddingLeft: '1rem',
                margin: '1.5rem 0'
              }}>
                "Mental health is not a destination, but a continuous process. It is about how you navigate, reflecting with kindness and patience."
              </blockquote>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span>🔒</span>
                <div>
                  <strong>Secure Reflections</strong>
                  <p style={{ opacity: 0.85, marginTop: '0.15rem' }}>Your thoughts are private, securely linked to your account or stored locally.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.75rem' }}>
                <span>🧘</span>
                <div>
                  <strong>Active Grounding</strong>
                  <p style={{ opacity: 0.85, marginTop: '0.15rem' }}>Utilize interactive deep-breathing guidelines directly inside your chat workspace.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.75rem' }}>
                <span>📋</span>
                <div>
                  <strong>Reflection Summaries</strong>
                  <p style={{ opacity: 0.85, marginTop: '0.15rem' }}>Understand emotional trajectories and get tailored coping steps upon closing sessions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Authentication Card */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '1.75rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Welcome to Aura Space
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Please select your access preference to enter.
              </p>
            </div>

            {/* TAB SELECTOR */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--glass-border)',
              gap: '1.25rem',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              <button 
                onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  paddingBottom: '0.6rem',
                  cursor: 'pointer',
                  color: activeTab === 'login' ? 'var(--accent-teal)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'login' ? '2px solid var(--accent-teal)' : 'none',
                  fontWeight: activeTab === 'login' ? '700' : '600'
                }}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  paddingBottom: '0.6rem',
                  cursor: 'pointer',
                  color: activeTab === 'register' ? 'var(--accent-teal)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'register' ? '2px solid var(--accent-teal)' : 'none',
                  fontWeight: activeTab === 'register' ? '700' : '600'
                }}
              >
                Register Account
              </button>
              <button 
                onClick={() => { setActiveTab('anonymous'); setErrorMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  paddingBottom: '0.6rem',
                  cursor: 'pointer',
                  color: activeTab === 'anonymous' ? 'var(--accent-teal)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'anonymous' ? '2px solid var(--accent-teal)' : 'none',
                  fontWeight: activeTab === 'anonymous' ? '700' : '600'
                }}
              >
                Anonymous Guest
              </button>
            </div>

            {/* ERROR / SUCCESS BANNERS */}
            {errorMsg && (
              <div style={{
                backgroundColor: 'rgba(220, 38, 38, 0.06)',
                border: '1px solid rgba(220, 38, 38, 0.15)',
                color: 'var(--accent-rose)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div style={{
                backgroundColor: 'rgba(22, 163, 74, 0.06)',
                border: '1px solid rgba(22, 163, 74, 0.15)',
                color: 'var(--accent-sage)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                ✓ {successMsg}
              </div>
            )}

            {/* FORM CLIENT */}
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {activeTab === 'anonymous' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Guest Nickname (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter nickname, e.g. Guest" 
                    value={anonName}
                    onChange={(e) => setAnonName(e.target.value)}
                    className="input-field"
                    disabled={isLoading}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Guests do not require credentials. No session records will require passwords.
                  </span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Username
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Password
                    </label>
                    <input 
                      type="password" 
                      placeholder="Enter password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              {/* Disclaimer Checkbox */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                cursor: 'pointer',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                userSelect: 'none',
                marginTop: '0.25rem'
              }}>
                <input 
                  type="checkbox" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={isLoading}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    accentColor: 'var(--accent-teal)',
                    flexShrink: 0,
                    marginTop: '0.1rem'
                  }}
                />
                <span>
                  I understand that Aura is an AI assistant, not a clinical therapy service, and agree to the <span style={{ color: 'var(--accent-teal)', textDecoration: 'underline', fontWeight: '600' }}>AI disclaimer guidelines</span>.
                </span>
              </label>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                disabled={isLoading}
              >
                {isLoading ? 'Accessing Aura...' : activeTab === 'login' ? 'Sign In' : activeTab === 'register' ? 'Register & Start' : 'Start Guest Session'}
              </button>
            </form>
          </div>

        </div>
      </div>
      
    </div>
  );
}
