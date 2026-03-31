import { useEffect } from "react";

let stableWidth = 0;
let stableHeight = 0;

const setViewportVars = (reset = false) => {
  const root = document.documentElement;
  const vv = window.visualViewport;

  const currentWidth = Math.round(window.innerWidth);
  const currentHeight = Math.round(window.innerHeight);
  const visualHeight = Math.round(vv?.height ?? currentHeight);

  if (reset || stableWidth === 0 || stableHeight === 0) {
    stableWidth = currentWidth;
    stableHeight = currentHeight;
  } else {
    // Keep app size pinned to the largest observed layout size to avoid
    // white gaps when iOS keyboard temporarily shrinks the viewport.
    stableWidth = Math.max(stableWidth, currentWidth);
    stableHeight = Math.max(stableHeight, currentHeight);
  }

  root.style.setProperty("--app-width", `${stableWidth}px`);
  root.style.setProperty("--app-height", `${stableHeight}px`);
  root.style.setProperty("--app-visual-height", `${visualHeight}px`);
};

export const useScreenViewport = () => {
  useEffect(() => {
    setViewportVars(true);

    const onResize = () => setViewportVars(false);
    const onOrientation = () => setViewportVars(true);

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientation);

    const vv = window.visualViewport;
    vv?.addEventListener("resize", onResize);
    vv?.addEventListener("scroll", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
      vv?.removeEventListener("resize", onResize);
      vv?.removeEventListener("scroll", onResize);
    };
  }, []);
};
