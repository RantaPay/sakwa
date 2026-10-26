import { EmptyState, Skeleton } from "@sakwa/ui";

export function QueryGate({
  isLoading,
  isError,
  isEmpty,
  emptyTitle,
  emptyBody,
  errorText = "Could not load this list.",
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyBody: string;
  errorText?: string;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-danger" role="alert">
        {errorText}
      </p>
    );
  }
  if (isEmpty) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }
  return <>{children}</>;
}
