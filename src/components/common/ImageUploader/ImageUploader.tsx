import { useRef, useState } from 'react';
import type { FC, DragEvent, ChangeEvent, KeyboardEvent } from 'react';
import { ImagePreview } from './ImagePreview';
import logoImagenes from '../../../assets/images/logo_imagenes.png';
import styles from './ImageUploader.module.css';

// 5 MB size limit strictly enforced by RN-12
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ImageUploaderAttributes {
  file: File | null;
  onChange: (file: File | null) => void;
  showErrorToast: (message: string) => void;
  showSuccessToast?: (message: string) => void;
}

export const ImageUploader: FC<ImageUploaderAttributes> = ({
  file,
  onChange,
  showErrorToast,
  showSuccessToast,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File): boolean => {
    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
      showErrorToast('Formato no permitido. Solo se aceptan imágenes JPG, JPEG o PNG.');
      return false;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      showErrorToast('El archivo supera el tamaño máximo permitido de 5MB.');
      return false;
    }

    return true;
  };

  const handleFileSelection = (files: FileList | null): void => {
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    if (validateFile(selectedFile)) {
      onChange(selectedFile);
      if (showSuccessToast) {
        showSuccessToast('Imagen cargada correctamente.');
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleTriggerInput();
    }
  };

  return (
    <div className={styles.wrapper}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={ALLOWED_MIME_TYPES.join(',')}
        className={styles.hiddenInput}
      />

      {file ? (
        <ImagePreview
          file={file}
          onRemove={handleRemove}
          onChangeImage={handleTriggerInput}
        />
      ) : (
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerInput}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <img
            src={logoImagenes}
            alt="Upload media icon"
            className={styles.dropzoneIcon}
          />

          <p className={styles.primaryText}>
            <span className={styles.ctaLink}>Clic para subir</span> o arrastra y suelta una imagen
          </p>

          <p className={styles.helperText}>
            JPG, JPEG, PNG menos de 5MB
          </p>
        </div>
      )}
    </div>
  );
};