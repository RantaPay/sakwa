import { cn } from "@sakwa/ui/cn";

export function BezelImage({
  src,
  alt,
  className,
  imgClassName,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("bezel", className)}>
      <div className="bezel-inner">
        {/* Static export: unoptimized images. Width/height reserve space for CLS. */}
        <img
          src={src}
          alt={alt}
          width={1600}
          height={1067}
          sizes={sizes}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      </div>
    </div>
  );
}
