"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Cropper, { type Area } from "react-easy-crop";
import { UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { getCroppedImageFile } from "@/lib/cropImage";
import { removeProfilePhoto, uploadProfilePhoto } from "@/services/account";
import type { User } from "@/types/user";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function ProfilePhotoUpload({
  user,
  onUpdated,
}: {
  user: User;
  onUpdated: (user: User) => void;
}) {
  const t = useTranslations("customer.profile");
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_SIZE_BYTES) {
      setError(t("photoUploadError"));
      return;
    }

    setError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRawImage(URL.createObjectURL(file));
  }

  async function handleSaveCrop() {
    if (!rawImage || !croppedArea) return;
    setSaving(true);
    setError(null);
    try {
      const file = await getCroppedImageFile(rawImage, croppedArea, "profile-photo.jpg", "image/jpeg");
      const { data } = await uploadProfilePhoto(file);
      onUpdated(data);
      setRawImage(null);
    } catch {
      setError(t("photoUploadError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      const { data } = await removeProfilePhoto();
      onUpdated(data);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {user.photo_url ? (
        <Image
          src={user.photo_url}
          alt={user.name}
          width={64}
          height={64}
          className="size-16 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-border text-text-secondary">
          <UserRound className="size-7" />
        </span>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={saving}>
            {t("changePhoto")}
          </Button>
          {user.photo_url && (
            <Button type="button" variant="secondary" onClick={handleRemove} disabled={saving}>
              {t("removePhoto")}
            </Button>
          )}
        </div>
        {error && <p className="font-body text-xs text-danger">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleFilePicked}
      />

      {rawImage && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 p-4">
          <p className="font-heading text-sm font-medium text-white">{t("cropTitle")}</p>
          <div className="relative h-72 w-72 max-w-full">
            <Cropper
              image={rawImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) => setCroppedArea(areaPixels)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setRawImage(null)} disabled={saving}>
              {t("cropCancel")}
            </Button>
            <Button onClick={handleSaveCrop} loading={saving}>
              {t("cropSave")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
