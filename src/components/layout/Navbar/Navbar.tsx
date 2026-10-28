import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ColorBar } from '@/components/common/ColorBar';
import { NavTextButton } from '@/components/common/NavTextButton';
import { Avatar } from '@/components/common/Avatar';
import { useSession } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import tequioLogo from '@/assets/images/tequioLogoTexto.png';
import cartIcon from '@/assets/icons/icon_carroCompra.png';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { session, profile, logout } = useSession();
  const navigate = useNavigate();

  const userName = profile?.firstName || 'Mi cuenta';

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  const handleLogout = () => {
    closeMobile();
    logout();
    navigate(ROUTES.PUBLIC.HOME);
  };

  return (
    <header className={styles.header}>
      <ColorBar height={6} />

      <div className={styles.container}>
        <Link to="/" className={styles.brand} onClick={closeMobile} aria-label="Ir al inicio de Tequio">
          <img src={tequioLogo} alt="Logotipo de Tequio" className={styles.logoImage} />
        </Link>

        <div className={styles.navSection}>
          <nav className={styles.navLinks} aria-label="Navegación principal">
            <NavTextButton label="Categorías" to={ROUTES.PUBLIC.CATALOG} />
            {session && (
              <>
                <NavTextButton label="Mis compras" to={ROUTES.BUYER.MY_PURCHASES} />
                <NavTextButton label="Panel de vendedor" to={ROUTES.PRODUCER.ROOT} />
              </>
            )}
            {!session && (
              <>
                <NavTextButton label="Iniciar sesión" to="/login" />
                <NavTextButton label="Registrarse" to="/registro" />
              </>
            )}
          </nav>

          {session && (
            <>
              <Link to="/perfil" className={styles.userProfile} onClick={closeMobile}>
                <div className={styles.avatarWrapper}>
                  <Avatar key={profile?.profilePictureUrl ?? 'no-photo'} src={profile?.profilePictureUrl} altName={userName} />
                </div>
                <span className={styles.userName}>Hola, {userName}</span>
              </Link>

              <Link to={ROUTES.BUYER.CART} className={styles.cartButton} aria-label="Carrito de compras">
                <img src={cartIcon} alt="" aria-hidden="true" className={styles.cartIcon} />
              </Link>

              <button type="button" className={styles.logoutButton} onClick={handleLogout}>
                Salir
              </button>
            </>
          )}

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

      {isMobileOpen && (
        <nav className={styles.mobileDrawer} aria-label="Menú móvil">
          <NavTextButton label="Categorías" to={ROUTES.PUBLIC.CATALOG} onClick={closeMobile} />
          {session ? (
            <>
              <NavTextButton label="Panel de vendedor" to={ROUTES.PRODUCER.ROOT} onClick={closeMobile} />
              <NavTextButton label="Mis compras" to={ROUTES.BUYER.MY_PURCHASES} onClick={closeMobile} />
              <NavTextButton label="Mi perfil" to="/perfil" onClick={closeMobile} />
              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
                style={{ textAlign: 'left', padding: '0.75rem 1rem' }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavTextButton label="Iniciar sesión" to="/login" onClick={closeMobile} />
              <NavTextButton label="Registrarse" to="/registro" onClick={closeMobile} />
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;