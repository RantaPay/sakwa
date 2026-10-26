import { Wordmark } from "@/components/mark";
import { loginHref, site, whatsappHref } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-stone-50">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-10 px-4 py-16 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <Wordmark className="text-base" />
          <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-muted">
            Sakwa Agro Enterprise buys rice from growers and supplies it to
            buyers.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-7">
          <div>
            <p className="text-sm font-semibold">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a href={`tel:${site.phone}`} className="hover:text-foreground">
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-foreground">
                  {site.email}
                </a>
              </li>
              {whatsappHref ? (
                <li>
                  <a href={whatsappHref} className="hover:text-foreground">
                    WhatsApp
                  </a>
                </li>
              ) : (
                <li>WhatsApp: [WhatsApp number]</li>
              )}
              <li>{site.address}</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Accounts</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a href={loginHref} className="hover:text-foreground">
                  Login
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-foreground">
                  Invest with us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-[1400px] px-4 py-5 text-xs text-muted-foreground md:px-8">
          © 2026 Sakwa Agro Enterprise
        </p>
      </div>
    </footer>
  );
}
