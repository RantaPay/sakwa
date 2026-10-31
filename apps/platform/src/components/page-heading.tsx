import { SectionMark } from "@/components/shell/section-icons";

export function PageHeading({
  title,
  body,
  mark,
}: {
  title: string;
  body?: string;
  mark?: string;
}) {
  return (
    <header className="mb-8 flex items-start gap-4">
      {mark ? <SectionMark mark={mark} /> : null}
      <div className="min-w-0">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        {body ? <p className="mt-2 max-w-prose text-base text-muted">{body}</p> : null}
      </div>
    </header>
  );
}
