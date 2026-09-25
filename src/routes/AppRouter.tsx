import { Routes, Route } from 'react-router-dom';

export const AppRouter = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Tequio</h1>
            <p>Esqueleto base de React y TypeScript configurado correctamente.</p>
          </main>
        }
      />
      {/* Las rutas por actor (auth, catalog, producer, admin) se registrarán aquí */}
    </Routes>
  );
};