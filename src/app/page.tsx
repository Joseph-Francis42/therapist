'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomeGateway() {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('aura_user_id');
    const sessionId = localStorage.getItem('aura_current_session_id');

    if (userId) {
      if (sessionId) {
        router.replace(`/chat?sessionId=${sessionId}`);
      } else {
        router.replace('/history');
      }
    } else {
      router.replace('/auth');
    }
  }, []);

  return (
    <div style={{
      margin: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '4rem 0',
      minHeight: 'calc(100vh - 75px)',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      width: '100%'
    }}>
      <div className="spinner" />
      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading your space...</span>
    </div>
  );
}
