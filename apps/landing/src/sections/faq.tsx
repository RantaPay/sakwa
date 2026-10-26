const faqs = [
  {
    q: "How do I invest?",
    a: "Send an enquiry. A director will contact you. If you proceed, an account is created for you and your capital is recorded.",
  },
  {
    q: "Can I take my capital out?",
    a: "Profit can be requested once a week. Capital stays in the business.",
  },
  {
    q: "Do I pay on this website?",
    a: "No. All payments are made offline and then written into the books.",
  },
  {
    q: "How do customers order rice?",
    a: "Customers create an account, place an order for bags and weight, pay offline, and wait for delivery.",
  },
  {
    q: "Who sees my investment?",
    a: "You see your own capital and returns. Directors oversee the books. Other investors do not see your figures.",
  },
  {
    q: "Is there a fee to enquire?",
    a: "No. Send a message and a director will reply.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-24 md:px-8 lg:py-32">
      <h2 className="max-w-[12ch] text-[clamp(1.85rem,4vw,3rem)] font-extrabold leading-[1.12] tracking-[-0.03em]">
        Questions people ask first.
      </h2>
      <div className="mt-12 divide-y divide-border border-y border-border">
        {faqs.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-semibold tracking-tight">
              {item.q}
              <span
                aria-hidden="true"
                className="text-muted transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 max-w-[62ch] pb-2 text-base leading-relaxed text-muted">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
