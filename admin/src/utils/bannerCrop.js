// Shape of the banner on the site (phones show exactly this), and the size of the uploaded image
export const BANNER_W = 1920;
export const BANNER_H = 720;
const FRAME_RATIO = BANNER_W / BANNER_H;
export const MAX_ZOOM = 4;

// Computers show the banner as a wide strip (400px high), so its top and bottom are trimmed
// there. This is the share of the frame's height that stays visible on a typical 1440px screen.
export const DESKTOP_VISIBLE = 400 / (1440 / FRAME_RATIO);

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/** How large the image is compared to the frame (1 = exactly the frame's width / height). */
export function coverage(imageRatio, zoom) {
  return {
    w: zoom * Math.max(1, imageRatio / FRAME_RATIO),
    h: zoom * Math.max(1, FRAME_RATIO / imageRatio),
  };
}

/** Keeps the frame fully covered: the centre cannot move closer to an edge than half a frame. */
export function clampCenter(center, cover) {
  return {
    x: clamp(center.x, 0.5 / cover.w, 1 - 0.5 / cover.w),
    y: clamp(center.y, 0.5 / cover.h, 1 - 0.5 / cover.h),
  };
}

/** Draws the part of the image inside the frame and returns it as a JPEG file. */
export function cropBanner(image, crop) {
  const zoom = clamp(crop.zoom, 1, MAX_ZOOM);
  const cover = coverage(image.naturalWidth / image.naturalHeight, zoom);
  const center = clampCenter(crop.center, cover);

  const canvas = document.createElement("canvas");
  canvas.width = BANNER_W;
  canvas.height = BANNER_H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, BANNER_W, BANNER_H);
  ctx.drawImage(
    image,
    (0.5 - center.x * cover.w) * BANNER_W,
    (0.5 - center.y * cover.h) * BANNER_H,
    cover.w * BANNER_W,
    cover.h * BANNER_H
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(new File([blob], `banner-${Date.now()}.jpg`, { type: "image/jpeg" }))
          : reject(new Error("Could not prepare the image")),
      "image/jpeg",
      0.9
    );
  });
}
