const steps = [
  {
    n: "01",
    title: "Capital comes in",
    body: "Investors put money into the business. The amount is recorded against their name.",
  },
  {
    n: "02",
    title: "Rice is bought",
    body: "Agents receive cash, purchase rice, and bring the bags to a store.",
  },
  {
    n: "03",
    title: "Stock is checked",
    body: "The store confirms the bags and the weight. Only confirmed bags go on the books.",
  },
  {
    n: "04",
    title: "Customers order",
    body: "A customer places an order, pays offline, and the payment is written in.",
  },
  {
    n: "05",
    title: "Rice goes out",
    body: "The store releases the bags. The order is marked delivered.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-[1400px] px-4 py-24 md:px-8 lg:py-32"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
        The trade
      </p>
      <h2 className="mt-3 max-w-[16ch] text-[clamp(1.85rem,4vw,3rem)] font-extrabold leading-[1.12] tracking-[-0.03em]">
        From the field to the buyer, in five moves.
      </h2>
      <ol className="mt-14 divide-y divide-border border-y border-border">
        {steps.map((step) => (
          <li
            key={step.n}
            className="reveal grid grid-cols-1 gap-3 py-8 md:grid-cols-12 md:items-baseline md:gap-8"
          >
            <span className="font-mono text-sm font-semibold text-accent md:col-span-2">
              {step.n}
            </span>
            <h3 className="text-xl font-semibold tracking-tight md:col-span-4">
              {step.title}
            </h3>
            <p className="max-w-[52ch] text-base leading-relaxed text-muted md:col-span-6">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
