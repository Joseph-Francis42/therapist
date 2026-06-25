'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { listSessions } from '@/lib/db';

interface ChatMessage {
  id: string;
  sender: 'user' | 'therapist';
  text: string;
  timestamp: string;
}

interface SessionSummary {
  reflection: string;
  trajectory: string;
  copingSteps: string[];
  exercise: string;
}

interface Session {
  id: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  mood: string | null;
  messages: ChatMessage[];
  summary: SessionSummary | null;
}

export default function HistoryDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Selected session for detailed view modal
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('aura_user_id');
    if (!storedUserId) {
      // User is not logged in/registered, redirect to home
      router.push('/');
      return;
    }

    setUserId(storedUserId);
    fetchSessions(storedUserId);
  }, []);

  const fetchSessions = async (uid: string) => {
    setIsLoading(true);
    try {
      const data = await listSessions(uid);
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodEmoji = (mood: string | null) => {
    if (!mood) return '😐';
    switch (mood) {
      case 'Anxious': return '😰';
      case 'Sad': return '😢';
      case 'Overwhelmed': return '🤯';
      case 'Angry': return '😡';
      case 'Peaceful': return '🌸';
      case 'Relieved': return '😌';
      case 'Reflective': return '🤔';
      default: return '😐';
    }
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '3rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      flexGrow: 1,
      width: '100%'
    }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
            Reflection History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Browse your completed sessions and active grounding coping steps.
          </p>
        </div>

        <Link href="/chat" className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
          Start Session
        </Link>
      </div>

      {isLoading ? (
        <div style={{
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          padding: '4rem 0'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '2px solid rgba(13, 148, 136, 0.1)',
            borderTopColor: 'var(--accent-teal)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style jsx>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading reflection archive...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '2.5rem' }}>🍃</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Your history is empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px', lineHeight: '1.5' }}>
            You haven't completed any sessions yet. Share your thoughts in a new chat session to generate your first emotional overview.
          </p>
          <Link href="/chat" className="btn-primary" style={{ marginTop: '0.5rem' }}>
            Begin First Session
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {sessions.map((session) => {
            const formattedDate = new Date(session.startTime).toLocaleDateString([], {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const formattedTime = new Date(session.startTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                key={session.id}
                className="glass-panel"
                style={{
                  padding: '1.5rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'var(--transition-smooth)',
                  cursor: 'pointer',
                  border: '1px solid var(--glass-border)'
                }}
                onClick={() => setSelectedSession(session)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {formattedDate}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Started at {formattedTime} • {session.messages.length} messages
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '99px',
                    border: '1px solid var(--glass-border)',
                    fontSize: '0.82rem',
                    fontWeight: '600'
                  }}>
                    <span>{getMoodEmoji(session.mood)}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {session.mood || 'Active / Unsaved'}
                    </span>
                  </div>
                </div>

                {session.summary ? (
                  <p style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {session.summary.reflection}
                  </p>
                ) : (
                  <p style={{ fontSize: '0.88rem', color: 'var(--accent-teal-light)', fontWeight: '500' }}>
                    Active session. Click to continue chatting or close.
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                  <button 
                    className="btn-secondary"
                    style={{
                      padding: '0.4rem 1rem',
                      fontSize: '0.8rem',
                      borderRadius: '99px',
                      backgroundColor: 'transparent'
                    }}
                  >
                    {session.summary ? 'View Details' : 'Resume Chat'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL OVERLAY */}
      {selectedSession && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 8, 16, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem 1rem',
          overflowY: 'auto'
        }}>
          <div className="modal-content glass-panel" style={{
            width: '100%',
            maxWidth: '740px',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxHeight: '90vh',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            borderRadius: '24px',
            textAlign: 'left',
            overflow: 'hidden'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
                  Session on {new Date(selectedSession.startTime).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Mood: <strong style={{ color: 'var(--accent-teal-light)' }}>{selectedSession.mood || 'N/A'}</strong>
                </span>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal scroll contents */}
            <div style={{
              overflowY: 'auto',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              paddingRight: '0.5rem'
            }}>
              
              {/* Summary Sections if completed */}
              {selectedSession.summary ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Overview */}
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--glass-border)', padding: '1rem 1.25rem', borderRadius: '12px' }}>
                    <h4 style={{ color: 'var(--accent-teal-light)', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Overview</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{selectedSession.summary.reflection}</p>
                  </div>

                  {/* Pathway */}
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--glass-border)', padding: '1rem 1.25rem', borderRadius: '12px' }}>
                    <h4 style={{ color: 'var(--accent-lavender)', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Emotional Pathway</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{selectedSession.summary.trajectory}</p>
                  </div>

                  {/* Coping Steps */}
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--glass-border)', padding: '1rem 1.25rem', borderRadius: '12px' }}>
                    <h4 style={{ color: 'var(--accent-sage)', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Coping Strategies</h4>
                    <ul style={{ paddingLeft: '1.15rem', fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', lineHeight: '1.4' }}>
                      {selectedSession.summary.copingSteps.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  {/* Grounding exercise */}
                  <div style={{ backgroundColor: 'rgba(13, 148, 136, 0.03)', border: '1px solid rgba(13, 148, 136, 0.15)', padding: '1rem 1.25rem', borderRadius: '12px' }}>
                    <h4 style={{ color: 'var(--accent-teal-light)', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Self-Care Practice</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{selectedSession.summary.exercise}</p>
                  </div>

                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p style={{ color: 'var(--accent-teal-light)', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: '500' }}>
                    This is an active, open session.
                  </p>
                  <button 
                    onClick={() => {
                      localStorage.setItem('aura_current_session_id', selectedSession.id);
                      router.push(`/chat?sessionId=${selectedSession.id}`);
                    }}
                    className="btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}
                  >
                    Resume Chat Session
                  </button>
                </div>
              )}

              {/* Chat Transcript Panel */}
              <div style={{ marginTop: '0.5rem' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.35rem' }}>
                  Chat Transcript
                </h4>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  backgroundColor: 'rgba(5, 8, 16, 0.4)',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: '1px solid var(--glass-border)'
                }}>
                  {selectedSession.messages.map((m) => {
                    const isUser = m.sender === 'user';
                    return (
                      <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                          {isUser ? 'You' : 'Aura'} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div style={{
                          maxWidth: '85%',
                          padding: '0.7rem 0.9rem',
                          borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          backgroundColor: isUser ? 'rgba(13, 148, 136, 0.1)' : 'rgba(255,255,255,0.02)',
                          border: '1px solid',
                          borderColor: isUser ? 'rgba(13, 148, 136, 0.2)' : 'var(--glass-border)',
                          fontSize: '0.88rem',
                          lineHeight: '1.5',
                          color: 'var(--text-primary)'
                        }}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedSession(null)} className="btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                Close Overview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
