-- Private bucket for user-uploaded lab files
insert into storage.buckets (id, name, public)
values ('lab-uploads', 'lab-uploads', false)
on conflict (id) do nothing;

-- RLS policies on storage.objects scoped to user's own folder (first path segment = user id)
create policy "Users can upload their own lab files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'lab-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read their own lab files"
on storage.objects for select
to authenticated
using (bucket_id = 'lab-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own lab files"
on storage.objects for delete
to authenticated
using (bucket_id = 'lab-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

-- Document metadata + parsed text
create table public.lab_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  file_path text not null,
  file_name text,
  mime_type text,
  parsed_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lab_documents enable row level security;

create policy "Users select own lab docs"
on public.lab_documents for select
to authenticated
using (auth.uid() = user_id);

create policy "Users insert own lab docs"
on public.lab_documents for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users update own lab docs"
on public.lab_documents for update
to authenticated
using (auth.uid() = user_id);

create policy "Users delete own lab docs"
on public.lab_documents for delete
to authenticated
using (auth.uid() = user_id);

create index lab_documents_user_id_idx on public.lab_documents(user_id, created_at desc);

-- updated_at trigger using existing helper
create trigger update_lab_documents_updated_at
before update on public.lab_documents
for each row execute function public.update_updated_at_column();