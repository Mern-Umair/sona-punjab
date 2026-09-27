import { useLayoutEffect, useRef } from "react";

/**
 * Keeps its children on ONE line on every screen: the font shrinks until the row fits
 * (children are sized in em, so padding and gaps shrink with it). When it has to shrink,
 * the buttons also get tighter padding first so the text stays as large as possible.
 */
export default function FitRow({ className = "", children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const fit = () => {
      inner.style.fontSize = "";
      inner.classList.remove("is-tight");
      const cs = getComputedStyle(outer);
      const available = outer.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (available <= 0 || inner.offsetWidth <= available) return;
      inner.classList.add("is-tight");
      // A few passes: borders do not scale with the font, so one pass can be slightly off
      for (let i = 0; i < 4; i++) {
        const needed = inner.offsetWidth;
        if (needed <= available) break;
        const current = parseFloat(getComputedStyle(inner).fontSize);
        inner.style.fontSize = `${Math.floor(current * (available / needed) * 100) / 100}px`;
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
