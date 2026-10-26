/** Client-side check that mirrors UploadDesignFileRequest (png/svg, max 20MB) so a bad file gets a clear message before any upload. */
export const DESIGN_FILE_TYPES = ["image/png", "image/svg+xml"];
export const DESIGN_FILE_MAX_BYTES = 20 * 1024 * 1024;

export function isValidDesignFile(file: File): boolean {
  return DESIGN_FILE_TYPES.includes(file.type) && file.size <= DESIGN_FILE_MAX_BYTES;
}

/** Error key under `creator.uploadDesign` for a file that fails the checks above, or null when it is fine. */
export function designFileError(file: File): "fileTypeError" | "fileSizeError" | null {
  if (!DESIGN_FILE_TYPES.includes(file.type)) return "fileTypeError";
  if (file.size > DESIGN_FILE_MAX_BYTES) return "fileSizeError";
  return null;
}
