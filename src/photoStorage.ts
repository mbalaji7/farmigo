const prefix = "farmigo-photo:";
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
const maximumPhotoBytes = 10 * 1024 * 1024;
const minimumPhotoLongSide = 800;
const minimumPhotoShortSide = 600;
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("farmigo-photos", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("photos");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function savePhoto(file: File): Promise<string> {
  if (!allowedPhotoTypes.includes(file.type))
    throw new Error("Use JPG, PNG, or WebP photos.");
  if (file.size > maximumPhotoBytes)
    throw new Error("Each photo must be smaller than 10 MB.");
  const source = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("This image could not be opened."));
      image.src = source;
    });
    if (
      Math.max(image.width, image.height) < minimumPhotoLongSide ||
      Math.min(image.width, image.height) < minimumPhotoShortSide
    ) {
      throw new Error(
        "Use photos at least 800 × 600 pixels so the equipment stays clear.",
      );
    }
    const ratio = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Photo processing is unavailable.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value
            ? resolve(value)
            : reject(new Error("Photo could not be processed.")),
        "image/jpeg",
        0.82,
      ),
    );
    const db = await database();
    const id = crypto.randomUUID();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("photos", "readwrite");
      transaction.objectStore("photos").put(blob, id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
    return prefix + id;
  } finally {
    URL.revokeObjectURL(source);
  }
}
export async function resolvePhoto(src: string): Promise<string> {
  if (!src.startsWith(prefix)) return src;
  const db = await database();
  try {
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const request = db
        .transaction("photos")
        .objectStore("photos")
        .get(src.slice(prefix.length));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (!blob) throw new Error("Photo not found");
    return URL.createObjectURL(blob);
  } finally {
    db.close();
  }
}
export const isStoredPhoto = (src: string) => src.startsWith(prefix);
