-- Better Auth 1.7.7 default PostgreSQL schema; quoted names match its Kysely adapter.
CREATE TABLE IF NOT EXISTS "user" (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
 "emailVerified" BOOLEAN NOT NULL DEFAULT false, image TEXT,
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
 username TEXT UNIQUE, "displayUsername" TEXT
);
CREATE TABLE IF NOT EXISTS session (
 id TEXT PRIMARY KEY, "expiresAt" TIMESTAMPTZ NOT NULL, token TEXT NOT NULL UNIQUE,
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "ipAddress" TEXT, "userAgent" TEXT, "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_user_idx ON session("userId");
CREATE TABLE IF NOT EXISTS account (
 id TEXT PRIMARY KEY, "accountId" TEXT NOT NULL, "providerId" TEXT NOT NULL,
 "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
 "accessToken" TEXT, "refreshToken" TEXT, "idToken" TEXT,
 "accessTokenExpiresAt" TIMESTAMPTZ, "refreshTokenExpiresAt" TIMESTAMPTZ, scope TEXT, password TEXT,
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS account_user_idx ON account("userId");
CREATE TABLE IF NOT EXISTS verification (
 id TEXT PRIMARY KEY, identifier TEXT NOT NULL, value TEXT NOT NULL, "expiresAt" TIMESTAMPTZ NOT NULL,
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification(identifier);
CREATE TABLE IF NOT EXISTS "rateLimit" (
 id TEXT PRIMARY KEY, key TEXT NOT NULL UNIQUE, count INTEGER NOT NULL, "lastRequest" BIGINT NOT NULL
);
-- Product tables MUST reference "user"(id) ON DELETE CASCADE and restrict every query by owner.

CREATE TABLE IF NOT EXISTS account_throttle (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at TIMESTAMPTZ NOT NULL);
CREATE INDEX IF NOT EXISTS account_throttle_expiry ON account_throttle(expires_at);
CREATE TABLE IF NOT EXISTS customer_order (
 id UUID PRIMARY KEY, user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
 session_id TEXT NOT NULL UNIQUE, payment_intent_id TEXT UNIQUE,
 status TEXT NOT NULL CHECK(status IN ('pending','paid','revoked')),
 paid_at TIMESTAMPTZ, expires_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS customer_order_owner ON customer_order(user_id);
CREATE TABLE IF NOT EXISTS billing_event (id TEXT PRIMARY KEY, type TEXT NOT NULL, received_at TIMESTAMPTZ NOT NULL DEFAULT now());
