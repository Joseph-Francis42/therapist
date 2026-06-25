'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CopingCard from '../../components/CopingCard';
import CrisisAlert from '../../components/CrisisAlert';
import { getSession, addMessage, endSession, createSession } from '@/lib/db';
import { generateTherapistResponse, generateSessionSummary } from '@/lib/gemini';
import { checkCrisis } from '@/lib/safety/check';

interface ChatMessage {
  id: string;
  sender: 'user' | 'therapist';
  text: string;
  timestamp: string;
  isCrisis?: boolean;
}

interface SessionSummary {
  reflection: string;
  trajectory: string;
  copingSteps: string[];
  exercise: string;
}

function ChatWorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get('sessionId');

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCrisisActive, setIsCrisisActive] = useState(false);
  const [username, setUsername] = useState('Guest');

  // End of Session State
  const [showMoodSelect, setShowMoodSelect] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SessionSummary | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Resolve Session ID and username
  useEffect(() => {
    const storedUserId = localStorage.getItem('aura_user_id');
    if (!storedUserId) {
      router.push('/auth');
      return;
    }

    const initSession = async () => {
      let activeSessionId = sessionIdParam;
      if (!activeSessionId) {
        activeSessionId = localStorage.getItem('aura_current_session_id');
      }

      if (!activeSessionId) {
        try {
          const newSession = await createSession(storedUserId);
          activeSessionId = newSession.id;
          localStorage.setItem('aura_current_session_id', activeSessionId);
          router.replace(`/chat?sessionId=${activeSessionId}`);
          return;
        } catch (err) {
          console.error('Error creating new session:', err);
          router.push('/');
          return;
        }
      }

      setSessionId(activeSessionId);
      
      const storedUsername = localStorage.getItem('aura_username') || 'Guest';
      setUsername(storedUsername);

      // Fetch existing session details
      fetchSessionDetails(activeSessionId);
    };

    initSession();
  }, [sessionIdParam, router]);

  // 2. Scroll to bottom whenever messages list or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchSessionDetails = async (id: string) => {
    try {
      const session = await getSession(id);
      if (!session) {
        throw new Error('Session not found');
      }
      setMessages(session.messages);
      
      // If any message in history was flagged as a crisis, activate crisis UI
      const hasCrisis = session.messages.some((m: ChatMessage) => m.isCrisis);
      if (hasCrisis) {
        setIsCrisisActive(true);
      }

      // Check if session has already ended/summarized
      if (session.summary) {
        setSummaryResult(session.summary);
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
      // If error (e.g. 404), clear local session ref and go back
      localStorage.removeItem('aura_current_session_id');
      router.push('/');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId || isTyping) return;

    const userText = inputText.trim();
    setInputText('');

    // Pre-insert user message in local state
    const tempUserMsg: ChatMessage = {
      id: 'temp_' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      const sId = sessionId as string;
      
      // 1. Check for crisis
      const crisisCheck = checkCrisis(userText);
      const userMsg = await addMessage(sId, 'user', userText);

      if (crisisCheck.isCrisis) {
        const emergencyResponse = 
          "I hear how much pain you are in right now, and I want to support you. However, as an AI, I am not equipped to handle crisis situations. Please connect with someone who can help you right now. Call Kiran Helpline: 1800-599-0019 or Tele-MANAS: 14416 immediately. You don't have to carry this alone.";
        
        const therapistMsg = await addMessage(sId, 'therapist', emergencyResponse);
        setMessages(prev => {
          const filtered = prev.filter(m => !m.id.startsWith('temp_'));
          return [...filtered, userMsg, therapistMsg];
        });
        setIsCrisisActive(true);
      } else {
        // 2. Load updated messages from local storage to feed history
        const updatedSession = await getSession(sId);
        const historyMessages = updatedSession ? updatedSession.messages : [userMsg];
        
        // 3. Generate therapist reply
        const responseText = await generateTherapistResponse(historyMessages, apiKey);
        
        // 4. Save therapist reply
        const therapistMsg = await addMessage(sId, 'therapist', responseText);
        
        setMessages(prev => {
          const filtered = prev.filter(m => !m.id.startsWith('temp_'));
          return [...filtered, userMsg, therapistMsg];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Insert fallback error message in state
      setMessages(prev => [
        ...prev.filter(m => !m.id.startsWith('temp_')),
        {
          id: 'err_' + Date.now(),
          sender: 'therapist',
          text: "I'm having trouble connecting right now. Let me take a moment to reflect. Please try sending your message again shortly.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEndSessionRequest = () => {
    setShowMoodSelect(true);
  };

  const handleGenerateSummary = async (mood: string) => {
    setSelectedMood(mood);
    setShowMoodSelect(false);
    setIsGeneratingSummary(true);

    try {
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      const sId = sessionId as string;
      const session = await getSession(sId);
      if (!session) {
        throw new Error('Session not found');
      }

      const summary = await generateSessionSummary(session.messages, apiKey);
      const updatedSession = await endSession(sId, summary, mood);

      setSummaryResult(updatedSession.summary);
      
      // Clear active session from localStorage (completed)
      localStorage.removeItem('aura_current_session_id');
    } catch (err) {
      console.error('Error ending session:', err);
      alert('Failed to generate your summary. Please try again.');
      setShowMoodSelect(true);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem',
      flexGrow: 1,
      height: 'calc(100vh - 75px)', // subtract navbar height
      width: '100%'
    }}>
      <style jsx>{`
        @media (min-width: 900px) {
          .workspace-layout {
            grid-template-columns: 1.6fr 1fr !important;
          }
        }
      `}</style>

      {/* Main Workspace Split Grid */}
      <div className="workspace-layout" style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
        height: '100%',
        overflow: 'hidden'
      }}>
        
        {/* LEFT PANEL: Chat Client */}
        <div className="glass-panel" style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          border: '1px solid var(--glass-border)',
          position: 'relative'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.01)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-sage)',
                  display: 'inline-block',
                  animation: 'pulse-grow 2s infinite'
                }} />
                <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Active Reflection Workspace</h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Conversing with Aura as <strong>{username}</strong>
              </p>
            </div>
            
            {messages.length > 0 && !summaryResult && (
              <button 
                onClick={handleEndSessionRequest}
                className="btn-primary"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-lavender) 100%)',
                  boxShadow: 'none'
                }}
              >
                End Session & Reflect
              </button>
            )}
          </div>

          {/* Active Crisis Banner */}
          {isCrisisActive && (
            <div style={{ padding: '0.75rem 1.25rem' }}>
              <CrisisAlert onDismiss={() => setIsCrisisActive(false)} />
            </div>
          )}

          {/* Message List */}
          <div style={{
            flexGrow: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'rgba(8, 12, 20, 0.2)'
          }}>
            {messages.length === 0 ? (
              <div style={{
                margin: 'auto',
                maxWidth: '400px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(13, 148, 136, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: 'var(--accent-teal)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Begin sharing</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Aura is here to listen. You can type about how your day went, any stress or anxiety you are feeling, or simply say hello.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div 
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      width: '100%',
                      animation: 'fadeIn 0.2s ease-out'
                    }}
                  >
                    <div style={{
                      maxWidth: '80%',
                      padding: '0.85rem 1.15rem',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: isUser 
                        ? 'rgba(13, 148, 136, 0.15)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid',
                      borderColor: isUser 
                        ? 'rgba(13, 148, 136, 0.3)' 
                        : 'var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                      lineHeight: '1.6',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxShadow: isUser ? '0 4px 12px rgba(13, 148, 136, 0.08)' : 'none'
                    }}>
                      {msg.text}
                      <div style={{
                        display: 'block',
                        textAlign: 'right',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.4rem',
                      }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                <div style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: '16px 16px 16px 4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginRight: '0.2rem' }}>Aura is reflecting</span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          {!summaryResult && (
            <form 
              onSubmit={handleSendMessage}
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                alignItems: 'center'
              }}
            >
              <input 
                type="text" 
                placeholder="Share your thoughts with Aura..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="input-field"
                style={{ flexGrow: 1 }}
                disabled={isTyping}
              />
              <button 
                type="submit" 
                className="btn-primary"
                style={{ padding: '0.75rem', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                disabled={!inputText.trim() || isTyping}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          )}
        </div>

        {/* RIGHT PANEL: Grounding Hub & Coping guide */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          height: '100%',
          overflowY: 'auto'
        }}>
          
          <CopingCard />

          <div className="glass-panel" style={{
            padding: '1.5rem',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🧘</span> Grounding Reminder
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              If you feel anxious or caught in a spiral:
            </p>
            <ul style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-secondary)', 
              lineHeight: '1.5',
              paddingLeft: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <li>Use the <strong>Box Breathing bubble</strong> above to balance your breathing.</li>
              <li>Acknowledge 5 things in your physical environment.</li>
              <li>Know that it is okay to pause the chat at any time.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* OVERLAY 1: Mood Select Dialog (End Session flow) */}
      {showMoodSelect && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="modal-content glass-panel" style={{
            width: '90%',
            maxWidth: '460px',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>Reflecting on Your Session</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                How would you summarize your dominant emotional state right now?
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              marginTop: '0.5rem'
            }}>
              {['Anxious', 'Sad', 'Overwhelmed', 'Angry', 'Peaceful', 'Relieved', 'Reflective', 'Neutral'].map((moodOption) => (
                <button
                  key={moodOption}
                  onClick={() => handleGenerateSummary(moodOption)}
                  className="btn-secondary"
                  style={{
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    borderRadius: '12px',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {moodOption === 'Anxious' && '😰 '}
                  {moodOption === 'Sad' && '😢 '}
                  {moodOption === 'Overwhelmed' && '🤯 '}
                  {moodOption === 'Angry' && '😡 '}
                  {moodOption === 'Peaceful' && '🌸 '}
                  {moodOption === 'Relieved' && '😌 '}
                  {moodOption === 'Reflective' && '🤔 '}
                  {moodOption === 'Neutral' && '😐 '}
                  {moodOption}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowMoodSelect(false)}
              className="btn-secondary"
              style={{ width: '100%', borderColor: 'transparent', padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}
            >
              Cancel & Continue Chatting
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY 2: Summary Loading Spinner */}
      {isGeneratingSummary && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 8, 16, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          gap: '1.5rem',
          color: 'var(--text-primary)'
        }}>
          <div className="spinner" />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Consolidating Reflection</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Aura is summarizing themes and structuring personalized coping actions...
            </p>
          </div>
        </div>
      )}

      {/* OVERLAY 3: Session Reflection Summary Dashboard */}
      {summaryResult && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 8, 16, 0.92)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          overflowY: 'auto',
          padding: '2rem 1rem'
        }}>
          <div className="modal-content glass-panel" style={{
            width: '100%',
            maxWidth: '640px',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.1)',
            borderRadius: '24px',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            textAlign: 'left'
          }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ fontSize: '2rem' }}>🌱</div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', fontFamily: 'var(--font-display)' }}>Your Session Reflection</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Mood at close: <strong style={{ color: 'var(--accent-teal-light)' }}>{selectedMood}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Reflection Card */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--glass-border)',
                padding: '1.25rem',
                borderRadius: '16px'
              }}>
                <h4 style={{ color: 'var(--accent-teal-light)', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Session Overview
                </h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  {summaryResult.reflection}
                </p>
              </div>

              {/* Trajectory Card */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--glass-border)',
                padding: '1.25rem',
                borderRadius: '16px'
              }}>
                <h4 style={{ color: 'var(--accent-lavender)', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Emotional Pathway
                </h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  {summaryResult.trajectory}
                </p>
              </div>

              {/* Coping Steps Card */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--glass-border)',
                padding: '1.25rem',
                borderRadius: '16px'
              }}>
                <h4 style={{ color: 'var(--accent-sage)', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.55rem' }}>
                  Recommended Coping Steps
                </h4>
                <ul style={{
                  paddingLeft: '1.25rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  lineHeight: '1.5'
                }}>
                  {summaryResult.copingSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* Specific Practice Card */}
              <div style={{
                backgroundColor: 'rgba(13, 148, 136, 0.03)',
                border: '1px solid rgba(13, 148, 136, 0.15)',
                padding: '1.25rem',
                borderRadius: '16px'
              }}>
                <h4 style={{ color: 'var(--accent-teal-light)', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Self-Care Exercise
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  {summaryResult.exercise}
                </p>
              </div>

            </div>

            <button
              onClick={() => router.push('/history')}
              className="btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', borderRadius: '14px', marginTop: '0.5rem' }}
            >
              Go to History Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ChatWorkspace() {
  return (
    <Suspense fallback={
      <div style={{
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '4rem 0'
      }}>
        <div className="spinner" />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Entering workspace...</span>
      </div>
    }>
      <ChatWorkspaceContent />
    </Suspense>
  );
}
