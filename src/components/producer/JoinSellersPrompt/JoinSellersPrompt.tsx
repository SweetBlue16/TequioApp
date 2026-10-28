import React from 'react';
import producerNotRegisteredImage from '@/assets/images/producer/producerNotRegistered.png';
import styles from './JoinSellersPrompt.module.css';

interface SellerBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const BENEFIT_FREE: SellerBenefit = {
  id: 'free',
  icon: '🏷️',
  title: 'Sin costo ni mensualidades',
  description: 'Abrir tu espacio y ofertar tus lotes no te cuesta nada. Sin comisiones ocultas.',
};

const BENEFIT_FAIR_PRICE: SellerBenefit = {
  id: 'fair-price',
  icon: '📦',
  title: 'Precio justo garantizado',
  description: 'Tú estableces el valor de tu cosecha sin que intermediarios castiguen tu trabajo.',
};

const BENEFIT_NO_WASTE: SellerBenefit = {
  id: 'no-waste',
  icon: '🤝',
  title: 'Cero merma de producto',
  description: 'Solo preparas paquetes cuando la meta comunitaria mínima ya está asegurada.',
};

export interface JoinSellersPromptProps {
  onStartOnboarding: () => void;
}

export const JoinSellersPrompt: React.FC<JoinSellersPromptProps> = ({
  onStartOnboarding,
}) => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.illustrationContainer}>
        <img
          src={producerNotRegisteredImage}
          alt="Comunidad de artesanos y productores de Tequio"
          className={styles.illustrationImage}
        />
      </div>

      <div className={styles.contentContainer}>
        <header className={styles.headerSection}>
          <h1 className={styles.title}>“¿Deseas unirte al grupo de vendedores?”</h1>
          <p className={styles.subtitle}>
            Comercializa tus productos sin intermediarios, con respaldo comunitario y precios justos.
          </p>
        </header>

        <section className={styles.cardsLayout} aria-label="Beneficios de unirse como vendedor">
          <div className={styles.columnOne}>
            <article className={styles.benefitCard}>
              <span className={styles.benefitIconWrapper} aria-hidden="true">
                {BENEFIT_FREE.icon}
              </span>
              <h2 className={styles.benefitTitle}>{BENEFIT_FREE.title}</h2>
              <p className={styles.benefitDescription}>{BENEFIT_FREE.description}</p>
            </article>
          </div>

          <div className={styles.columnTwo}>
            <article className={styles.benefitCard}>
              <span className={styles.benefitIconWrapper} aria-hidden="true">
                {BENEFIT_FAIR_PRICE.icon}
              </span>
              <h2 className={styles.benefitTitle}>{BENEFIT_FAIR_PRICE.title}</h2>
              <p className={styles.benefitDescription}>{BENEFIT_FAIR_PRICE.description}</p>
            </article>

            <article className={styles.benefitCard}>
              <span className={styles.benefitIconWrapper} aria-hidden="true">
                {BENEFIT_NO_WASTE.icon}
              </span>
              <h2 className={styles.benefitTitle}>{BENEFIT_NO_WASTE.title}</h2>
              <p className={styles.benefitDescription}>{BENEFIT_NO_WASTE.description}</p>
            </article>
          </div>
        </section>

        <div className={styles.actionWrapper}>
          <button
            type="button"
            onClick={onStartOnboarding}
            className={styles.registerButton}
          >
            Darme de alta como vendedor gratis
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinSellersPrompt;