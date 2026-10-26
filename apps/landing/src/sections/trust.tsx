import { site } from "@/lib/site";

const figures = [
  { value: site.years, label: "Years in trade" },
  { value: site.bags, label: "Bags supplied" },
  { value: site.customers, label: "Customers served" },
  { value: site.warehouses, label: "Stores" },
];

export function Trust() {
  return (
    <section
      aria-label="Company figures"
      className="mx-auto w-full max-w-[1400px] px-4 md:px-8"
    >
      <div className="reveal grid grid-cols-2 border-y border-border lg:grid-cols-4">
        {figures.map((figure) => (
          <div
            key={figure.label}
            className="border-border px-5 py-8 even:border-l lg:border-l lg:first:border-l-0"
          >
            <p className="font-mono text-2xl font-semibold tracking-tight text-primary md:text-3xl">
              {figure.value}
            </p>
            <p className="mt-2 text-sm text-muted">{figure.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
