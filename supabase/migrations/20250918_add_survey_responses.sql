-- Create table for survey responses
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  anon_id text not null,
  created_at timestamptz not null default now(),
  survey_key text not null,
  answers jsonb not null,
  metadata jsonb null
);

create index if not exists idx_survey_responses_anon on public.survey_responses(anon_id);
create index if not exists idx_survey_responses_key on public.survey_responses(survey_key);

alter table public.survey_responses enable row level security;

-- Intentionally no SELECT policy (keep data private by default)


