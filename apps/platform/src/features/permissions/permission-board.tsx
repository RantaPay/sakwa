"use client";

import { ROLE_LABEL, type Role } from "@sakwa/types";
import { cn } from "@sakwa/ui";
import { useState } from "react";
import { iconForGroup, SectionMark } from "@/components/shell/section-icons";
import { isFeatureEnabled } from "./access";
import { CONTROLLABLE_ROLES, FEATURE_GROUPS, FEATURES } from "./catalog";
import { usePermissions } from "./provider";

export function PermissionBoard() {
  const [role, setRole] = useState<Role>("director");
  const { rows, setGrant, savingId, error } = usePermissions();

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Role">
        {CONTROLLABLE_ROLES.map((item) => {
          const selected = item === role;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setRole(item)}
              className={cn(
                "inline-flex min-h-12 items-center rounded-full px-4 text-base font-semibold",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-surface text-muted",
              )}
            >
              {ROLE_LABEL[item]}
            </button>
          );
        })}
      </div>
      <p className="mt-4 max-w-prose text-base text-muted">
        Showing screens for {ROLE_LABEL[role]}. A tick puts that screen on their menu and, where it
        belongs, on their home.
      </p>
      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-8 space-y-8">
        {FEATURE_GROUPS.map((group) => {
          const items = FEATURES.filter((feature) => feature.group === group);
          const GroupIcon = iconForGroup(group);
          return (
            <section key={group} aria-label={group}>
              <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">
                <GroupIcon size={18} weight="light" className="text-primary" aria-hidden />
                {group}
              </h2>
              <ul className="mt-3 divide-y divide-border rounded-2xl border border-border">
                {items.map((feature) => {
                  const on = isFeatureEnabled(role, feature.id, rows);
                  const pending = savingId === `${role}:${feature.id}`;
                  return (
                    <li key={feature.id} className="flex items-center justify-between gap-4 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <SectionMark mark={feature.id} size={22} className="size-12" />
                        <div className="min-w-0">
                          <p className="text-lg font-semibold">{feature.label}</p>
                          <p className="mt-1 text-base text-muted">{feature.detail}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-label={`${feature.label} for ${ROLE_LABEL[role]}`}
                        disabled={pending}
                        onClick={() => setGrant(role, feature.id, !on)}
                        className={cn(
                          "relative h-8 w-14 shrink-0 rounded-full p-0 text-left transition-colors",
                          on ? "bg-primary" : "bg-track",
                          pending ? "opacity-60" : "",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 left-0.5 size-7 rounded-full bg-white shadow-sm transition-transform",
                            on ? "translate-x-6" : "translate-x-0",
                          )}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
