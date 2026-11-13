import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { AppRouter } from '@/routes/AppRouter';
import { useSession } from '@/contexts/AuthContext';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isInitializing } = useSession();


  const hideNavbar =
    location.pathname.startsWith('/registro') ||
    location.pathname.startsWith('/verificar') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/recuperar') ||
    location.pathname.startsWith('/admin');

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-warm-ivory, #fffdf9)' }}>
      {!hideNavbar && !isInitializing && <Navbar />}

      <main>
        <AppRouter />
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
