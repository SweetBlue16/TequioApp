import { AuthService } from './services/auth/AuthService.ts';
import { AuthServiceProvider } from './contexts/AuthServiceContext';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TokenStorage } from './services/auth/TokenStorage.ts';
import { createClient } from './services/api.ts';

const tokenStorage = new TokenStorage();
const client = createClient(tokenStorage);
const authService = new AuthService(client, tokenStorage);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthServiceProvider authService={authService}>
      <App />
    </AuthServiceProvider>
  </StrictMode>,
)
