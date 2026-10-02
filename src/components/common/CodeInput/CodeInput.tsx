import React, { useRef, useId } from 'react';
import styles from './CodeInput.module.css';

/**
 * Properties for the CodeInput component.
 */
export interface CodeInputProps {
  /**
   * Length of the code required.
   * @default 6
   */
  length?: number;
  /**
   * Current code value string.
   */
  value: string;
  /**
   * Callback fired when the entered code changes.
   */
  onChange: (code: string) => void;
  /**
   * Optional error message displayed below the input cells.
   */
  errorMessage?: string;
  /**
   * Disables all input cells.
   * @default false
   */
  disabled?: boolean;
  /**
   * Optional custom CSS class name.
   */
  className?: string;
}


export const CodeInput: React.FC<CodeInputProps> = ({
  length = 6,
  value,
  onChange,
  errorMessage,
  disabled = false,
  className = '',
}) => {
  const generatedId = useId();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length }, (_, index) => value[index] || '');

  const handleInputChange = (index: number, char: string) => {
    const numericChar = char.replace(/\D/g, '');
    if (!numericChar && char !== '') return;

    const newDigits = [...digits];
    newDigits[index] = numericChar.slice(-1); 

    const updatedCode = newDigits.join('');
    onChange(updatedCode);

    if (numericChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // If current is empty, focus previous and clear it
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;

    onChange(pastedData);

    const targetIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[targetIndex]?.focus();
  };

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <div className={styles.inputsWrapper} onPaste={handlePaste}>
        {digits.map((digit, index) => {
          const inputId = `${generatedId}-digit-${index}`;

          return (
            <input
              key={inputId}
              id={inputId}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              disabled={disabled}
              aria-label={`Dígito ${index + 1} de ${length}`}
              aria-invalid={Boolean(errorMessage)}
              className={`${styles.digitInput} ${
                errorMessage ? styles.inputError : ''
              }`.trim()}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
            />
          );
        })}
      </div>

      {errorMessage && (
        <span role="alert" className={styles.errorMessage}>
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default CodeInput;