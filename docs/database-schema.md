# Database Schema (V1 scope)

Apply this in the Supabase SQL editor.

```sql
-- users: only needed once you add Auth; skip for a fully local single-user V1
create table users (
  id uuid primary key,
  email text unique,
  created_at timestamptz default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),       -- nullable if no auth yet
  title text not null default 'New conversation',
  model text not null default 'claude-sonnet-5',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_archived boolean default false
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text check (role in ('user','assistant','system')),
  content text not null,
  input_tokens int,
  output_tokens int,
  created_at timestamptz default now()
);

-- attachments: V2, document analysis
create table attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes int not null,
  extracted_text text,                      -- cached extraction result
  created_at timestamptz default now()
);

-- memories: V2, personalization
create table memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  content text not null,
  category text,                            -- e.g. 'preference', 'project-context'
  created_at timestamptz default now()
);

-- usage_log: data source for the cost dashboard and spend tracker
create table usage_log (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id),
  model text not null,
  input_tokens int not null,
  output_tokens int not null,
  estimated_cost_usd numeric(10,4) not null,
  created_at timestamptz default now()
);
```

Keep `usage_log` from day one — it's the data source for the cost-control safeguards in `security.md`.

For V1 (no auth yet), you can skip the `users` table and leave `user_id` columns null, or drop them entirely and add them back when Auth is introduced.
