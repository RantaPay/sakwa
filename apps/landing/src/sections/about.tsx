import { BezelImage } from "@/components/bezel-image";
import { site } from "@/lib/site";

export function About() {
  return (
    <section
      id="about"
      className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-10 px-4 py-24 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-32"
    >
      <div className="reveal lg:col-span-7">
        <BezelImage
          src="/images/fields.jpg"
          alt="Aerial view of irrigated rice paddies beside a lake and a road"
          className="aspect-[16/10] w-full"
          imgClassName="aspect-[16/10]"
        />
      </div>
      <div className="reveal lg:col-span-5">
        <h2 className="max-w-[12ch] text-[clamp(1.85rem,4vw,3rem)] font-extrabold leading-[1.12] tracking-[-0.03em]">
          A rice trading house with one set of books.
        </h2>
        <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted">
          Sakwa Agro Enterprise buys rice from growers, holds it in store, and
          supplies customers who pay before delivery. The people who handle the
          rice and the money write every figure in. Investors and customers see
          the same record.
        </p>
        <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-muted">
          We operate in {site.locations}.
        </p>
      </div>
    </section>
  );
}
