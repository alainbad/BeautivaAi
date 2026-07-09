import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

/**
 * Capture or pick a photo and resolve it as a `data:image/...;base64,...`
 * URL — the shape both the skin-analysis and progress-photo server
 * functions expect. Uses the native Camera plugin on iOS; falls back to a
 * plain file input in the browser.
 */
export async function captureImageDataUrl(source: "camera" | "library"): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
      quality: 80,
      width: 1024,
      correctOrientation: true,
    });
    if (!photo.dataUrl) throw new Error("No photo was captured.");
    return photo.dataUrl;
  }
  return pickWebImage(source);
}

function pickWebImage(source: "camera" | "library"): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (source === "camera") input.capture = "user";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error("No file selected."));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
      reader.readAsDataURL(file);
    };
    input.click();
  });
}
