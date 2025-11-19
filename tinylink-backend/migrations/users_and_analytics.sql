-- Users table (optional auth implementation later)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_admin BOOLEAN DEFAULT FALSE
);

-- Short link analytics table (per-visit records)
CREATE TABLE IF NOT EXISTS short_link_clicks (
  id BIGSERIAL PRIMARY KEY,
  short_link_id BIGINT NOT NULL REFERENCES short_links(id) ON DELETE CASCADE,
  ip_address VARCHAR(100),
  user_agent TEXT,
  referer TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- index to speed up queries for analytics of a particular link
CREATE INDEX IF NOT EXISTS idx_short_link_clicks_short_link_id ON short_link_clicks(short_link_id);
