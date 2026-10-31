import type { ReactNode } from "react";

export function DashboardHome({
  greeting,
  children,
}: {
  greeting: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-6 lg:px-8">{greeting}</div>
      {children ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-3 lg:px-8 lg:pb-8">
          {children}
        </div>
      ) : null}
    </div>
  );
}
