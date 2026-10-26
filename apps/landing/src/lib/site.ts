const env = (key: string, fallback: string): string =>
  process.env[key] && process.env[key]!.length > 0 ? process.env[key]! : fallback;

export const site = {
  name: "Sakwa Agro Enterprise",
  shortName: "Sakwa Agro Enterprise",
  url: env("NEXT_PUBLIC_SITE_URL", "https://sakwaagro.com"),
  platformUrl: env("NEXT_PUBLIC_PLATFORM_URL", "https://app.sakwaagro.com"),
  enquiryEndpoint: env(
    "NEXT_PUBLIC_ENQUIRY_ENDPOINT",
    "https://app.sakwaagro.com/api/enquiries",
  ),
  phone: env("NEXT_PUBLIC_PHONE", "[Phone number]"),
  whatsapp: env("NEXT_PUBLIC_WHATSAPP_E164", ""),
  email: env("NEXT_PUBLIC_EMAIL", "[Contact email]"),
  address: env("NEXT_PUBLIC_ADDRESS", "[Office address]"),
  locations: env("NEXT_PUBLIC_OPERATING_LOCATIONS", "[Operating locations]"),
  years: env("NEXT_PUBLIC_YEARS_OPERATING", "[Years operating]"),
  bags: env("NEXT_PUBLIC_BAGS_SUPPLIED", "[Number of bags supplied]"),
  customers: env("NEXT_PUBLIC_CUSTOMERS_SERVED", "[Number of customers served]"),
  warehouses: env("NEXT_PUBLIC_WAREHOUSE_COUNT", "[Number of warehouses]"),
  description:
    "Sakwa Agro Enterprise buys rice from growers and supplies it to buyers. Investors put capital into the trade and can follow their own record.",
};

export const loginHref = `${site.platformUrl.replace(/\/$/, "")}/login`;

export const whatsappHref = site.whatsapp
  ? `https://wa.me/${site.whatsapp.replace(/[^\d]/g, "")}`
  : null;

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#invest", label: "For investors" },
  { href: "#contact", label: "Contact" },
] as const;
