'use client';

import Link from 'next/link';

interface CrisisAlertProps {
  onDismiss?: () => void;
}

export default function CrisisAlert({ onDismiss }: CrisisAlertProps) {
  return (
    <div style={{
      animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '16px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'relative',
      boxShadow: '0 8px 30px rgba(239, 68, 68, 0.15)',
      overflow: 'hidden'
    }}>
      <style jsx>{`
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .pulse-circle {
          animation: pulseRed 2s infinite;
        }
        @keyframes pulseRed {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      {/* Decorative vertical glowing red bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: 'var(--accent-rose)'
      }} />

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div className="pulse-circle" style={{
          backgroundColor: 'var(--accent-rose)',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'white'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <div style={{ flexGrow: 1 }}>
          <h4 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
            We are here for you, and you are not alone.
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
            It sounds like you may be going through an incredibly difficult moment. Please know that you deserve immediate, compassionate human care. Aura is an AI and cannot replace emergency help.
          </p>
        </div>

        {onDismiss && (
          <button 
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginTop: '0.25rem',
        borderTop: '1px solid rgba(239, 68, 68, 0.15)',
        paddingTop: '0.75rem'
      }}>
        <a 
          href="tel:18005990019" 
          className="btn-emergency"
          style={{
            textDecoration: 'none',
            fontSize: '0.8rem',
            padding: '0.4rem 0.8rem'
          }}
        >
          📞 Kiran Helpline: 1800-599-0019
        </a>
        <a 
          href="tel:14416" 
          className="btn-emergency"
          style={{
            textDecoration: 'none',
            fontSize: '0.8rem',
            padding: '0.4rem 0.8rem',
            background: 'var(--accent-rose)'
          }}
        >
          📞 Tele-MANAS: 14416
        </a>
        <Link 
          href="/emergency" 
          className="btn-secondary"
          style={{
            fontSize: '0.8rem',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)'
          }}
        >
          🌐 View India Helpline Directory
        </Link>
      </div>
    </div>
  );
}
