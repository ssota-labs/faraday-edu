"use client";

export interface UploadedAttachment {
  url: string;
  name: string;
  mediaType: string;
}

/**
 * Chat image attachment — client-side data URL (no storage bucket yet).
 * Keeps the mirror-dimension composer UX; swap for Storage when P2 assets land.
 */
export async function uploadChatImage(
  _courseId: string,
  file: File,
): Promise<UploadedAttachment> {
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("upload failed"));
    reader.readAsDataURL(file);
  });
  return { url, name: file.name, mediaType: file.type || "image/png" };
}
