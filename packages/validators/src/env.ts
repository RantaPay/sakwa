import { z } from "zod";

export const landingEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().default("https://sakwaagro.com"),
  NEXT_PUBLIC_PLATFORM_URL: z.string().default("https://app.sakwaagro.com"),
  NEXT_PUBLIC_ENQUIRY_ENDPOINT: z.string().default("/api/enquiries"),
  NEXT_PUBLIC_PHONE: z.string().default("[Phone number]"),
  NEXT_PUBLIC_WHATSAPP_E164: z.string().default(""),
  NEXT_PUBLIC_EMAIL: z.string().default("[Contact email]"),
  NEXT_PUBLIC_ADDRESS: z.string().default("[Office address]"),
  NEXT_PUBLIC_OPERATING_LOCATIONS: z.string().default("[Operating locations]"),
  NEXT_PUBLIC_YEARS_OPERATING: z.string().default("[Years operating]"),
  NEXT_PUBLIC_BAGS_SUPPLIED: z.string().default("[Number of bags supplied]"),
  NEXT_PUBLIC_CUSTOMERS_SERVED: z.string().default("[Number of customers served]"),
  NEXT_PUBLIC_WAREHOUSE_COUNT: z.string().default("[Number of warehouses]"),
});

export const platformEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  DIRECTOR_ALERT_EMAIL: z.string().optional(),
  RETURN_FORMULA_KIND: z
    .enum(["fixed_weekly_percent", "profit_share"])
    .default("fixed_weekly_percent"),
  RETURN_WEEKLY_PERCENT_BPS: z.coerce.number().int().min(0).default(0),
  PAYMENT_CONFIRMED_BY_ROLE: z.enum(["accountant", "director"]).default("accountant"),
  WITHDRAWAL_MARKED_PAID_BY_ROLE: z
    .enum(["accountant", "director"])
    .default("accountant"),
  ORDER_WAREHOUSE_ASSIGNED_BY: z
    .enum(["warehouse", "accountant", "director"])
    .default("warehouse"),
  NEXT_PUBLIC_PLATFORM_URL: z.string().default("https://app.sakwaagro.com"),
});

export type LandingEnv = z.infer<typeof landingEnvSchema>;
export type PlatformEnv = z.infer<typeof platformEnvSchema>;
