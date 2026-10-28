import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ProducerSidebar } from '@/components/layout/ProducerSidebar';
import { JoinSellersPrompt } from '@/components/producer/JoinSellersPrompt';
import { BecomeSellerModal } from '@/components/producer/BecomeSellerModal';
import { Toast } from '@/components/common/Toast';
import { useSession } from '@/contexts/AuthContext';
import styles from './Producer.module.css';

/**
 * Layout orchestrator for the seller panel.
 * Conditionally displays sidebar navigation if the user holds a seller role,
 * or guides non-seller users through community seller terms agreement.
 */
export const Producer: React.FC = () => {
  const { session, profileService, refreshProfile } = useSession();
  const isProducerInSession = session?.roleId === 2;
  const [hasPromotedInCurrentSession, setHasPromotedInCurrentSession] = useState<boolean>(false);

  const isProducer = isProducerInSession || hasPromotedInCurrentSession;

  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenTermsModal = (): void => {
    setIsTermsModalOpen(true);
  };

  const handleCloseTermsModal = (): void => {
    if (isSubmitting) return;
    setIsTermsModalOpen(false);
  };

  const handleConfirmSellerActivation = async (): Promise<void> => {
    if (!profileService) {
      setToastMessage('La sesión no está lista. Inicia sesión nuevamente.');
      return;
    }

    try {
      setIsSubmitting(true);
      await profileService.becomeProducer();

      if (refreshProfile) {
        await refreshProfile();
      }

      setHasPromotedInCurrentSession(true);
      setIsTermsModalOpen(false);
    } catch (error) {
      console.error('Error al promover a productor:', error);
      setToastMessage('Ocurrió un error al activar tu cuenta de vendedor. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.layoutRoot}>
      {!isProducer ? (
        <JoinSellersPrompt onStartOnboarding={handleOpenTermsModal} />
      ) : (
        <div className={styles.producerContainer}>
          <ProducerSidebar />
          <main className={styles.contentArea}>
            <Outlet />
          </main>
        </div>
      )}

      <BecomeSellerModal
        isOpen={isTermsModalOpen}
        onClose={handleCloseTermsModal}
        onConfirm={handleConfirmSellerActivation}
        isSubmitting={isSubmitting}
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          variant="error"
          duration={5000}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default Producer;