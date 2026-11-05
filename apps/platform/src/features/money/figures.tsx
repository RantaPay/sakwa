"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "sakwa-figures-hidden";
const MASK_ATTR = "data-figure-mask";
const KEEP_ATTR = "data-figures-keep";

const FiguresContext = createContext({ hidden: false, toggle: () => {} });

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function readHidden() {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function FiguresProvider({ children }: { children: ReactNode }) {
  const hidden = useSyncExternalStore(subscribe, readHidden, () => false);

  function toggle() {
    window.localStorage.setItem(STORAGE_KEY, readHidden() ? "0" : "1");
    listeners.forEach((listener) => listener());
  }

  return (
    <FiguresContext.Provider value={{ hidden, toggle }}>
      <PageFigureMask hidden={hidden} />
      {children}
    </FiguresContext.Provider>
  );
}

export function useFigures() {
  return useContext(FiguresContext);
}

export function figureText(value: string, hidden: boolean) {
  return hidden ? "••••" : value;
}

export function FigureToggle() {
  const { hidden, toggle } = useFigures();
  const Icon = hidden ? Eye : EyeSlash;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={hidden}
      data-figures-keep=""
      // The card-paper rule in tokens.css paints a grain motif on rounded
      // bg-surface elements; a button should stay plain.
      style={{ backgroundImage: "none" }}
      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-foreground sm:text-base"
    >
      <Icon size={22} weight="light" aria-hidden />
      {hidden ? "Show figures" : "Hide figures"}
    </button>
  );
}

/* ---------- Page-wide masking ---------- */

const DIGIT = /\d/;
// Plain dates and times stay readable: "05 Nov 2026", "2026-11-05", "5/11/2026, 14:30".
const DATE_ONLY =
  /^\s*(?:\d{1,2}[ /.-](?:[A-Za-z]{3,9}|\d{1,2})[ /.-]\d{2,4}|\d{4}-\d{2}-\d{2}|[A-Za-z]{3,9} \d{1,2},? \d{4})(?:[ ,T]+\d{1,2}:\d{2}(?::\d{2})?)?\s*$/;

export function shouldMaskText(text: string) {
  return DIGIT.test(text) && !DATE_ONLY.test(text);
}

function ownText(element: Element) {
  let text = "";
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) text += node.nodeValue ?? "";
  }
  return text;
}

/** SVG filters apply to <text>, not to <tspan>, so mask the whole label. */
function maskTarget(element: Element) {
  if (element instanceof SVGElement) return element.closest("text") ?? element;
  return element;
}

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "HEAD", "TITLE"]);

function evaluate(element: Element | null) {
  if (!element || SKIP_TAGS.has(element.tagName.toUpperCase())) return;
  if (element.closest(`[${KEEP_ATTR}]`)) return;
  let mask: boolean;
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    mask = element.type !== "password" && shouldMaskText(element.value);
  } else if (element instanceof HTMLSelectElement) {
    mask = shouldMaskText(element.selectedOptions[0]?.text ?? "");
  } else {
    mask = shouldMaskText(ownText(element));
  }
  const target = maskTarget(element);
  if (mask) target.setAttribute(MASK_ATTR, "");
  else if (target === element) target.removeAttribute(MASK_ATTR);
}

function scan(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    evaluate(root.parentElement);
    return;
  }
  if (!(root instanceof Element)) return;
  evaluate(root);
  for (const element of root.querySelectorAll("*")) evaluate(element);
}

function PageFigureMask({ hidden }: { hidden: boolean }) {
  useEffect(() => {
    if (!hidden) return;
    const root = document.body;
    scan(root);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          evaluate(mutation.target.parentElement);
        } else {
          if (mutation.target instanceof Element) evaluate(mutation.target);
          mutation.addedNodes.forEach(scan);
        }
      }
    });
    observer.observe(root, { childList: true, characterData: true, subtree: true });

    const onInput = (event: Event) => {
      if (event.target instanceof Element) evaluate(event.target);
    };
    root.addEventListener("input", onInput, true);
    root.addEventListener("change", onInput, true);

    return () => {
      observer.disconnect();
      root.removeEventListener("input", onInput, true);
      root.removeEventListener("change", onInput, true);
      for (const element of root.querySelectorAll(`[${MASK_ATTR}]`)) {
        element.removeAttribute(MASK_ATTR);
      }
    };
  }, [hidden]);

  return null;
}
