import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ColorBar } from '@/components/common/ColorBar';
import { NavTextButton } from '@/components/common/NavTextButton';
import { Avatar } from '@/components/common/Avatar';
import { useSession } from '@/contexts/AuthContext';
import tequioLogo from '@/assets/images/tequioLogoTexto.png';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { session, profile, logout } = useSession();
  const userName = profile?.firstName || 'Mi cuenta';

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <header className={styles.header}>
      {/* Barra de colores en el borde superior exacto */}
      <ColorBar height={6} />

      <div className={styles.container}>
        {/* Contenedor del Logo con Imagen */}
        <Link to="/" className={styles.brand} onClick={closeMobile} aria-label="Ir al inicio de Tequio">
          <img
            src={tequioLogo}
            alt="Logotipo de Tequio"
            className={styles.logoImage}
          />
        </Link>

        {/* Sección de Botones, Usuario y Carrito */}
        <div className={styles.navSection}>
          <nav className={styles.navLinks} aria-label="Navegación principal">
            {session?.roleId === 2 && <NavTextButton label="Mis productos" to="/mis-productos" />}
            {!session && <NavTextButton label="Iniciar sesión" to="/login" />}
            {!session && <NavTextButton label="Registrarse" to="/registro" />}
          </nav>

          {session && <Link to="/perfil" className={styles.userProfile} onClick={closeMobile}>
            <div className={styles.avatarWrapper}>
              <Avatar key={profile?.profilePictureUrl ?? 'no-photo'} src={profile?.profilePictureUrl} altName={userName} />
            </div>
            <span className={styles.userName}>Hola, {userName}</span>
          </Link>}

          {session && <button type="button" className={styles.logoutButton} onClick={() => { logout(); closeMobile(); }}>Salir</button>}

          {/* Menú para Móvil */}
          <button
            type="button"
            className={styles.mobileToggle}
            aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            aria-expanded={isMobileOpen}
            onClick={toggleMobile}
          >
            {isMobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Menú desplegable para móviles */}
      {isMobileOpen && (
        <nav className={styles.mobileDrawer} aria-label="Menú móvil">
          {session && <NavTextButton label="Mi perfil" to="/perfil" onClick={closeMobile} />}
          {session?.roleId === 2 && <NavTextButton label="Mis productos" to="/mis-productos" onClick={closeMobile} />}
          {!session && <NavTextButton label="Iniciar sesión" to="/login" onClick={closeMobile} />}
          {!session && <NavTextButton label="Registrarse" to="/registro" onClick={closeMobile} />}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
