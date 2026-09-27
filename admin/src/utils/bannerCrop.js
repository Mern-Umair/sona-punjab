// Shape of the banner on the site, and the size of the image that gets uploaded
export const BANNER_W = 1920;
export const BANNER_H = 700;
const FRAME_RATIO = BANNER_W / BANNER_H;
export const MAX_ZOOM = 4;

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

/** Draws the part of the image visible in the frame and returns it as a JPEG file. */
export function cropBanner(image, crop) {
  const cover = coverage(image.naturalWidth / image.naturalHeight, crop.zoom);
  const center = clampCenter(crop.center, cover);
  const sw = image.naturalWidth / cover.w;
  const sh = image.naturalHeight / cover.h;
  const sx = center.x * image.naturalWidth - sw / 2;
  const sy = center.y * image.naturalHeight - sh / 2;

  const canvas = document.createElement("canvas");
  canvas.width = BANNER_W;
  canvas.height = BANNER_H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, BANNER_W, BANNER_H);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, BANNER_W, BANNER_H);

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
