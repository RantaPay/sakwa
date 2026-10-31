"use client";

import { useEffect } from "react";

const GRAIN_COLORS = ["#CAA673", "#4C2922", "#4F9542"] as const;
const SUCCESS_TOAST = "li[data-sonner-toast][data-type='success']";

function motionOk() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Short grain burst on a primary action, and again when a success toast appears.
 * Grains are plain spans so they sit above dialogs and do not take clicks.
 */
export function RiceSplash() {
  useEffect(() => {
    const seen = new WeakSet<Element>();
    const grains = new Set<HTMLSpanElement>();
    const timers = new Set<number>();

    function burst(x: number, y: number, count: number) {
      if (!motionOk()) return;
      const made: HTMLSpanElement[] = [];
      for (let i = 0; i < count; i += 1) {
        const el = document.createElement("span");
        el.className = "rice-grain";
        el.setAttribute("aria-hidden", "true");
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
        const dist = 24 + Math.random() * 30;
        const color = GRAIN_COLORS[i % GRAIN_COLORS.length];
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
        el.style.setProperty("--dy", `${Math.sin(angle) * dist - 10}px`);
        el.style.setProperty("--rot", `${Math.round((Math.random() - 0.5) * 110)}deg`);
        if (color) el.style.backgroundColor = color;
        el.style.width = `${6 + (i % 3)}px`;
        el.style.height = `${12 + (i % 3) * 2}px`;
        document.body.appendChild(el);
        grains.add(el);
        made.push(el);
      }
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        for (const el of made) {
          el.remove();
          grains.delete(el);
        }
      }, 740);
      timers.add(timer);
    }

    function onPointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("button, [role='button']");
      if (!(button instanceof HTMLElement)) return;
      if (button.getAttribute("role") === "switch") return;
      if (button.hasAttribute("disabled") || button.getAttribute("aria-disabled") === "true") return;
      if (!button.classList.contains("bg-primary")) return;
      burst(event.clientX, event.clientY, 6);
    }

    function splashToast(node: Element) {
      if (node.classList.contains("rice-grain")) return;
      const toast = node.matches(SUCCESS_TOAST) ? node : node.querySelector(SUCCESS_TOAST);
      if (!(toast instanceof HTMLElement) || seen.has(toast)) return;
      seen.add(toast);
      requestAnimationFrame(() => {
        if (!toast.isConnected) return;
        const box = toast.getBoundingClientRect();
        if (box.width < 8) return;
        burst(box.left + 28, box.top + box.height / 2, 8);
      });
    }

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "attributes" && record.target instanceof Element) {
          splashToast(record.target);
          continue;
        }
        for (const node of record.addedNodes) {
          if (node instanceof Element) splashToast(node);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-type"],
    });
    document.addEventListener("pointerdown", onPointer, true);

    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      observer.disconnect();
      for (const timer of timers) window.clearTimeout(timer);
      for (const el of grains) el.remove();
    };
  }, []);

  return null;
}
