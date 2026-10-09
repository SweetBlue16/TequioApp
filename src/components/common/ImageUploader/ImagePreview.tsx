import { useEffect, useState } from 'react';
import type { FC, MouseEvent } from 'react';
import styles from './ImageUploader.module.css';

interface ImagePreviewAttributes {
  file: File;
  onRemove: () => void;
  onChangeImage: () => void;
}

export const ImagePreview: FC<ImagePreviewAttributes> = ({
  file,
  onRemove,
  onChangeImage,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleRemoveClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onRemove();
  };

  const handleChangeClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onChangeImage();
  };

  if (!previewUrl) return null;

  return (
    <div className={styles.previewContainer}>
      <img
        src={previewUrl}
        alt={file.name}
        className={styles.previewImg}
      />

      <div className={styles.previewOverlay}>
        <button
          type="button"
          onClick={handleRemoveClick}
          className={styles.removeButton}
          title="Eliminar imagen"
          aria-label="Eliminar imagen"
        >
          ✕
        </button>

        <button
          type="button"
          onClick={handleChangeClick}
          className={styles.changeButton}
        >
          Cambiar imagen
        </button>

        <span className={styles.filename} title={file.name}>
          {file.name}
        </span>
      </div>
    </div>
  );
};