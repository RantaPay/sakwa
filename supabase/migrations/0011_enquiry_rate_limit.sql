create table public.enquiry_rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index enquiry_rate_limits_ip_created_idx
  on public.enquiry_rate_limits (ip_hash, created_at desc);

alter table public.enquiry_rate_limits enable row level security;

-- Only the service role (API route) writes this table.
