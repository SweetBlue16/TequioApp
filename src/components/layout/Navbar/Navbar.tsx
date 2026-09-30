import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ColorBar } from '@/components/common/ColorBar';
import { NavTextButton } from '@/components/common/NavTextButton';
import { Avatar } from '@/components/common/Avatar';
import tequioLogo from '@/assets/images/tequioLogoTexto.png';
import cartIcon from '@/assets/icons/icon_carroCompra.png';
import styles from './Navbar.module.css';

export interface NavbarProps {
  userName?: string;
  userAvatarUrl?: string | null;
  cartCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName = 'Mauricio',
  userAvatarUrl = null,
  cartCount = 0,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
            <NavTextButton label="Categorías" to="/categorias" />
            <NavTextButton label="Mis compras" to="/mis-compras" />
            <NavTextButton label="Panel de vendedor" to="/panel-vendedor" />
          </nav>

          {/* Bloque de Usuario con Avatar Adaptable */}
          <Link to="/perfil" className={styles.userProfile} onClick={closeMobile}>
            <div className={styles.avatarWrapper}>
              <Avatar src={userAvatarUrl} altName={userName} />
            </div>
            <span className={styles.userName}>Hola, {userName}</span>
          </Link>

          {/* Botón e Ícono de Carrito */}
          <Link
            to="/carrito"
            className={styles.cartButton}
            aria-label={`Carrito de compras, ${cartCount} productos`}
          >
            <img
              src={cartIcon}
              alt=""
              aria-hidden="true"
              className={styles.cartIcon}
            />
          </Link>

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
          <NavTextButton label="Categorías" to="/categorias" onClick={closeMobile} />
          <NavTextButton label="Mis compras" to="/mis-compras" onClick={closeMobile} />
          <NavTextButton label="Panel de vendedor" to="/panel-vendedor" onClick={closeMobile} />
        </nav>
      )}
    </header>
  );
};

export default Navbar;