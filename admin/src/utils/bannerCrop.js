// Shape of the banner on the site, and the size of the image that gets uploaded
export const BANNER_W = 1920;
export const BANNER_H = 800;
const FRAME_RATIO = BANNER_W / BANNER_H;
export const MAX_ZOOM = 4;
// Shown behind the picture when it is zoomed out and no longer fills the whole frame
export const FILL_COLOR = "#0b1220";

// Computers show the banner as a wide strip (400px high), so its top and bottom are trimmed
// there. This is the share of the frame's height that stays visible on a typical 1440px screen.
export const DESKTOP_VISIBLE = 400 / (1440 / FRAME_RATIO);

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/** Zoom 1 fills the frame. The smallest zoom shows the whole picture inside the frame. */
export function minZoom(imageRatio) {
  return Math.min(imageRatio / FRAME_RATIO, FRAME_RATIO / imageRatio);
}

/** How large the image is compared to the frame (1 = exactly the frame's width / height). */
export function coverage(imageRatio, zoom) {
  return {
    w: zoom * Math.max(1, imageRatio / FRAME_RATIO),
    h: zoom * Math.max(1, FRAME_RATIO / imageRatio),
  };
}

// Larger than the frame: it must keep covering it. Smaller: it stays centred.
const clampAxis = (value, size) => (size <= 1 ? 0.5 : clamp(value, 0.5 / size, 1 - 0.5 / size));

export function clampCenter(center, cover) {
  return { x: clampAxis(center.x, cover.w), y: clampAxis(center.y, cover.h) };
}

/** Draws the frame exactly as shown in the preview and returns it as a JPEG file. */
export function cropBanner(image, crop) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const zoom = clamp(crop.zoom, minZoom(imageRatio), MAX_ZOOM);
  const cover = coverage(imageRatio, zoom);
  const center = clampCenter(crop.center, cover);

  const canvas = document.createElement("canvas");
  canvas.width = BANNER_W;
  canvas.height = BANNER_H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = FILL_COLOR;
  ctx.fillRect(0, 0, BANNER_W, BANNER_H);

  if (cover.w < 1 || cover.h < 1) {
    // Empty sides: fill them with a blurred, darkened copy of the picture (where supported)
    const fill = coverage(imageRatio, 1);
    ctx.save();
    ctx.filter = "blur(40px) brightness(0.6)";
    ctx.drawImage(
      image,
      (0.5 - fill.w * 0.55) * BANNER_W,
      (0.5 - fill.h * 0.55) * BANNER_H,
      fill.w * 1.1 * BANNER_W,
      fill.h * 1.1 * BANNER_H
    );
    ctx.restore();
  }

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
