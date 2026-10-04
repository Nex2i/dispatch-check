import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSchedule, parseTimestamp, csvCell, issuesToCsv, jobsToCsv, SYNTHETIC_CSV } from '../src/domain.ts';
const header='job_id,crew_id,start,end,window_start,window_end,buffer_minutes\n';
const row=(id,crew,start,end,ws='',we='',buffer='0')=>[id,crew,start,end,ws,we,buffer].join(',')+'\n';
const t=h=>`2026-10-05T${String(h).padStart(2,'0')}:00:00Z`;
const codes=r=>r.issues.map(i=>i.code);
test('strict date parser rejects normalized/ambiguous/invalid offsets',()=>{
 for(const v of ['2026-02-29T12:00:00Z','2026-04-31T12:00:00Z','2026-01-01T24:00:00Z','2026-01-01T12:00:00','2026-01-01T12:00Z','2026-01-01T12:00:00+14:01']) assert.equal(parseTimestamp(v),null,v);
 assert.ok(parseTimestamp('2024-02-29T12:00:00+14:00'));
 assert.equal(parseTimestamp('2026-10-05T08:00:00-06:00'),parseTimestamp('2026-10-05T14:00:00Z'));
});
test('BOM, CRLF, quoted commas/escaped quotes/multiline preserve provenance',()=>{
 const r=analyzeSchedule('\uFEFF'+header.replace('\n','\r\n')+'"a,\r\nb""c",crew,'+t(8)+','+t(9)+',,,0\r\n'+row('other','crew',t(8),t(10)));
 assert.equal(r.jobs[0].jobId,'a,\nb"c');assert.equal(r.jobs[1].row,4);
 assert.deepEqual(r.issues.find(i=>i.code==='CREW_OVERLAP').rows,[2,4]);
});
test('schema errors, ragged records, unclosed quotes fail visibly',()=>{
 assert.ok(codes(analyzeSchedule(header.replace('crew_id','job_id')+row('a','c',t(8),t(9)))).includes('INVALID_HEADERS'));
 assert.ok(codes(analyzeSchedule(header+'x,y\n')).includes('RAGGED_ROW'));
 assert.ok(codes(analyzeSchedule(header+'"unclosed')).includes('CSV_SYNTAX'));
 assert.ok(codes(analyzeSchedule(header+'"id"oops,c,'+t(8)+','+t(9)+',,,0')).includes('CSV_SYNTAX'));
});
test('all nested overlapping pairs, crew separation, touching and buffer edges',()=>{
 const r=analyzeSchedule(header+row('a','c',t(8),t(12))+row('b','c',t(9),t(10))+row('c','c',t(9),t(11))+row('d','other',t(9),t(10)));
 assert.equal(r.issues.filter(i=>i.code==='CREW_OVERLAP').length,3);
 assert.equal(r.capacity.find(c=>c.crewId==='c').hours,4);
 const touch=analyzeSchedule(header+row('a','c',t(8),t(9),'','','60')+row('b','c',t(10),t(11)));
 assert.ok(!codes(touch).includes('BUFFER_GAP'));assert.ok(!codes(touch).includes('CREW_OVERLAP'));
 assert.ok(codes(analyzeSchedule(header+row('a','c',t(8),t(9),'','','1')+row('b','c',t(9),t(10)))).includes('BUFFER_GAP'));
});
test('arrival start is inclusive; job may end after window',()=>{
 const r=analyzeSchedule(header+row('a','c',t(9),t(12),t(8),t(9)));
 assert.ok(!codes(r).includes('ARRIVAL_WINDOW'));
 assert.ok(codes(analyzeSchedule(header+row('b','c',t(10),t(12),t(8),t(9)))).includes('ARRIVAL_WINDOW'));
 assert.ok(codes(analyzeSchedule(header+row('b','c',t(10),t(12),t(8),'bad'))).includes('INVALID_WINDOW'));
});
test('duplicates survive invalid rows; optional missing data and invalid duration report',()=>{
 const r=analyzeSchedule(header+row('a','c',t(8),t(9),'','','')+row('a','c','bad',t(10))+row('z','c',t(10),t(10)));
 for(const code of ['DUPLICATE_JOB','INVALID_TIMESTAMP','INVALID_DURATION','WINDOW_UNCHECKED','BUFFER_UNCHECKED'])assert.ok(codes(r).includes(code));
 assert.deepEqual(r.issues.find(i=>i.code==='DUPLICATE_JOB').rows,[2,3]);
});
test('overnight intervals split UTC days and capacity union omits buffers',()=>{
 const r=analyzeSchedule(header+row('a','c','2026-10-05T23:00:00Z','2026-10-06T02:00:00Z','','','120')+row('b','c','2026-10-06T01:00:00Z','2026-10-06T03:00:00Z'),{dailyCapacityHours:2});
 assert.deepEqual(r.capacity.map(c=>[c.date,c.hours,c.overCapacity]),[['2026-10-05',1,false],['2026-10-06',3,true]]);
 assert.equal(r.issues.filter(i=>i.code==='CREW_OVERLAP').length,1);
});
test('bounded rows/bytes and invalid capacity stop analysis',()=>{
 assert.ok(codes(analyzeSchedule(header+row('a','c',t(8),t(9)).repeat(2001))).includes('TOO_MANY_ROWS'));
 assert.ok(codes(analyzeSchedule('x'.repeat(2*1024*1024+1))).includes('FILE_TOO_LARGE'));
 assert.ok(codes(analyzeSchedule(SYNTHETIC_CSV,{dailyCapacityHours:NaN})).includes('INVALID_CAPACITY'));
});
test('formula-safe export preserves dangerous IDs only as escaped text',()=>{
 const r=analyzeSchedule(header+row('=SUM(A1)','@crew',t(8),t(9))+row('=SUM(A1)','@crew',t(8),t(10)));
 assert.ok(jobsToCsv(r).includes('"\'=SUM(A1)"'));assert.ok(issuesToCsv(r).includes('"\'@crew"'));
 for(const value of ['=1','+1','-1','@x','  =1','\tfoo'])assert.ok(csvCell(value).startsWith('"\''));
 assert.equal(csvCell('a"b'),'"a""b"');
});
test('synthetic fixture has visible collision and omitted-data warnings',()=>{
 const r=analyzeSchedule(SYNTHETIC_CSV); assert.equal(r.jobs.length,3);assert.ok(codes(r).includes('CREW_OVERLAP'));assert.ok(codes(r).includes('WINDOW_UNCHECKED'));
});

