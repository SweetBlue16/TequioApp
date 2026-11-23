import { useId, useRef, useState } from 'react';
import type { FC, DragEvent, ChangeEvent } from 'react';
import { ImagePreview } from './ImagePreview';
import logoImagenes from '../../../assets/images/logo_imagenes.png';
import styles from './ImageUploader.module.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ImageUploaderAttributes {
  inputId?: string;
  labelId?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  showErrorToast: (message: string) => void;
  showSuccessToast?: (message: string) => void;
}

export const ImageUploader: FC<ImageUploaderAttributes> = ({
  inputId,
  labelId,
  file,
  onChange,
  showErrorToast,
  showSuccessToast,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const uploadActionId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File): boolean => {
    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
      showErrorToast('Formato no permitido. Solo se aceptan imágenes JPG, PNG o WebP.');
      return false;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      showErrorToast('El archivo supera el tamaño máximo permitido de 5MB.');
      return false;
    }

    return true;
  };

  const handleFileSelection = (files: FileList | null): void => {
    if (!files || files.length === 0) {
      return;
    }

    const selectedFile = files[0];
    if (validateFile(selectedFile)) {
      onChange(selectedFile);
      if (showSuccessToast) {
        showSuccessToast('Imagen cargada correctamente.');
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    handleFileSelection(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerInput = (): void => {
    fileInputRef.current?.click();
  };

  const handleRemove = (): void => {
    onChange(null);
  };

  return (
    <div className={styles.wrapper}>
      <input
        id={inputId}
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={ALLOWED_MIME_TYPES.join(',')}
        className={styles.hiddenInput}
      />

      {file ? (
        <ImagePreview file={file} onRemove={handleRemove} onChangeImage={handleTriggerInput} />
      ) : (
        <button
          type="button"
          aria-labelledby={labelId ? `${labelId} ${uploadActionId}` : undefined}
          className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerInput}
        >
          <img src={logoImagenes} alt="" className={styles.dropzoneIcon} />

          <span className={styles.primaryText}>
            <span id={uploadActionId} className={styles.ctaLink}>
              Clic para subir
            </span>{' '}
            o arrastra y suelta una imagen
          </span>

          <span className={styles.helperText}>JPG, PNG o WebP, máximo 5 MiB</span>
        </button>
      )}
    </div>
  );
};
