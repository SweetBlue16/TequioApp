import React from 'react';
import { NavLink } from 'react-router-dom';
import iconProductos from '@/assets/icons/navbarProducer/icon_navbarProducerProductos.png';
import iconLotes from '@/assets/icons/navbarProducer/icon_navbarProducerLotes.png';
import iconEstadisticas from '@/assets/icons/navbarProducer/icon_navbarProducerEstadisticas.png';
import iconValidar from '@/assets/icons/navbarProducer/icon_navbarProducerValidar.png';

import styles from './ProducerSidebar.module.css';

/**
 * Navigation item specification for the producer control panel.
 */
export interface ProducerSideBarItem {
  id: string;
  label: string;
  path: string;
  iconSrc: string;
}

/**
 * Static configuration of producer navigation routes.
 */
const PRODUCER_NAV_ITEMS: readonly ProducerSideBarItem[] = [
  {
    id: 'products',
    label: 'Mis productos',
    path: '/panel-vendedor/productos',
    iconSrc: iconProductos,
  },
  {
    id: 'batches',
    label: 'Mis lotes',
    path: '/panel-vendedor/lotes',
    iconSrc: iconLotes,
  },
  {
    id: 'statistics',
    label: 'Consultar estadísticas',
    path: '/panel-vendedor/estadisticas',
    iconSrc: iconEstadisticas,
  },
  {
    id: 'validate',
    label: 'Validar entrega',
    path: '/panel-vendedor/validar-entrega',
    iconSrc: iconValidar,
  },
] as const;

/**
 * Properties for the ProducerSidebar component.
 */
export interface ProducerSidebarProps {
  /** Optional custom CSS class name for layout overrides */
  className?: string;
}

/**
 * Adaptive sidebar for the agricultural and artisan producer panel.
 * Complies with WCAG 2.5.5 touch target sizes and fluid responsiveness.
 */
export const ProducerSidebar: React.FC<ProducerSidebarProps> = ({ className = '' }) => {
  return (
    <nav
      className={`${styles.navigation} ${className}`.trim()}
      aria-label="Navegación del panel de productor"
    >
      <ul className={styles.navList}>
        {PRODUCER_NAV_ITEMS.map((item) => (
          <li key={item.id} className={styles.navItem}>
            <NavLink
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                [
                  styles.navLink,
                  isActive ? styles.navLinkActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span className={styles.iconWrapper} aria-hidden="true">
                    <img
                      src={item.iconSrc}
                      alt=""
                      className={styles.iconImage}
                    />
                  </span>
                  <span className={styles.labelText}>{item.label}</span>
                  {isActive && (
                    <span
                      className={styles.activeIndicator}
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ProducerSidebar;