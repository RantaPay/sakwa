import type { ReactNode } from "react";

export function DashboardHome({
  greeting,
  children,
}: {
  greeting: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-6 lg:px-8 lg:pb-8">
      {greeting}
      {children ? <div className="pt-3">{children}</div> : null}
    </div>
  );
}
