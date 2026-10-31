"use client";

import { ROLE_LABEL, type Role } from "@sakwa/types";
import { cn } from "@sakwa/ui";
import { iconForStat } from "@/components/shell/section-icons";
import { getProfile } from "@/features/users";
import { queryKeys } from "@/lib/query-keys";
import { useAuthUser } from "@/lib/use-auth-user";
import { useQuery } from "@tanstack/react-query";

function partOfDay() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function firstName(fullName?: string | null) {
  if (!fullName) return "";
  const token = fullName.trim().split(/\s+/)[0];
  return token ?? "";
}

export function WelcomeCard({
  role,
  body,
  stats,
  className,
}: {
  role: Role;
  body: string;
  stats?: { label: string; value: string; gold?: boolean }[];
  className?: string;
}) {
  const { data: user } = useAuthUser();
  const profile = useQuery({
    queryKey: queryKeys.profile(user?.id ?? "none"),
    enabled: Boolean(user?.id),
    queryFn: () => getProfile(user?.id as string),
  });
  const name = firstName(profile.data?.full_name);
  const greeting = partOfDay();

  return (
    <section className={cn("pb-1", className)} aria-label="Greeting">
      <div className="rounded-[2rem] border border-border/70 bg-bezel p-1.5">
        <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-surface shadow-[inset_0_1px_1px_rgb(255_255_255_/_0.85)]">
          <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary-soft/80" />
          <div className="pointer-events-none absolute -bottom-16 right-16 size-40 rounded-full bg-accent/20" />
          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:items-end">
            <div className={cn(stats?.length ? "lg:col-span-7" : "lg:col-span-12")}>
              <p className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                {ROLE_LABEL[role]}
              </p>
              <h1 className="mt-4 max-w-[16ch] text-[clamp(2.15rem,4.6vw,3.25rem)] font-extrabold leading-[1.1] tracking-[-0.03em]">
                {greeting}
                {name ? `, ${name}` : ""}.
              </h1>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-muted md:text-lg">
                {body}
              </p>
            </div>
            {stats && stats.length > 0 ? (
              <dl className="grid grid-cols-2 gap-x-5 gap-y-5 lg:col-span-5">
                {stats.map((item) => {
                  const Icon = iconForStat(item.label);
                  return (
                    <div key={item.label} className="min-w-0">
                      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">
                        {Icon ? (
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                            <Icon size={18} weight="light" aria-hidden />
                          </span>
                        ) : null}
                        {item.gold ? <span className="size-2 shrink-0 rounded-full bg-accent" /> : null}
                        <span className="truncate">{item.label}</span>
                      </dt>
                      <dd className="mt-1 min-w-0 truncate font-sans text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
                        {item.value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
