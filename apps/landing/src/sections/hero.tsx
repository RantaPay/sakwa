import { BezelImage } from "@/components/bezel-image";
import { IslandButton } from "@/components/island-button";

export function Hero() {
  return (
    <section
      id="top"
      className="mx-auto grid min-h-[100dvh] w-full max-w-[1400px] grid-cols-1 items-end gap-10 px-4 pb-12 pt-24 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-16 lg:pt-24"
    >
      <div className="lg:col-span-6">
        <h1 className="max-w-[14ch] text-[clamp(2.35rem,6vw,4.25rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-foreground">
          We buy rice from growers and supply it to buyers.
        </h1>
        <p className="mt-5 max-w-[38ch] text-base leading-relaxed text-muted md:text-lg">
          Every bag and every naira is written down, so you can follow the trade.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <IslandButton href="#contact">Invest with us</IslandButton>
          <IslandButton href="#how-it-works" variant="secondary">
            How it works
          </IslandButton>
        </div>
      </div>
      <div className="lg:col-span-6">
        <BezelImage
          src="/images/hero.jpg"
          alt="An open hand holding ripening rice panicles in a green field"
          className="aspect-[4/5] w-full lg:aspect-[5/4]"
          imgClassName="aspect-[4/5] lg:aspect-[5/4]"
          priority
        />
      </div>
    </section>
  );
}
