import Fastify from 'fastify';
import cors from '@fastify/cors';
import postgres from 'postgres';
import { normalizeEmail } from './validation.js';

const app = Fastify({ logger: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');
const sql = postgres(databaseUrl, { max: 3 });

await app.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST']
});

app.get('/health', async () => ({ status: 'ok' }));

app.post('/api/waitlist', async (request, reply) => {
  const body = request.body as { email?: unknown } | null;
  const email = normalizeEmail(body?.email);
  if (!email) return reply.code(400).send({ error: 'Enter a valid email address.' });
  await sql`INSERT INTO waitlist (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
  return reply.code(202).send({ accepted: true });
});

await sql`
  CREATE TABLE IF NOT EXISTS waitlist (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

const port = Number(process.env.PORT || 10000);
await app.listen({ host: '0.0.0.0', port });

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    await app.close();
    await sql.end();
    process.exit(0);
  });
}
