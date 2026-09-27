import { useLayoutEffect, useRef } from "react";

const READABLE_FONT_PX = 8;

/**
 * Keeps its children on ONE line on every screen: the font shrinks until the row fits
 * (children are sized in em, so padding and gaps shrink with it). If the dates would get
 * smaller than a readable size, they switch to the short form (day-month) first.
 * Children can render both forms with <FitDate full="26-09-2026" short="26-09" />.
 */
export default function FitRow({ className = "", children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const shrinkToFit = () => {
      inner.style.fontSize = "";
      const cs = getComputedStyle(outer);
      const available = outer.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (available <= 0) return null;
      // A few passes: borders do not scale with the font, so one pass can be slightly off
      for (let i = 0; i < 4; i++) {
        const needed = inner.offsetWidth;
        if (needed <= available) break;
        const current = parseFloat(getComputedStyle(inner).fontSize);
        inner.style.fontSize = `${Math.floor(current * (available / needed) * 100) / 100}px`;
      }
      return parseFloat(getComputedStyle(inner).fontSize);
    };

    const fit = () => {
      inner.classList.remove("is-compact");
      const size = shrinkToFit();
      if (size !== null && size < READABLE_FONT_PX) {
        inner.classList.add("is-compact");
        shrinkToFit();
      }
    };

    fit();
    window.addEventListener("resize", fit);
    document.fonts?.ready?.then(fit);
    return () => window.removeEventListener("resize", fit);
  });

  return (
    <div ref={outerRef} className={`flex justify-center overflow-hidden ${className}`}>
      <div ref={innerRef} className="fit-row inline-flex flex-nowrap items-center shrink-0">
        {children}
      </div>
    </div>
  );
}

export function FitDate({ full, short }) {
  return (
    <>
      <span className="fit-full">{full}</span>
      <span className="fit-short">{short}</span>
    </>
  );
}
