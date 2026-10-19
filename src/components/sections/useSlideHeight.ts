"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

const FALLBACK_MS = 700;

// js только меряет, анимирует css
export function useSlideHeight<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T>(null);
  const last = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (!el.style.height) last.current = el.offsetHeight;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = last.current;
    el.style.height = "";
    const to = el.offsetHeight;
    last.current = to;
    if (!from || from === to || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.style.height = `${from}px`;
    el.getBoundingClientRect();
    el.style.height = `${to}px`;
    const release = () => {
      el.style.height = "";
      el.removeEventListener("transitionend", onEnd);
      clearTimeout(timer);
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.target === el && e.propertyName === "height") release();
    };
    el.addEventListener("transitionend", onEnd);
    const timer = setTimeout(release, FALLBACK_MS);
    return () => {
      // новый переход стартует отсюда
      if (el.style.height) last.current = el.offsetHeight;
      release();
    };
  }, [key]);

  return ref;
}
