import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { AppRouter } from '@/routes/AppRouter';

const AppContent: React.FC = () => {
  const location = useLocation();

  const isAuthRoute =
    location.pathname.startsWith('/registro') ||
    location.pathname.startsWith('/verificar') ||
    location.pathname.startsWith('/login');

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-warm-ivory, #fffdf9)' }}>
      {!isAuthRoute && <Navbar userName="Mauricio" cartCount={2} />}

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