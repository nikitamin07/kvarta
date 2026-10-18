create table if not exists leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 60),
  phone text not null check (phone ~ '^\+375(25|29|33|44|17)[0-9]{7}$'),
  interest text not null check (interest in ('order', 'subscription', 'question')),
  items jsonb not null default '[]' check (jsonb_typeof(items) = 'array'),
  total_byn integer not null default 0 check (total_byn >= 0),
  question text check (char_length(question) <= 1000),
  comment text check (char_length(comment) <= 1000),
  utm_source text check (char_length(utm_source) <= 200),
  utm_medium text check (char_length(utm_medium) <= 200),
  utm_campaign text check (char_length(utm_campaign) <= 200),
  utm_content text check (char_length(utm_content) <= 200),
  utm_term text check (char_length(utm_term) <= 200),
  click_id text check (char_length(click_id) <= 200),
  landing_page text check (char_length(landing_page) <= 500),
  referrer text check (char_length(referrer) <= 500),
  user_agent text check (char_length(user_agent) <= 500)
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_phone_idx on leads (phone);

create table if not exists lead_locks (
  phone text primary key,
  locked_until timestamptz not null
);
