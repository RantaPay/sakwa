export function Mark({ className }: { className?: string }) {
  return (
    // Brand mark is a two-color grain drawing, so it stays an image.
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/mark.png" alt="" className={className ?? "h-10 w-auto"} />
  );
}
