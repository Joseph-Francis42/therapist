'use client';

import { useState, useEffect } from 'react';

interface DisclaimersProps {
  onAccept: () => void;
}

export default function Disclaimers({ onAccept }: DisclaimersProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('aura_disclaimer_accepted');
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('aura_disclaimer_accepted', 'true');
    setIsOpen(false);
    onAccept();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 16, 0.9)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div className="modal-content glass-panel" style={{
        width: '90%',
        maxWidth: '540px',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.15)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'rgba(139, 92, 246, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          color: 'var(--accent-lavender)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
          </svg>
        </div>

        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
            Welcome to Aura
          </h2>
          <p style={{ color: 'var(--accent-teal-light)', fontSize: '0.95rem', fontWeight: '500' }}>
            Your Empathetic AI Space
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          textAlign: 'left',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '1.25rem',
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🤖</span>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>AI Assistant, Not a Human</strong>
              <p>Aura is a generative AI conversational model. It is designed to offer empathetic support, coping exercises, and reflection. It is not a licensed clinical therapist.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.8rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🚫</span>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>No Clinical Treatment</strong>
              <p>Aura cannot diagnose psychological conditions, write clinical treatment plans, or prescribe medication. Discussions are educational and supportive only.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.8rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🆘</span>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Emergency / Crisis Resource</strong>
              <p>If you are experiencing suicidal thoughts, self-harm impulses, or severe psychological distress, please connect with human support immediately. Call <strong>988</strong> (USA/Canada) or contact your local emergency services.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleAccept}
          className="btn-primary"
          style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', borderRadius: '14px', marginTop: '0.5rem' }}
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  );
}
