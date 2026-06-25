'use client';

import { useState, useEffect, useRef } from 'react';

type BreathePhase = 'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)';

export default function CopingCard() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathePhase>('Inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Move to next phase
            setPhase((currentPhase) => {
              switch (currentPhase) {
                case 'Inhale': return 'Hold (Full)';
                case 'Hold (Full)': return 'Exhale';
                case 'Exhale': return 'Hold (Empty)';
                case 'Hold (Empty)': return 'Inhale';
              }
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(4);
      setPhase('Inhale');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const toggleBreathe = () => {
    setIsActive(!isActive);
  };

  const getBreatheBubbleStyle = () => {
    if (!isActive) return {};
    
    switch (phase) {
      case 'Inhale':
        return {
          transform: 'scale(1.3)',
          transition: 'transform 4s linear',
          background: 'radial-gradient(circle, #2dd4bf 0%, #0d9488 100%)',
          boxShadow: '0 0 40px rgba(45, 212, 191, 0.6)'
        };
      case 'Hold (Full)':
        return {
          transform: 'scale(1.3)',
          background: 'radial-gradient(circle, #8b5cf6 0%, #6d28d9 100%)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)'
        };
      case 'Exhale':
        return {
          transform: 'scale(0.9)',
          transition: 'transform 4s linear',
          background: 'radial-gradient(circle, #34d399 0%, #059669 100%)',
          boxShadow: '0 0 20px rgba(52, 211, 153, 0.3)'
        };
      case 'Hold (Empty)':
        return {
          transform: 'scale(0.9)',
          background: 'radial-gradient(circle, #4b5563 0%, #1f2937 100%)',
          boxShadow: '0 0 10px rgba(75, 85, 99, 0.2)'
        };
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'Inhale': return 'Breathe in slowly through your nose...';
      case 'Hold (Full)': return 'Hold your breath, feel the still air...';
      case 'Exhale': return 'Release the breath slowly through your mouth...';
      case 'Hold (Empty)': return 'Wait in empty relaxation...';
    }
  };

  return (
    <div className="glass-card-teal" style={{
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
      maxWidth: '400px',
      margin: '0 auto',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
          Interactive Box Breathing
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Settle your nervous system with a 4-second cycle.
        </p>
      </div>

      <div style={{
        height: '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%'
      }}>
        {/* Glowing concentric background rings */}
        {isActive && (
          <div style={{
            position: 'absolute',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            border: '1px solid rgba(13, 148, 136, 0.15)',
            transform: phase === 'Inhale' ? 'scale(1.4)' : 'scale(1)',
            opacity: phase === 'Inhale' || phase === 'Hold (Full)' ? 0.6 : 0.1,
            transition: phase === 'Inhale' ? 'transform 4s linear, opacity 4s' : 'transform 1s, opacity 1s',
            zIndex: 0
          }} />
        )}

        <div 
          onClick={toggleBreathe}
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            userSelect: 'none',
            transition: isActive && (phase === 'Hold (Full)' || phase === 'Hold (Empty)') ? 'none' : 'transform 4s linear, background 1s, box-shadow 1s',
            ...getBreatheBubbleStyle()
          }}
        >
          {isActive ? (
            <>
              <span style={{ 
                fontSize: '1.2rem', 
                fontWeight: '800', 
                color: phase === 'Hold (Empty)' ? 'var(--text-primary)' : '#0f172a',
                lineHeight: 1
              }}>
                {timeLeft}
              </span>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: '600', 
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginTop: '0.2rem',
                color: phase === 'Hold (Empty)' ? 'var(--text-secondary)' : 'rgba(15, 23, 42, 0.8)'
              }}>
                {phase}
              </span>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent-teal-light)' }}>
                <path d="M8 5v14l11-7z" />
              </svg>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Start
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        minHeight: '40px', 
        textAlign: 'center', 
        fontSize: '0.9rem', 
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: '500',
        lineHeight: '1.4',
        padding: '0 0.5rem'
      }}>
        {isActive ? getPhaseInstruction() : 'Click the bubble to begin calming breaths.'}
      </div>

      {isActive && (
        <button 
          onClick={toggleBreathe}
          className="btn-secondary"
          style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '99px' }}
        >
          Pause Exercise
        </button>
      )}
    </div>
  );
}
