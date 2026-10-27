import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ProducerSidebar } from '@/components/layout/ProducerSidebar';
import { JoinSellersPrompt } from '@/components/producer/JoinSellersPrompt';
import styles from './ProducerLayout.module.css';

/**
 * Layout orchestrator for the seller panel.
 * Conditionally displays the sidebar navigation if the user holds a seller role,
 * or redirects visual presentation to JoinSellersPrompt if buyer/unregistered.
 */
export const Producer: React.FC = () => {
  const [isProducer, setIsProducer] = useState<boolean>(() => {
    return localStorage.getItem('mock_is_producer') === 'true';
  });

  const handleToggleRole = () => {
    const nextState = !isProducer;
    setIsProducer(nextState);
    localStorage.setItem('mock_is_producer', String(nextState));
  };

  return (
    <div className={styles.layoutRoot}>
      {/* Botón flotante para alternar vistas sin requerir login en el backend */}
      <aside className={styles.mockControl} aria-label="Control de pruebas de desarrollo">
        <span>
          Modo: <strong>{isProducer ? 'Vendedor Activo' : 'Comprador (No Vendedor)'}</strong>
        </span>
        <button
          type="button"
          onClick={handleToggleRole}
          className={styles.mockButton}
        >
          Alternar rol
        </button>
      </aside>

      {/* Renderizado condicional según el rol */}
      {!isProducer ? (
        <JoinSellersPrompt />
      ) : (
        <div className={styles.producerContainer}>
          <ProducerSidebar />
          <main className={styles.contentArea}>
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
};

export default Producer;