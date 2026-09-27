import { useRef, useState } from "react";

import { BANNER_W, BANNER_H, MAX_ZOOM, DESKTOP_VISIBLE, clamp, coverage, clampCenter } from "../utils/bannerCrop";

const FRAME_RATIO = BANNER_W / BANNER_H;
// The stage is as wide as the frame (the picture always reaches both edges) and, for pictures
// taller than the banner, higher than the frame, so the rest stays visible (dimmed) above and
// below it. This limits how much higher it can get.
const TALLEST_STAGE = 0.64;

/**
 * Picture editor like the one for profile / cover photos: the picture lies on a dark stage
 * with a bright banner-shaped frame on top. Drag to move the picture, zoom with the slider,
 * the mouse wheel or a two-finger pinch. What is inside the frame is what gets uploaded.
 * `crop` = { zoom, center: { x, y } } (centre of the frame as a fraction of the image).
 */
export default function BannerCropper({ src, crop, onChange, imageRef }) {
  const frameRef = useRef(null);
  const pointers = useRef(new Map());
  const pinchStart = useRef(null);
  const [imageRatio, setImageRatio] = useState(null);
  const [dragging, setDragging] = useState(false);

  const stageRatio = clamp(imageRatio || FRAME_RATIO, FRAME_RATIO * TALLEST_STAGE, FRAME_RATIO);
  const cover = imageRatio ? coverage(imageRatio, crop.zoom) : null;
  const center = cover ? clampCenter(crop.center, cover) : crop.center;

  // Always builds on the newest value: several drag events can arrive before the next render
  const change = (fn) => {
    if (!imageRatio) return;
    onChange((prev) => {
      const next = fn(prev);
      const zoom = clamp(next.zoom, 1, MAX_ZOOM);
      return { zoom, center: clampCenter(next.center, coverage(imageRatio, zoom)) };
    });
  };
  const zoomTo = (fn) => change((prev) => ({ zoom: fn(prev.zoom), center: prev.center }));

  const pinchDistance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e) => {
    // Keeps the drag going when the finger / mouse leaves the frame
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // pointer already gone: dragging inside the frame still works
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) pinchStart.current = { distance: pinchDistance(), zoom: crop.zoom };
    setDragging(true);
  };

  const onPointerMove = (e) => {
    const last = pointers.current.get(e.pointerId);
    if (!last) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const start = pinchStart.current;
      const ratio = pinchDistance() / start.distance;
      zoomTo(() => start.zoom * ratio);
      return;
    }
    const dx = (e.clientX - last.x) / frameRef.current.clientWidth;
    const dy = (e.clientY - last.y) / frameRef.current.clientHeight;
    change((prev) => {
      const size = coverage(imageRatio, prev.zoom);
      return {
        zoom: prev.zoom,
        center: { x: prev.center.x - dx / size.w, y: prev.center.y - dy / size.h },
      };
    });
  };

  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    pinchStart.current = null;
    if (pointers.current.size === 0) setDragging(false);
  };

  const onWheel = (e) => zoomTo((z) => z * (e.deltaY < 0 ? 1.08 : 1 / 1.08));

  return (
    <div>
      {/* Stage: the whole picture stays visible (dimmed); the bright frame is what gets used */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        className={`relative w-full overflow-hidden rounded-xl bg-slate-900 select-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ aspectRatio: stageRatio, touchAction: "none" }}
      >
        <div
          ref={frameRef}
          className="absolute left-0 w-full top-1/2 -translate-y-1/2"
          style={{ aspectRatio: `${BANNER_W} / ${BANNER_H}` }}
        >
          <img
            ref={imageRef}
            src={src}
            alt="Banner preview"
            draggable={false}
            onLoad={(e) => setImageRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
            className="absolute max-w-none pointer-events-none"
            style={
              cover
                ? {
                    width: `${cover.w * 100}%`,
                    height: `${cover.h * 100}%`,
                    left: `${(0.5 - center.x * cover.w) * 100}%`,
                    top: `${(0.5 - center.y * cover.h) * 100}%`,
                  }
                : { visibility: "hidden" }
            }
          />
          {/* The frame: everything outside it is dimmed by its huge shadow */}
          <div
            className="absolute inset-0 border-y-2 border-white pointer-events-none"
            style={{ boxShadow: "0 0 0 2000px rgba(15, 23, 42, 0.62)" }}
          />
          {/* Computers trim the top and bottom: between the two lines is what they show */}
          {[(1 - DESKTOP_VISIBLE) / 2, (1 + DESKTOP_VISIBLE) / 2].map((at) => (
            <div
              key={at}
              className="absolute left-0 right-0 border-t border-dashed border-white/80 pointer-events-none"
              style={{ top: `${at * 100}%` }}
            />
          ))}
        </div>
      </div>

      <p className="text-[11px] leading-snug text-slate-500 text-center mt-2">
        Drag to move. The bright frame is the banner; computers show the part between the dotted lines.
      </p>

      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={() => zoomTo((z) => z - 0.1)}
          className="w-9 h-9 shrink-0 rounded-lg border border-slate-300 text-slate-600 text-lg font-bold hover:bg-slate-50"
          aria-label="Zoom out"
        >
          −
        </button>
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={crop.zoom}
          onChange={(e) => zoomTo(() => Number(e.target.value))}
          className="w-full accent-[#122654]"
          aria-label="Zoom"
        />
        <button
          type="button"
          onClick={() => zoomTo((z) => z + 0.1)}
          className="w-9 h-9 shrink-0 rounded-lg border border-slate-300 text-slate-600 text-lg font-bold hover:bg-slate-50"
          aria-label="Zoom in"
        >
          +
        </button>
      </div>
    </div>
  );
}
