"use client";

import { List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/mark";
import { loginHref, navLinks } from "@/lib/site";

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
        <nav
          aria-label="Primary"
          className="pointer-events-auto flex h-14 w-full max-w-[1080px] items-center justify-between rounded-full border border-border/80 bg-white/90 px-3 shadow-[var(--shadow-whisper)] backdrop-blur-md md:px-5"
        >
          <a href="#top" className="flex items-center text-sm text-foreground">
            <Wordmark />
          </a>
          <ul className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[13px] font-medium text-muted transition-colors duration-300 hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="hidden items-center gap-2 lg:flex">
            <a
              href={loginHref}
              className="inline-flex min-h-11 items-center px-4 text-[13px] font-semibold text-foreground"
            >
              Login
            </a>
            <a
              href="#contact"
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Invest with us
            </a>
          </div>
          <button
            type="button"
            className="relative flex size-11 items-center justify-center rounded-full lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <List
              size={22}
              className={`absolute transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "scale-75 opacity-0" : "opacity-100"}`}
            />
            <X
              size={22}
              className={`absolute transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "opacity-100" : "scale-75 opacity-0"}`}
            />
          </button>
        </nav>
      </header>
      <div
        id="mobile-menu"
        hidden={!open}
        className={`fixed inset-0 z-[35] bg-white/92 backdrop-blur-xl lg:hidden ${open ? "block" : "hidden"}`}
      >
        <div className="flex h-full flex-col justify-end px-6 pb-10 pt-24">
          <ul className="flex flex-col gap-2">
            {navLinks.map((link, index) => (
              <li
                key={link.href}
                className="translate-y-4 opacity-0"
                style={{
                  animation: open
                    ? `reveal-up 0.6s cubic-bezier(0.32,0.72,0,1) ${100 + index * 70}ms forwards`
                    : undefined,
                }}
              >
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-3xl font-semibold tracking-tight"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-3">
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            >
              Invest with us
            </a>
            <a
              href={loginHref}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border text-sm font-semibold"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
