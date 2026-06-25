import Link from 'next/link';

export default function EmergencyDirectory() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '3rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem',
      flexGrow: 1
    }}>
      
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          color: 'var(--accent-rose)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '800',
          fontFamily: 'var(--font-display)',
          marginBottom: '0.5rem',
          color: 'var(--text-primary)'
        }}>
          Crisis & Emergency Support
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
          If you are thinking about suicide, self-harm, or feeling like you cannot cope, please reach out to the professional resources below. Supportive humans are ready to help.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginTop: '1rem'
      }}>
        {/* India Helplines Card (Primary) */}
        <div className="glass-panel" style={{
          padding: '2rem',
          border: '1px solid rgba(15, 118, 110, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 8px 30px rgba(15, 118, 110, 0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-teal)' }}>India Helplines</h3>
            <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(15, 118, 110, 0.08)', color: 'var(--accent-teal)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>24/7 Support</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Kiran Helpline (Govt)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mental health support toll-free</span>
              </div>
              <a href="tel:18005990019" className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                1800-599-0019
              </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Tele-MANAS (Govt)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>24/7 toll-free support</span>
              </div>
              <a href="tel:14416" className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Dial 14416
              </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Vandrevala Foundation</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Free mental counseling</span>
              </div>
              <a href="tel:+919999666555" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                9999-666-555
              </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>AASRA</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Suicide prevention services</span>
              </div>
              <a href="tel:+919820466726" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                9820466726
              </a>
            </div>
          </div>
        </div>

        {/* US & Canada Card */}
        <div className="glass-panel" style={{
          padding: '2rem',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 8px 30px rgba(239, 68, 68, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>United States & Canada</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>24/7/365</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Suicide & Crisis Lifeline</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Free, confidential call/text</span>
              </div>
              <a href="tel:988" className="btn-emergency" style={{ animation: 'none', padding: '0.35rem 0.75rem' }}>
                Dial 988
              </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Crisis Text Line</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Text HOME to 741741</span>
              </div>
              <a href="sms:741741?&body=HOME" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem' }}>
                Text HOME
              </a>
            </div>
          </div>
        </div>

        {/* United Kingdom Card */}
        <div className="glass-panel" style={{
          padding: '2rem',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>United Kingdom</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-teal-light)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available 24/7</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Samaritans</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Call free on 116 123</span>
              </div>
              <a href="tel:116123" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem' }}>
                Call 116 123
              </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>NHS Mental Health Services</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Urgent support (dial 111)</span>
              </div>
              <a href="tel:111" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem' }}>
                Call 111
              </a>
            </div>
          </div>
        </div>

        {/* Australia Card */}
        <div className="glass-panel" style={{
          padding: '2rem',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Australia</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-teal-light)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available 24/7</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Lifeline Australia</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Call free on 13 11 14</span>
              </div>
              <a href="tel:131114" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem' }}>
                Call 13 11 14
              </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Beyond Blue</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Anxiety & depression support</span>
              </div>
              <a href="tel:1300224636" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem' }}>
                Call 1300 224
              </a>
            </div>
          </div>
        </div>

        {/* Global Directory Card */}
        <div className="glass-panel" style={{
          padding: '2rem',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>International Support</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Located outside these countries? Find A Helpline provides a complete directory of free, confidential support services matching your location worldwide.
            </p>
          </div>
          
          <a 
            href="https://findahelpline.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-primary" 
            style={{ width: '100%', padding: '0.65rem', textAlign: 'center', textDecoration: 'none' }}
          >
            Search Global Helplines
          </a>
        </div>
      </div>

      <div style={{
        marginTop: '1.5rem',
        textAlign: 'center'
      }}>
        <Link href="/chat" className="btn-secondary" style={{ padding: '0.75rem 2rem', borderRadius: '99px' }}>
          Back to Chat Workspace
        </Link>
      </div>

    </div>
  );
}
