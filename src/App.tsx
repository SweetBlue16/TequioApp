import { BrowserRouter as Router} from 'react-router-dom';
import { AppRouter } from '@/routes/AppRouter';
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';

export const App = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-warm-ivory)' }}>
        {/* Encabezado visible */}
        <Navbar userName="Mauricio" cartCount={2} />

        {/* Contenido temporal de prueba */}
        <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <h1>Bienvenido a Tequio</h1>
          <p style={{ marginTop: '12px', color: 'var(--color-ash-brown)' }}>
            Mercado comunitario de café, miel y cosechas locales de la región.
          </p>
        </main>
      </div>
    </Router>
  );
};

export default App;