Create Table if not exists comments (
  id uuid Primary Key default gen_random_uuid(),
  parent_id uuid References comments(id) default null,
  review_id text not null,
  name varchar(50) not null,
  is_author boolean default false,
  body text not null,
  contains_spoiler boolean default false,
  approved boolean default false,
  created_at timestamptz default now()
);

Create Index if not exists index_comments_review_id on comments(review_id);
Create Index if not exists index_comments_parent on comments(parent_id);

Create Table if not exists stats (
  slug text Primary Key,
  views integer not null default 0,
  likes integer not null default 0
);

Create Table if not exists subs (
  id UUID Primary Key default gen_random_uuid(),
  email text not null unique,
  token text not null unique,
  confirmed boolean default false,
  unsubscribed boolean default false,
  created_at timestamptz default now()
);

Create Table if not exists notifications (
  url text Primary Key,
  title text not null,
  sent_at timestamptz default now()
);