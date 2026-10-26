export function PageHeading({
  title,
  body,
}: {
  title: string;
  body?: string;
}) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
      {body ? <p className="mt-2 max-w-prose text-sm text-muted">{body}</p> : null}
    </header>
  );
}
