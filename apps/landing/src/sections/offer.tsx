import { IslandButton } from "@/components/island-button";
import { loginHref } from "@/lib/site";

export function Offer() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-24 md:px-8 lg:py-32">
      <h2 className="max-w-[14ch] text-[clamp(1.85rem,4vw,3rem)] font-extrabold leading-[1.12] tracking-[-0.03em]">
        Rice for buyers. Capital that stays at work.
      </h2>
      <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <article className="reveal bezel lg:col-span-7">
          <div className="bezel-inner">
            <img
              src="/images/grains.jpg"
              alt="Close view of milled long-grain white rice"
              width={1600}
              height={900}
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="px-6 py-8 md:px-8">
              <h3 className="text-2xl font-semibold tracking-tight">For customers</h3>
              <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-muted">
                Order bags at an agreed weight and price. Pay before delivery.
                Follow the order from placed to delivered.
              </p>
              <div className="mt-6">
                <IslandButton href={loginHref} variant="secondary">
                  Open an account
                </IslandButton>
              </div>
            </div>
          </div>
        </article>
        <article className="reveal flex flex-col justify-between rounded-[2rem] bg-primary px-6 py-8 text-primary-foreground md:px-8 lg:col-span-5">
          <div>
            <p className="font-mono text-sm text-accent">Investors</p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">
              Put capital into the trade and follow it in your own account.
            </h3>
            <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-primary-foreground/80">
              You see what you put in, what you have earned, and the profit you
              can take out each week. Capital stays in the business.
            </p>
          </div>
          <div className="mt-10">
            <a
              href="#contact"
              className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary"
            >
              Invest with us
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
