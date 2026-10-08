import React from 'react';
import { Check } from 'lucide-react';
import styles from './Stepper.module.css';

/**
 * Step configuration metadata.
 */
export interface StepDefinition {
  /**
   * Numeric step order identifier (1-based).
   */
  stepNumber: number;
  /**
   * Visible descriptive title shown below the circle.
   */
  label: string;
}

/**
 * Properties for the Stepper component.
 */
export interface StepperProps {
  /**
   * List of step definitions to display.
   */
  steps: StepDefinition[];
  /**
   * Active step number (1-based index).
   */
  currentStep: number;
  /**
   * Optional callback triggered when navigating to an already completed step.
   */
  onStepClick?: (stepNumber: number) => void;
  /**
   * Optional custom CSS class name.
   */
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  const totalSteps = steps.length;
  const progressPercentage =
    totalSteps > 1
      ? ((Math.min(currentStep, totalSteps) - 1) / (totalSteps - 1)) * 100
      : 0;

  return (
    <nav
      className={`${styles.stepperContainer} ${className}`.trim()}
      aria-label="Progreso del formulario"
    >
      <div className={styles.connectorLine} aria-hidden="true">
        <div
          className={styles.connectorProgress}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {steps.map((step) => {
        const isCompleted = step.stepNumber < currentStep;
        const isActive = step.stepNumber === currentStep;
        const isClickable = Boolean(onStepClick && isCompleted);

        const stepStateClass = isCompleted
          ? styles.completed
          : isActive
          ? styles.active
          : styles.pending;

        const handleClick = () => {
          if (isClickable && onStepClick) {
            onStepClick(step.stepNumber);
          }
        };

        return (
          <div
            key={step.stepNumber}
            className={`${styles.stepItem} ${stepStateClass} ${
              isClickable ? styles.stepClickable : ''
            }`.trim()}
            onClick={handleClick}
            role={isClickable ? 'button' : 'listitem'}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={(e) => {
              if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                handleClick();
              }
            }}
            aria-current={isActive ? 'step' : undefined}
          >
            <div className={styles.circle}>
              {isCompleted ? (
                <Check size={18} strokeWidth={3} aria-hidden="true" />
              ) : (
                <span>{step.stepNumber}</span>
              )}
            </div>
            <span className={styles.label}>{step.label}</span>
          </div>
        );
      })}
    </nav>
  );
};

export default Stepper;