export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Renders the cropped region of `imageSrc` onto an offscreen canvas and returns it as a File. */
export function getCroppedImageFile(
  imageSrc: string,
  crop: PixelCrop,
  fileName: string,
  mimeType: string,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to encode cropped image"));
          return;
        }
        resolve(new File([blob], fileName, { type: mimeType }));
      }, mimeType);
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}
