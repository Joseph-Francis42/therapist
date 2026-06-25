import type { Metadata } from 'next';
import './globals.css';
import Navigation from '../components/Navigation';

export const metadata: Metadata = {
  title: 'Aura — Empathetic AI Space & Mental Wellness',
  description: 'Connect with Aura, a compassionate AI assistant designed to offer cognitive exercises, active listening, mindfulness guidance, and a safe space to reflect.',
  keywords: 'mental health, AI therapist, mindfulness, box breathing, coping strategies, self-care, empathetic AI',
  authors: [{ name: 'Aura Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <div className="app-container">
          <Navigation />
          <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
