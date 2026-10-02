import { useLayoutEffect, useRef } from "react";

// Below this the text is unreadable even when zoomed in, so the table scrolls sideways instead
const MIN_FIT = 0.5;

/**
 * Keeps a results table inside the screen width on phones: text, padding, pictures and
 * column widths all shrink together (through the --fit CSS variable used in index.css)
 * until every column is visible without sideways scrolling.
 */
export default function FitTable({ className = "", children }) {
  const boxRef = useRef(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const fit = () => {
      let scale = 1;
      box.style.setProperty("--fit", "1");
      // A few passes: borders do not shrink, so one pass can be slightly off
      for (let i = 0; i < 5; i++) {
        const needed = box.scrollWidth;
        const available = box.clientWidth;
        if (available <= 0 || needed <= available) break;
        scale = Math.max(MIN_FIT, Math.floor(scale * (available / needed) * 1000) / 1000);
        box.style.setProperty("--fit", String(scale));
        if (scale === MIN_FIT) break;
      }
    };

    fit();
    window.addEventListener("resize", fit);
    document.fonts?.ready?.then(fit);
    return () => window.removeEventListener("resize", fit);
  });

  return (
    <div ref={boxRef} className={`overflow-x-auto ${className}`}>
      {children}
    </div>
  );
}
