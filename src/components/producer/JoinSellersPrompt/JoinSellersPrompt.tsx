import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import producerNotRegisteredImage from '@/assets/images/producer/producerNotRegistered.png';
import styles from './JoinSellersPrompt.module.css';

/**
 * Benefit card item definition.
 */
interface SellerBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

/**
 * Static configuration of benefits matching the Figma mockup.
 */
const SELLER_BENEFITS: readonly SellerBenefit[] = [
  {
    id: 'free',
    icon: '🏷️',
    title: 'Sin costo ni mensualidades',
    description: 'Abrir tu espacio y ofertar tus lotes no te cuesta nada. Sin comisiones ocultas.',
  },
  {
    id: 'fair-price',
    icon: '📦',
    title: 'Precio justo garantizado',
    description: 'Tú estableces el valor de tu cosecha sin que intermediarios castiguen tu trabajo.',
  },
  {
    id: 'no-waste',
    icon: '🤝',
    title: 'Cero merma de producto',
    description: 'Solo preparas paquetes cuando la meta comunitaria mínima ya está asegurada.',
  },
] as const;

/**
 * Promotional landing component shown to non-seller users attempting to access the seller panel.
 * Anchors the artisan illustration strictly to the left edge on desktop viewports.
 */
export const JoinSellersPrompt: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate(ROUTES.AUTH.REGISTER);
  };

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

        <section className={styles.benefitsGrid} aria-label="Beneficios de unirse como vendedor">
          {SELLER_BENEFITS.map((benefit) => (
            <article key={benefit.id} className={styles.benefitCard}>
              <span className={styles.benefitIconWrapper} aria-hidden="true">
                {benefit.icon}
              </span>
              <h2 className={styles.benefitTitle}>{benefit.title}</h2>
              <p className={styles.benefitDescription}>{benefit.description}</p>
            </article>
          ))}
        </section>

        <div className={styles.actionWrapper}>
          <button
            type="button"
            onClick={handleRegisterClick}
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