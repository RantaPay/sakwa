import type { ReactNode } from "react";
import { Mark } from "@/components/mark";

export function AuthShell({
  image,
  imageAlt,
  eyebrow,
  title,
  body,
  children,
  footer,
}: {
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  body: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh] bg-background">
      <div className="grain" />
      <div className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-12">
        <aside className="relative isolate overflow-hidden bg-primary px-5 py-8 text-primary-foreground sm:px-8 lg:col-span-5 lg:px-12 lg:py-12 xl:col-span-6">
          <img
            src={image}
            alt={imageAlt}
            width={1600}
            height={1067}
            className="ken absolute inset-0 size-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/40" />
          <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-between gap-10 lg:min-h-0">
            <a href="/" className="inline-flex items-center gap-3 text-base font-semibold tracking-tight">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-surface">
                <Mark className="h-10 w-auto" />
              </span>
              Sakwa Agro Enterprise
            </a>
            <div className="max-w-md pb-4">
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]">
                {eyebrow}
              </p>
              <h1 className="mt-5 text-[clamp(2.35rem,4.6vw,3.8rem)] font-extrabold leading-[1.08] tracking-[-0.035em]">
                {title}
              </h1>
              <p className="mt-4 max-w-[36ch] text-base leading-relaxed text-primary-foreground/85 md:text-lg">
                {body}
              </p>
              <dl className="mt-10 hidden gap-8 sm:grid sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                    Agent
                  </dt>
                  <dd className="mt-1 text-base font-semibold">Kg bought</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                    Store
                  </dt>
                  <dd className="mt-1 text-base font-semibold">Kg in store</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                    Money
                  </dt>
                  <dd className="mt-1 text-base font-semibold">Every naira</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>
        <main className="relative flex items-center px-4 py-10 sm:px-8 lg:col-span-7 lg:px-12 xl:col-span-6 xl:px-16">
          <div className="rise mx-auto w-full max-w-md">
            <div className="rounded-[2rem] border border-border/70 bg-bezel p-1.5">
              <div className="rounded-[calc(2rem-0.375rem)] bg-surface px-5 py-7 shadow-[inset_0_1px_1px_rgb(255_255_255_/_0.85)] sm:px-8 sm:py-9">
                {children}
              </div>
            </div>
            <div className="mt-6 text-sm text-muted">{footer}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
