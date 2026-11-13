import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

import logoEditarPerfil from '@/assets/images/adminSideBar/logo_editarPerfil.png';
import logoEditarPuntos from '@/assets/images/adminSideBar/logo_editarPuntos.png';
import logoAutenticar from '@/assets/images/adminSideBar/logo_autenticar.png';
import logoCerrarSesion from '@/assets/images/adminSideBar/logo_cerrarSesion.png';
import logoTequio from '@/assets/images/logoTequio.png';

import styles from './AdminSidebar.module.css';

/**
 * Navigation item contract for the administrator sidebar.
 */
interface AdminNavOption {
  readonly label: string;
  readonly to: string;
  readonly iconSrc: string;
}

/**
 * Properties contract for the AdminSidebar component.
 */
export interface AdminSidebarProps {
  /** Administrator display name (defaults to 'Daniel' until backend is wired) */
  userName?: string;
  /** Optional profile picture URL */
  avatarUrl?: string;
  /** Callback triggered when the administrator requests logout */
  onLogout?: () => void;
}

const ADMIN_NAV_OPTIONS: readonly AdminNavOption[] = [
  {
    label: 'Gestionar perfil',
    to: ROUTES.ADMIN.PROFILE,
    iconSrc: logoEditarPerfil,
  },
  {
    label: 'Gestionar puntos de entrega autorizados',
    to: ROUTES.ADMIN.DELIVERY_POINTS,
    iconSrc: logoEditarPuntos,
  },
  {
    label: 'Autenticar usuario',
    to: ROUTES.ADMIN.AUTHENTICATE_USER,
    iconSrc: logoAutenticar,
  },
] as const;

/**
 * Responsive navigation sidebar for the Tequio administrator panel.
 * Highlights the active option with an elevated white card and renders
 * the cropped Tequio weave mark at the bottom-left corner on desktop.
 */
export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userName = 'Daniel',
  avatarUrl,
  onLogout,
}) => {
  return (
    <aside className={styles.sidebar} aria-label="Menú de administración">
      <div className={styles.topGroup}>
        <div className={styles.profileSection}>
          <div className={styles.avatarCircle}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`Foto de ${userName}`}
                className={styles.avatarImage}
              />
            ) : (
              <User
                className={styles.avatarIcon}
                color="#ffffff"
                aria-hidden="true"
              />
            )}
          </div>
          <div className={styles.profileText}>
            <p className={styles.greeting}>Hola, {userName}</p>
            <p className={styles.roleLabel}>Administrador</p>
          </div>
        </div>

        <nav className={styles.navList}>
          {ADMIN_NAV_OPTIONS.map((option) => (
            <NavLink
              key={option.to}
              to={option.to}
              title={option.label}
              aria-label={option.label}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`.trim()
              }
            >
              <span className={styles.iconWrapper} aria-hidden="true">
                <img
                  src={option.iconSrc}
                  alt=""
                  className={styles.iconImage}
                />
              </span>
              <span className={styles.navLabel}>{option.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={styles.bottomGroup}>
        <div className={styles.logoutSection}>
          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión de administrador"
            className={styles.navItem}
          >
            <span className={styles.iconWrapper} aria-hidden="true">
              <img
                src={logoCerrarSesion}
                alt=""
                className={styles.iconImage}
              />
            </span>
            <span className={styles.navLabel}>Cerrar sesión</span>
          </button>
        </div>
      </div>

      <img
        src={logoTequio}
        alt=""
        aria-hidden="true"
        className={styles.bottomWatermark}
      />
    </aside>
  );
};

export default AdminSidebar;