export function demoCSV(scenario: string, duration: number) {
  const header = 'job_id,crew_id,start,end,window_start,window_end,buffer_minutes';
  const end = new Date(Date.UTC(2026, 9, 5, 8, duration)).toISOString().replace('.000Z', 'Z');
  const second = scenario === 'overlap' ? '09:00:00' : '11:00:00';
  return `${header}\nDEMO-101,DEMO-CREW-A,2026-10-05T08:00:00Z,${end},2026-10-05T07:45:00Z,2026-10-05T08:30:00Z,15\nDEMO-102,DEMO-CREW-A,2026-10-05T${second}Z,2026-10-05T12:00:00Z,2026-10-05T10:30:00Z,2026-10-05T11:30:00Z,15\nDEMO-103,DEMO-CREW-B,2026-10-05T09:00:00Z,2026-10-05T11:00:00Z,,,`;
}
