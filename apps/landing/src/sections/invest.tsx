import { BezelImage } from "@/components/bezel-image";

const points = [
  {
    title: "See your capital",
    body: "Your account shows what you put in, what you have earned, and what you can take out.",
  },
  {
    title: "Take profit weekly",
    body: "Once a week you can request profit. Capital stays in the business.",
  },
  {
    title: "One set of books",
    body: "Money in, money out, and rice in store are recorded by the people who handle them.",
  },
  {
    title: "A named record",
    body: "Every figure has a person, a date, and a reason. Nothing sits as a loose total.",
  },
];

export function Invest() {
  return (
    <section
      id="invest"
      className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 px-4 py-24 md:px-8 lg:grid-cols-12 lg:py-32"
    >
      <div className="lg:col-span-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          For investors
        </p>
        <h2 className="mt-3 max-w-[12ch] text-[clamp(1.85rem,4vw,3rem)] font-extrabold leading-[1.12] tracking-[-0.03em]">
          Follow your capital as the rice moves.
        </h2>
        <div className="mt-10 hidden lg:block">
          <BezelImage
            src="/images/panicles.jpg"
            alt="Close photograph of ripening rice panicles in warm light"
            className="aspect-[4/5] w-full"
            imgClassName="aspect-[4/5]"
          />
        </div>
      </div>
      <div className="reveal grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:col-span-7">
        {points.map((point) => (
          <article key={point.title} className="bg-background p-6 md:p-8">
            <h3 className="text-lg font-semibold tracking-tight">{point.title}</h3>
            <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted">
              {point.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
