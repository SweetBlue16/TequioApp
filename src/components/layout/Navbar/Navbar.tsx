import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ColorBar } from '@/components/common/ColorBar';
import { NavTextButton } from '@/components/common/NavTextButton';
import { Avatar } from '@/components/common/Avatar';
import tequioLogo from '@/assets/images/tequioLogoTexto.png';
import cartIcon from '@/assets/icons/icon_carroCompra.png';
import styles from './Navbar.module.css';
import { ROUTES } from '@/constants/routes';

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
      <ColorBar height={6} />

      <div className={styles.container}>
        <Link
          to={ROUTES.PUBLIC.HOME}
          className={styles.brand}
          onClick={closeMobile}
          aria-label="Ir al inicio de Tequio"
        >
          <img
            src={tequioLogo}
            alt="Logotipo de Tequio"
            className={styles.logoImage}
          />
        </Link>

        <div className={styles.navSection}>
          <nav className={styles.navLinks} aria-label="Navegación principal">
            <NavTextButton label="Categorías" to={ROUTES.PUBLIC.CATALOG} />
            <NavTextButton label="Mis compras" to={ROUTES.BUYER.MY_PURCHASES} />
            <NavTextButton label="Panel de vendedor" to={ROUTES.PRODUCER.ROOT} />
          </nav>

          <Link
            to={ROUTES.BUYER.PROFILE}
            className={styles.userProfile}
            onClick={closeMobile}
          >
            <div className={styles.avatarWrapper}>
              <Avatar src={userAvatarUrl} altName={userName} />
            </div>
            <span className={styles.userName}>Hola, {userName}</span>
          </Link>

          <Link
            to={ROUTES.BUYER.CART}
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
          <NavTextButton
            label="Categorías"
            to={ROUTES.PUBLIC.CATALOG}
            onClick={closeMobile}
          />
          <NavTextButton
            label="Mis compras"
            to={ROUTES.BUYER.MY_PURCHASES}
            onClick={closeMobile}
          />
          <NavTextButton
            label="Panel de vendedor"
            to={ROUTES.PRODUCER.ROOT}
            onClick={closeMobile}
          />
        </nav>
      )}
    </header>
  );
};

export default Navbar;