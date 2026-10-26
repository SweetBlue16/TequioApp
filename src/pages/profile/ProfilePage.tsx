import { useState, type FormEvent } from 'react';
import { useSession } from '@/contexts/AuthContext';
import type { UpdateUserProfile, UserProfile } from '@/services/profile/ProfileService';
import InputField from '@/components/common/InputField';
import DateInputField from '@/components/common/DateInputField';
import Button from '@/components/common/Button';
import Toast from '@/components/common/Toast';
import { Avatar } from '@/components/common/Avatar';
import { ImageUploader } from '@/components/common/ImageUploader';
import styles from './ProfilePage.module.css';

type Notice = { message: string; variant: 'info' | 'error' };

function toForm(profile: UserProfile): UpdateUserProfile {
  return {
    firstName: profile.firstName,
    paternalLastName: profile.paternalLastName,
    maternalLastName: profile.maternalLastName ?? '',
    birthDate: profile.birthDate.slice(0, 10),
    phoneNumber: profile.phoneNumber ?? '',
    locality: profile.locality ?? '',
    biography: profile.biography ?? '',
  };
}

function validate(form: UpdateUserProfile): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [name, label] of [['firstName', 'El nombre'], ['paternalLastName', 'El apellido paterno']] as const) {
    if (!form[name].trim()) errors[name] = `${label} es obligatorio.`;
  }
  for (const [name, label, max] of [
    ['firstName', 'El nombre', 100], ['paternalLastName', 'El apellido paterno', 100],
    ['maternalLastName', 'El apellido materno', 100], ['phoneNumber', 'El teléfono', 20],
    ['locality', 'La localidad', 100],
  ] as const) {
    if ((form[name] ?? '').trim().length > max) errors[name] = `${label} no puede exceder ${max} caracteres.`;
  }
  const date = form.birthDate;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || parsed.getTime() > Date.now()) {
    errors.birthDate = 'Ingresa una fecha de nacimiento válida que no sea futura.';
  }
  return errors;
}

function ProfileForm({ profile, notify }: { profile: UserProfile; notify: (notice: Notice) => void }) {
  const { profileService, refreshProfile } = useSession();
  const [form, setForm] = useState<UpdateUserProfile>(() => toForm(profile));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const update = (name: keyof UpdateUserProfile, value: string) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: '' }));
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || uploading || !profileService) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      await profileService.updateProfile({
        firstName: form.firstName.trim(),
        paternalLastName: form.paternalLastName.trim(),
        maternalLastName: form.maternalLastName?.trim() || null,
        birthDate: `${form.birthDate}T00:00:00.000Z`,
        phoneNumber: form.phoneNumber?.trim() || null,
        locality: form.locality?.trim() || null,
        biography: form.biography?.trim() || null,
      });
      notify({ message: 'Perfil actualizado correctamente.', variant: 'info' });
      await refreshProfile();
    } catch {
      notify({ message: 'No se pudo completar la actualización o recargar el perfil. Consulta los datos antes de reintentar.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const upload = async () => {
    if (!file || uploading || saving || !profileService) return;
    setUploading(true);
    try {
      // Validate again in case a caller bypasses the uploader's selection checks.
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
        notify({ message: 'Selecciona una imagen JPG, PNG o WebP de máximo 5 MiB.', variant: 'error' });
        return;
      }
      const url = await profileService.uploadImage(file);
      await profileService.updatePicture(url);
      setFile(null);
      notify({ message: 'Fotografía actualizada correctamente.', variant: 'info' });
      await refreshProfile();
    } catch {
      notify({ message: 'No se pudo completar la carga o asociación de la foto. La fotografía anterior permanece visible.', variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <section className={styles.card} aria-labelledby="photo-heading">
        <h2 id="photo-heading">Fotografía</h2>
        <div className={styles.photoRow}>
          <Avatar src={profile.profilePictureUrl} altName={profile.firstName} size={88} />
          <p>Fotografía guardada</p>
        </div>
        <ImageUploader file={file} onChange={setFile} showErrorToast={(message) => notify({ message, variant: 'error' })} />
        <Button variant="terracotta" onClick={() => void upload()} disabled={!file || saving} isLoading={uploading}>Guardar fotografía</Button>
      </section>

      <section className={styles.card} aria-labelledby="data-heading">
        <h2 id="data-heading">Datos personales</h2>
        <form onSubmit={(event) => void save(event)} noValidate className={styles.form}>
          <InputField label="Nombre *" value={form.firstName} maxLength={101} onChange={(event) => update('firstName', event.target.value)} errorMessage={errors.firstName} />
          <InputField label="Apellido paterno *" value={form.paternalLastName} maxLength={101} onChange={(event) => update('paternalLastName', event.target.value)} errorMessage={errors.paternalLastName} />
          <InputField label="Apellido materno" value={form.maternalLastName ?? ''} maxLength={101} onChange={(event) => update('maternalLastName', event.target.value)} errorMessage={errors.maternalLastName} />
          <DateInputField label="Fecha de nacimiento *" value={form.birthDate} max={new Date().toISOString().slice(0, 10)} onChange={(event) => update('birthDate', event.target.value)} errorMessage={errors.birthDate} />
          <InputField label="Teléfono" value={form.phoneNumber ?? ''} maxLength={21} onChange={(event) => update('phoneNumber', event.target.value)} errorMessage={errors.phoneNumber} />
          <InputField label="Localidad" value={form.locality ?? ''} maxLength={101} onChange={(event) => update('locality', event.target.value)} errorMessage={errors.locality} />
          <label className={styles.field}>Biografía
            <textarea value={form.biography ?? ''} onChange={(event) => update('biography', event.target.value)} rows={4} />
          </label>
          <div className={styles.fullRow}><Button type="submit" variant="terracotta" disabled={uploading} isLoading={saving}>Guardar cambios</Button></div>
        </form>
      </section>

      <section className={styles.card} aria-labelledby="account-heading">
        <h2 id="account-heading">Datos de cuenta</h2>
        <dl className={styles.details}>
          <div><dt>Correo electrónico</dt><dd>{profile.email}</dd></div>
          <div><dt>Estado</dt><dd>{profile.isVerified ? 'Verificada' : 'Pendiente de verificación'}</dd></div>
          <div><dt>Registro</dt><dd>{new Date(profile.registrationDate).toLocaleDateString('es-MX')}</dd></div>
          <div><dt>ID</dt><dd>{profile.id}</dd></div>
        </dl>
      </section>
    </>
  );
}

export function ProfilePage() {
  const { profile, profileStatus, refreshProfile } = useSession();
  const [notice, setNotice] = useState<Notice | null>(null);

  return (
    <div className={styles.page}>
      <h1>Mi perfil</h1>
      {profileStatus === 'loading' && <p role="status">Cargando perfil…</p>}
      {profileStatus === 'error' && <div role="alert">No se pudo cargar el perfil. <button type="button" onClick={() => void refreshProfile().catch(() => undefined)}>Reintentar</button></div>}
      {!profile && profileStatus === 'ready' && <p>No hay datos de perfil disponibles.</p>}
      {profile && <ProfileForm key={JSON.stringify(profile)} profile={profile} notify={setNotice} />}
      {notice && <Toast message={notice.message} variant={notice.variant} duration={5000} onClose={() => setNotice(null)} />}
    </div>
  );
}
