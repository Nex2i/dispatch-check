export const HEADERS = ['job_id', 'crew_id', 'start', 'end', 'window_start', 'window_end', 'buffer_minutes'] as const;
export const SYNTHETIC_CSV = `job_id,crew_id,start,end,window_start,window_end,buffer_minutes
DEMO-101,North,2026-10-05T08:00:00-06:00,2026-10-05T10:00:00-06:00,2026-10-05T08:00:00-06:00,2026-10-05T09:00:00-06:00,30
DEMO-102,North,2026-10-05T09:30:00-06:00,2026-10-05T11:00:00-06:00,2026-10-05T09:00:00-06:00,2026-10-05T10:00:00-06:00,15
DEMO-103,South,2026-10-05T08:00:00-06:00,2026-10-05T09:00:00-06:00,,,\n`;
export interface Job { row: number; jobId: string; crewId: string; start: string; end: string; startMs: number; endMs: number; windowStart?: string; windowEnd?: string; bufferMinutes?: number; originalFields: string[] }
export interface Issue { id: string; severity: 'error' | 'warning'; code: string; message: string; rows: number[]; jobIds: string[]; crewId?: string }
export interface CapacityDay { crewId: string; date: string; hours: number; capacityHours: number; overCapacity: boolean }
export interface AnalysisResult { jobs: Job[]; issues: Issue[]; capacity: CapacityDay[]; summary: { complete: boolean; totalRows: number; validJobs: number; errorCount: number; warningCount: number; capacityAssumption: string } }
export interface AnalysisOptions { dailyCapacityHours?: number }
interface RecordRow { cells: string[]; row: number }
const CAPACITY_ASSUMPTION = 'Crew-hours per UTC day: union of booked intervals; overlapping time counted once. Buffers, travel, breaks and crew headcount are excluded; they require separate review.';

// A strict RFC-style quoted-field parser. Row provenance is the physical starting line.
function parseCsv(text: string): { records: RecordRow[]; error?: string; row?: number } {
  if (text.startsWith('\uFEFF')) text = text.slice(1);
  const records: RecordRow[] = [];
  let cells: string[] = [], field = '', quoted = false, closed = false, line = 1, row = 1;
  const finishField = () => { cells.push(field); field = ''; closed = false; };
  const finishRow = () => { finishField(); if (!(cells.length === 1 && cells[0] === '')) records.push({ cells, row }); cells = []; row = line; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { quoted = false; closed = true; } }
      else if (c === '\r' || c === '\n') { if (c === '\r' && text[i + 1] === '\n') i++; field += '\n'; line++; }
      else field += c;
      continue;
    }
    if (c === ',') { finishField(); continue; }
    if (c === '\r' || c === '\n') { if (c === '\r' && text[i + 1] === '\n') i++; line++; finishRow(); continue; }
    if (closed) return { records, error: 'Unexpected text after closing quote; use a comma or line ending.', row };
    if (c === '"') { if (field !== '') return { records, error: 'A quoted field must begin with the quote.', row }; quoted = true; }
    else field += c;
  }
  if (quoted) return { records, error: 'Unclosed quoted field.', row };
  if (field !== '' || cells.length || closed) finishRow();
  return { records };
}

// Date.parse alone normalizes impossible days. Validate every component first.
export function parseTimestamp(value: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi, s] = m.slice(1, 7).map(Number);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (y < 1 || mo < 1 || mo > 12 || d < 1 || d > days[mo - 1] || h > 23 || mi > 59 || s > 59) return null;
  const zone = m[7];
  if (zone !== 'Z') { const zh = Number(zone.slice(1, 3)), zm = Number(zone.slice(4)); if (zh > 14 || zm > 59 || (zh === 14 && zm !== 0)) return null; }
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