test('pathological date range cannot allocate millions of capacity days',()=>{
 const r=analyzeSchedule(header+row('a','c','0001-01-01T00:00:00Z','9999-12-31T23:59:59Z'));
 assert.ok(codes(r).includes('CAPACITY_RANGE_LIMIT'));assert.equal(r.capacity.length,0);
});

test('dense 2000-job input hard-stops with explicit incomplete review',()=>{
 const csv=header+Array.from({length:2000},(_,i)=>row(`job-${i}`,'c',t(8),t(9),t(8),t(9))).join('');
 const r=analyzeSchedule(csv);assert.equal(r.summary.complete,false);assert.ok(codes(r).includes('REVIEW_LIMIT'));assert.ok(r.issues.length<=10001);assert.equal(r.jobs.length,2000);
 assert.ok(jobsToCsv(r).includes('"false"'));assert.ok(issuesToCsv(r).includes('"false"'));
});
test('reviewed source export retains invalid optional values instead of repairing them',()=>{
 const r=analyzeSchedule(header+row('a','c',t(8),t(9),'bad','also-bad','NaN'));
 const exported=jobsToCsv(r);assert.ok(exported.includes('"bad","also-bad","NaN"'));
});

test('capacity expansion is bounded across all crews, not individually',()=>{
 const csv=header+Array.from({length:2000},(_,i)=>row(`job-${i}`,`crew-${i}`,'2026-01-01T00:00:00Z','2026-02-01T00:00:00Z','','','0')).join('');
 const r=analyzeSchedule(csv);assert.equal(r.summary.complete,false);assert.ok(codes(r).includes('CAPACITY_RANGE_LIMIT'));assert.equal(r.capacity.length,0);
});
test('capacity warnings share the global issue safety budget',()=>{
 const csv=header+Array.from({length:500},(_,i)=>row(`job-${i}`,`crew-${i}`,'2026-01-01T00:00:00Z','2026-01-23T00:00:00Z','2026-01-01T00:00:00Z','2026-01-01T00:00:00Z','0')).join('');
 const r=analyzeSchedule(csv,{dailyCapacityHours:8});assert.equal(r.summary.complete,false);assert.ok(codes(r).includes('REVIEW_LIMIT'));assert.ok(r.issues.length<=10001);assert.ok(r.capacity.length<=10000);
});
