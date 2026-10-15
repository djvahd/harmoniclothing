/** Client-side check that mirrors UploadDesignFileRequest (png/svg, max 20MB) so a bad file gets a clear message before any upload. */
export const DESIGN_FILE_TYPES = ["image/png", "image/svg+xml"];
export const DESIGN_FILE_MAX_BYTES = 20 * 1024 * 1024;

export function isValidDesignFile(file: File): boolean {
  return DESIGN_FILE_TYPES.includes(file.type) && file.size <= DESIGN_FILE_MAX_BYTES;
}
