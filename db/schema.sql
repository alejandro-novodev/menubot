-- ── Auth ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  password_hash VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'owner', -- owner | admin
  approved BOOLEAN NOT NULL DEFAULT false,   -- invite-only gate; admin enables
  image VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  UNIQUE(provider, provider_account_id)
);

-- ── Businesses (replaces restaurants) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  business_type VARCHAR(50) NOT NULL DEFAULT 'restaurant',
  -- restaurant | bar | hotel | service | retail
  is_demo BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- pending | active | suspended
  menu_completeness INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keep restaurants as alias for backwards compatibility
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

-- ── Dishes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dishes (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id),
  business_id INTEGER REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients TEXT,
  price INTEGER,
  category VARCHAR(100),
  allergens TEXT,
  available BOOLEAN NOT NULL DEFAULT true
);

-- ── Subscriptions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id INTEGER REFERENCES businesses(id),
  plan VARCHAR(50) NOT NULL,             -- starter | pro | multi | enterprise
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  -- pending | active | cancelled | past_due
  payment_provider_id VARCHAR(255),      -- Flow.cl subscription ID
  payment_customer_id VARCHAR(255),
  invoice_pdf_url VARCHAR(500),          -- Bsale PDF URL
  started_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  price_clp INTEGER,
  branch_count INTEGER NOT NULL DEFAULT 1,
  extra_branches INTEGER NOT NULL DEFAULT 0,
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',  -- monthly | annual
  annual_discount_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reviews (post-visit opinions; stored in MenuBot only) ──────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  conversation_id INTEGER REFERENCES chat_sessions(id) ON DELETE SET NULL,
  diner_rating    INTEGER NOT NULL CHECK (diner_rating BETWEEN 1 AND 5),
  diner_comment   TEXT,
  share_consent   BOOLEAN NOT NULL DEFAULT false,  -- diner agreed to share publicly
  owner_response  TEXT,
  responded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Menu uploads ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_uploads (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  file_url VARCHAR(500),                 -- legacy; import now extracts inline
  file_name VARCHAR(255),
  file_type VARCHAR(50) DEFAULT 'pdf',   -- pdf | image
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  -- pending | processing | done | failed
  extracted_dishes INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Waitlist (contacto landing) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  plan VARCHAR(50),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Schema upgrades (safe to run on existing databases) ───────────────────
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
