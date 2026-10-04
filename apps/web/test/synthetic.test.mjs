import test from 'node:test';
import assert from 'node:assert/strict';
import { demoCSV } from '../src/synthetic.ts';
import { analyzeSchedule } from '../src/domain.ts';
test('interactive synthetic controls produce real CSV records and intended overlap differences',()=>{
 const overlapping=analyzeSchedule(demoCSV('overlap',120));
 assert.equal(overlapping.summary.validJobs,3);
 assert.ok(overlapping.issues.some(i=>i.code==='CREW_OVERLAP'));
 const spaced=analyzeSchedule(demoCSV('spaced',120));
 assert.equal(spaced.summary.validJobs,3);
 assert.ok(!spaced.issues.some(i=>i.code==='CREW_OVERLAP'));
 const shortened=analyzeSchedule(demoCSV('overlap',30));
 assert.equal(shortened.summary.validJobs,3);
 assert.ok(!shortened.issues.some(i=>i.code==='CREW_OVERLAP'));
});
