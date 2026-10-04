import type { FastifyInstance } from 'fastify';
import type { AccountAuth } from './auth.js';
import { requireCustomer } from './account-routes.js';
import { analyzeSchedule, issuesToCsv, jobsToCsv } from './domain.js';

export async function registerReportRoutes(app: FastifyInstance, auth: AccountAuth, origin: string,
 activePass: (userId: string) => Promise<Date | null>) {
 app.post('/api/report', { bodyLimit: 2 * 1024 * 1024 }, async (request, reply) => {
  if (request.headers.origin !== origin) return reply.code(403).send({ error: 'Request origin is not allowed.' });
  const session = await requireCustomer(auth, request);
  if (!session) return reply.code(401).send({ error: 'Sign in with a verified account.' });
  const pass = await activePass(session.user.id);
  if (!pass || pass.getTime() <= Date.now()) return reply.code(402).send({ error: 'An active paid pass is required for a review packet.' });
  const body = request.body as { csv?: unknown; dailyCapacityHours?: unknown; consent?: unknown } | null;
  if (body?.consent !== true) return reply.code(400).send({ error: 'Confirm consent to transient processing of pseudonymous schedule records.' });
  if (typeof body.csv !== 'string' || Buffer.byteLength(body.csv,'utf8') > 2 * 1024 * 1024) return reply.code(400).send({ error: 'Supply a CSV no larger than 2 MiB.' });
  if (typeof body.dailyCapacityHours !== 'number' || !Number.isFinite(body.dailyCapacityHours)) return reply.code(400).send({ error: 'Supply a daily crew-hour capacity.' });
  // Fixed-schema analysis excludes all extra columns. Only bounded pseudonymous IDs may be transmitted.
  const result = analyzeSchedule(body.csv, { dailyCapacityHours: body.dailyCapacityHours });
  if (!result.summary.complete) return reply.code(422).send({ error: 'Review is incomplete; correct the file or reduce its scope before exporting.', summary: result.summary });
  const validId = (id: string) => /^[A-Za-z0-9_.-]{1,64}$/.test(id);
  if (result.jobs.some(job => !validId(job.jobId) || !validId(job.crewId)) || result.issues.some(issue => issue.jobIds.some(id => !validId(id)) || (issue.crewId !== undefined && !validId(issue.crewId)))) return reply.code(400).send({ error: 'Use pseudonymous job and crew IDs of 1–64 letters, numbers, dots, underscores or hyphens. Do not include names, addresses or emails.' });
  // Data lives only in this request; no CSV/results/tokens enter the DB or logs.
  return { issuesCsv: issuesToCsv(result), jobsCsv: jobsToCsv(result), summary: result.summary };
 });
}
