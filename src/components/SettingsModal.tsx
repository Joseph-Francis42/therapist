'use client';

import { useState, useEffect } from 'react';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(storedKey);
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('apiKeyChanged'));
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    window.dispatchEvent(new Event('apiKeyChanged'));
  };

  return (
    <div className="modal-overlay modal-fade-in" style={{
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
      <div className="modal-content glass-panel modal-slide-up" style={{
        width: '90%',
        maxWidth: '480px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), var(--glass-glow-teal)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Gemini Integration
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '0.25rem'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          By default, Aura runs in a <strong>Simulated Therapist Mode</strong> with high-fidelity mock responses. 
          If you want to use the live Gemini API, you can provide your own API key below.
        </p>

        <div style={{
          backgroundColor: 'rgba(13, 148, 136, 0.06)',
          border: '1px solid rgba(13, 148, 136, 0.15)',
          padding: '1rem',
          borderRadius: '12px',
          fontSize: '0.85rem',
          color: 'var(--accent-teal-light)',
          lineHeight: '1.4'
        }}>
          🛡️ <strong>Privacy First:</strong> Your API key is stored securely in your browser's local storage and is only used to call the Gemini API on your behalf. It never leaves your machine.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Gemini API Key
          </label>
          <input 
            type="password" 
            placeholder="AIzaSy..." 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="input-field"
            style={{ letterSpacing: apiKey ? '0.15em' : 'normal' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          {apiKey && (
            <button 
              onClick={handleClear}
              className="btn-secondary"
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
            >
              Clear Key
            </button>
          )}
          <button 
            onClick={handleSave}
            className="btn-primary"
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', minWidth: '100px' }}
            disabled={isSaved}
          >
            {isSaved ? 'Saved! ✓' : 'Save Config'}
          </button>
        </div>
      </div>
    </div>
  );
}