export function analyzeSchedule(csv: string, options: AnalysisOptions = {}): AnalysisResult {
  const jobs: Job[] = [], issues: Issue[] = [], capacity: CapacityDay[] = [];
  let totalRows = 0, complete = true;
  const add = (severity: Issue['severity'], code: string, message: string, rows: number[] = [], jobIds: string[] = [], crewId?: string) => issues.push({ id: `issue-${issues.length + 1}`, severity, code, message, rows, jobIds, ...(crewId ? { crewId } : {}) });
  const done = (): AnalysisResult => ({ jobs, issues, capacity, summary: { complete, totalRows, validJobs: jobs.length, errorCount: issues.filter(x => x.severity === 'error').length, warningCount: issues.filter(x => x.severity === 'warning').length, capacityAssumption: CAPACITY_ASSUMPTION } });
  const dailyCapacityHours = options.dailyCapacityHours ?? 8;
  if (!Number.isFinite(dailyCapacityHours) || dailyCapacityHours <= 0 || dailyCapacityHours > 24) { add('error', 'INVALID_CAPACITY', 'Daily capacity must be greater than 0 and at most 24 crew-hours.'); complete = false; return done(); }
  if (new TextEncoder().encode(csv).length > 2 * 1024 * 1024) { add('error', 'FILE_TOO_LARGE', 'CSV exceeds the 2 MiB limit.'); complete = false; return done(); }
  const parsed = parseCsv(csv);
  if (parsed.error) { add('error', 'CSV_SYNTAX', parsed.error, [parsed.row!]); complete = false; return done(); }
  if (!parsed.records.length) { add('error', 'EMPTY_CSV', 'CSV is empty. Include the fixed header and at least one job.'); complete = false; return done(); }
  const header = parsed.records[0], data = parsed.records.slice(1); totalRows = data.length;
  if (data.length > 2000) { add('error', 'TOO_MANY_ROWS', 'CSV exceeds the 2000-job limit.'); complete = false; return done(); }
  const missing = HEADERS.filter(h => !header.cells.includes(h));
  const unknown = header.cells.filter(h => !(HEADERS as readonly string[]).includes(h));
  if (new Set(header.cells).size !== header.cells.length || missing.length || unknown.length) { add('error', 'INVALID_HEADERS', `Use each fixed header exactly once. Missing: ${missing.join(', ') || 'none'}. Unknown: ${unknown.join(', ') || 'none'}. Duplicate headers are not allowed.`, [header.row]); complete = false; return done(); }
  if (!data.length) { add('error', 'NO_JOBS', 'CSV has no job rows.'); complete = false; return done(); }
  const ids = new Map<string, number[]>();
  for (const record of data) {
    const row = record.row;
    if (record.cells.length !== header.cells.length) { add('error', 'RAGGED_ROW', `Expected ${header.cells.length} fields; received ${record.cells.length}.`, [row]); continue; }
    const get = (key: typeof HEADERS[number]) => record.cells[header.cells.indexOf(key)];
    const jobId = get('job_id'), crewId = get('crew_id'), start = get('start'), end = get('end');
    if (jobId.trim()) ids.set(jobId, [...(ids.get(jobId) ?? []), row]);
    if (!jobId.trim() || !crewId.trim()) { add('error', 'MISSING_ID', 'Job and crew IDs must be nonblank.', [row], jobId ? [jobId] : []); continue; }
    const startMs = parseTimestamp(start), endMs = parseTimestamp(end);
    if (startMs === null || endMs === null) { add('error', 'INVALID_TIMESTAMP', 'Start/end must be real ISO dates with seconds and Z or an explicit offset (up to ±14:00).', [row], [jobId], crewId); continue; }
    if (endMs <= startMs) { add('error', 'INVALID_DURATION', 'End must be strictly after start.', [row], [jobId], crewId); continue; }
    const job: Job = { row, jobId, crewId, start, end, startMs, endMs, originalFields: HEADERS.map(get) };
    const ws = get('window_start'), we = get('window_end');
    if (!ws || !we) add('warning', 'WINDOW_UNCHECKED', 'Arrival window not fully provided; arrival-window check omitted.', [row], [jobId], crewId);
    const wsm = ws ? parseTimestamp(ws) : null, wem = we ? parseTimestamp(we) : null;
    if ((ws && wsm === null) || (we && wem === null)) add('error', 'INVALID_WINDOW', 'Provided arrival-window timestamp is invalid; use seconds and an explicit offset.', [row], [jobId], crewId);
    else if (wsm !== null && wem !== null) {
      job.windowStart = ws; job.windowEnd = we;
      if (wem < wsm) add('error', 'INVALID_WINDOW', 'Arrival-window end precedes its start.', [row], [jobId], crewId);
      else if (startMs < wsm || startMs > wem) add('error', 'ARRIVAL_WINDOW', 'Job start is outside its inclusive arrival window.', [row], [jobId], crewId);
    }
    const buffer = get('buffer_minutes');
    if (buffer === '') add('warning', 'BUFFER_UNCHECKED', 'Buffer not provided; post-job buffer check omitted.', [row], [jobId], crewId);
    else if (!/^\d+(?:\.\d+)?$/.test(buffer) || !Number.isFinite(Number(buffer))) add('error', 'INVALID_BUFFER', 'Buffer must be a finite nonnegative number of minutes.', [row], [jobId], crewId);
    else job.bufferMinutes = Number(buffer);
    jobs.push(job);
  }
  for (const [id, rows] of ids) if (rows.length > 1) add('error', 'DUPLICATE_JOB', 'Job ID appears on multiple rows; no row was silently removed.', rows, [id]);
  const totalDaySegments = jobs.reduce((count, job) => count + Math.ceil(job.endMs / 86400000) - Math.floor(job.startMs / 86400000), 0);
  if (totalDaySegments > 25000) { complete = false; add('error', 'CAPACITY_RANGE_LIMIT', 'Review stopped: the entire input exceeds 25,000 UTC-day segments. Crew, buffer and capacity checks were omitted. Shorten the review date range.'); return done(); }
  const crews = new Map<string, Job[]>();
  for (const job of jobs) crews.set(job.crewId, [...(crews.get(job.crewId) ?? []), job]);
  for (const [crewId, crewJobs] of crews) {
    crewJobs.sort((a, b) => a.startMs - b.startMs || a.row - b.row);
    for (let i = 0; i < crewJobs.length; i++) for (let j = i + 1; j < crewJobs.length; j++) {
      if (issues.length >= 10000) { complete = false; add('error', 'REVIEW_LIMIT', 'Review stopped at the 10,000-issue safety limit; remaining pairs and capacity were not checked. Shorten or split this schedule before relying on results.'); complete = false; return done(); }
      const a = crewJobs[i], b = crewJobs[j];
      if (b.startMs < a.endMs) add('error', 'CREW_OVERLAP', 'Crew booked for overlapping jobs.', [a.row, b.row], [a.jobId, b.jobId], crewId);
      else if (a.bufferMinutes !== undefined && (b.startMs - a.endMs) / 60000 < a.bufferMinutes) add('error', 'BUFFER_GAP', `Gap is less than the ${a.bufferMinutes}-minute buffer after the earlier job.`, [a.row, b.row], [a.jobId, b.jobId], crewId);
    }
    const daySegments = new Map<number, { start: number; end: number; row: number; id: string }[]>();
    for (const job of crewJobs) for (let cursor = job.startMs; cursor < job.endMs;) {
      const day = Math.floor(cursor / 86400000) * 86400000, end = Math.min(job.endMs, day + 86400000);
      daySegments.set(day, [...(daySegments.get(day) ?? []), { start: cursor, end, row: job.row, id: job.jobId }]); cursor = end;
    }
    for (const [day, segments] of daySegments) {
      if (issues.length >= 10000) { complete = false; add('error', 'REVIEW_LIMIT', 'Review stopped at the 10,000-issue safety limit; remaining capacity checks were not performed. Shorten or split this schedule.'); return done(); }
      segments.sort((a,b) => a.start - b.start); let start = segments[0].start, end = segments[0].end, duration = 0;
      for (const segment of segments.slice(1)) { if (segment.start <= end) end = Math.max(end, segment.end); else { duration += end - start; start = segment.start; end = segment.end; } }
      duration += end - start;
      const hours = duration / 3600000, date = new Date(day).toISOString().slice(0,10), overCapacity = hours > dailyCapacityHours;
      capacity.push({crewId,date,hours,capacityHours:dailyCapacityHours,overCapacity});
      if (overCapacity) add('warning','DAILY_CAPACITY', `Booked union is ${hours.toFixed(2)} crew-hours on ${date} UTC, above the ${dailyCapacityHours}-hour capacity.`, [...new Set(segments.map(s => s.row))], [...new Set(segments.map(s => s.id))], crewId);
    }
  }
  capacity.sort((a,b) => a.date.localeCompare(b.date) || a.crewId.localeCompare(b.crewId));
  if (issues.length >= 10000) { complete = false; add('error', 'REVIEW_LIMIT', 'Review reached the 10,000-issue safety limit. Shorten or split this schedule before relying on results.'); return done(); }
  add('warning', 'SCOPE_UNCHECKED', 'Travel feasibility, breaks, skills, crew members and access restrictions are not checked. Capacity uses booked union per UTC day only.');
  return done();
}

// Quote every cell, then prefix formula-like content before CSV escaping.
export function csvCell(value: unknown): string { let text = String(value ?? ''); if (/^[\s\uFEFF]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text; return '"' + text.replaceAll('"', '""') + '"'; }
function exportCsv(rows: unknown[][]): string { return rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n'; }
export function issuesToCsv(result: AnalysisResult): string { return exportCsv([['review_complete','severity','code','source_rows','job_ids','crew_id','message'],...result.issues.map(i => [result.summary.complete,i.severity,i.code,i.rows.join(';'),i.jobIds.join(';'),i.crewId ?? '',i.message])]); }
export function jobsToCsv(result: AnalysisResult): string { return exportCsv([['review_complete','source_row',...HEADERS],...result.jobs.map(j => [result.summary.complete,j.row,...j.originalFields])]); }
