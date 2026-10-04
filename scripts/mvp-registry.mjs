#!/usr/bin/env node
import {mkdir,readFile,writeFile,rename,rm} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {homedir} from 'node:os';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
const [command,...args]=process.argv.slice(2),options={};
for(let i=0;i<args.length;i+=2){if(!args[i].startsWith('--')||args[i+1]===undefined)throw new Error('Use --option value pairs');options[args[i].slice(2)]=args[i+1];}
const path=resolve(options.registry||process.env.MVP_REGISTRY_PATH||homedir()+'/projects/mvp-ideas/mvp-registry.json');
const blocking=e=>['reserved','implemented'].includes(e.status);
const normalize=s=>s.toLowerCase().normalize('NFKC').replace(/[^a-z0-9]+/g,' ').trim();
const fingerprint=s=>createHash('sha256').update(normalize(s)).digest('hex');
const required=k=>{if(!options[k]?.trim())throw new Error('--'+k+' is required');return options[k];};
async function read(){try{const value=JSON.parse(await readFile(path,'utf8'));if(value.version!==1||!Array.isArray(value.entries)||!Array.isArray(value.runs))throw new Error('Invalid registry schema; preserve and repair it');return value;}catch(e){if(e.code==='ENOENT')return{version:1,entries:[],runs:[]};throw e;}}
async function transaction(fn){
 await mkdir(dirname(path),{recursive:true});const lock=path+'.lock';let held=false;
 for(let n=0;n<20;n++){try{await mkdir(lock);held=true;break;}catch(e){if(e.code!=='EEXIST')throw e;await new Promise(r=>setTimeout(r,100));}}
 if(!held)throw new Error('Registry is locked. Retry; if the owner crashed, verify that before removing '+lock);
 let temp;
 try{await writeFile(lock+'/owner.json',JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}),{mode:0o600});const data=await read();const result=await fn(data);temp=path+'.'+randomUUID()+'.tmp';await writeFile(temp,JSON.stringify(data,null,2)+'\n',{mode:0o600,flag:'wx'});await rename(temp,path);return result;}
 finally{if(temp)await rm(temp,{force:true});await rm(lock,{recursive:true,force:true});}
}
const families=['website migration and content operations','education administration','manufacturing quality and maintenance','construction project handoffs','nonprofit program operations','creator production workflows','public procurement and bidding','small retail operations','event planning logistics','data import and reconciliation','developer release workflows','hospitality operations','association administration','field service scheduling','research data preparation','specialist hobby organizations'];
try{
 let result;
 if(command==='list')result={registry:path,...await read()};
 else if(command==='start')result=await transaction(data=>{
  const seed=randomBytes(16).toString('hex');
  const recent=data.runs.filter(r=>r.purpose!=='historical-import').slice(-20),counts=new Map(families.map(f=>[f,recent.filter(r=>r.families?.includes(f)).length]));
  const scopes=families.map(f=>({f,tie:randomBytes(8).toString('hex')})).sort((a,b)=>counts.get(a.f)-counts.get(b.f)||a.tie.localeCompare(b.tie)).slice(0,4).map(x=>x.f);
  const run={id:new Date().toISOString().replace(/[:.]/g,'-')+'-'+seed.slice(0,12),seed,purpose:options.purpose||'discovery',families:options.purpose==='historical-import'?[]:scopes,created_at:new Date().toISOString(),status:'researching',rejected_duplicates:[]};data.runs.push(run);return{registry:path,run,exclude:data.entries.filter(blocking)};
 });
 else if(command==='reserve'){
  const candidate=JSON.parse(await readFile(required('candidate'),'utf8')),runId=required('run-id');
  for(const k of ['name','slug','buyer','trigger','task_key','accepted_output','purchase_reason'])if(typeof candidate[k]!=='string'||!candidate[k].trim())throw new Error('Candidate needs '+k);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate.slug))throw new Error('Candidate slug must be lowercase kebab-case');
  if(!Array.isArray(candidate.inputs)||!candidate.inputs.length)throw new Error('Candidate needs inputs');
  result=await transaction(data=>{
   const run=data.runs.find(r=>r.id===runId);if(!run)throw new Error('Start a run first');
   const entries=data.entries.filter(blocking),own=entries.find(e=>e.run_id===runId&&e.slug===candidate.slug&&e.fingerprint===fingerprint(candidate.task_key));
   if(own)return{outcome:own.status==='implemented'?'already_implemented':'already_reserved',entry:own};
   const duplicate=entries.find(e=>e.slug===candidate.slug||e.fingerprint===fingerprint(candidate.task_key));
   if(duplicate){run.rejected_duplicates.push({candidate:candidate.name,match_id:duplicate.id,at:new Date().toISOString()});return{outcome:'duplicate',restart:true,match:duplicate};}
   if(entries.some(e=>e.run_id===runId&&e.status==='reserved'))throw new Error('This run already owns a different reservation; resume or release it');
   const review=candidate.novelty_review;
   if(review?.decision!=='distinct'||!review.rationale?.trim()||!Array.isArray(review.compared_entry_ids))throw new Error('Semantic novelty review is required: distinct decision, rationale, compared_entry_ids');
   if(entries.some(e=>!review.compared_entry_ids.includes(e.id)))throw new Error('Registry changed or review incomplete; reread and compare every blocked entry before reserving');
   const entry={id:randomUUID(),name:candidate.name,slug:candidate.slug,buyer:candidate.buyer,trigger:candidate.trigger,inputs:candidate.inputs,accepted_output:candidate.accepted_output,purchase_reason:candidate.purchase_reason,task_key:candidate.task_key,fingerprint:fingerprint(candidate.task_key),novelty_review:review,status:'reserved',release_status:'not-built',run_id:runId,reserved_at:new Date().toISOString()};data.entries.push(entry);run.status='reserved';return{outcome:'reserved',entry};
  });
 }else if(command==='reject')result=await transaction(data=>{
  const run=data.runs.find(r=>r.id===required('run-id'));if(!run)throw new Error('Unknown run');const match=data.entries.find(e=>e.id===required('match-id')&&blocking(e));if(!match)throw new Error('Unknown active/implemented match');run.rejected_duplicates.push({candidate:required('candidate-name'),match_id:match.id,reason:required('reason'),at:new Date().toISOString()});return{outcome:'duplicate',restart:true,match_id:match.id};
 });
 else if(command==='mark')result=await transaction(data=>{
  const entry=data.entries.find(e=>e.id===required('id'));if(!entry||entry.run_id!==required('run-id'))throw new Error('Reservation owner does not match');
  if(!['reserved','implemented'].includes(entry.status))throw new Error('An abandoned reservation cannot be marked implemented; reserve again first');
  const status=required('release-status');if(!['customer-ready','release-blocked','validation-demo'].includes(status))throw new Error('Invalid release status');
  entry.status='implemented';entry.release_status=status;entry.repository=required('repository');entry.app_url=required('app-url');entry.implemented_at=options['implemented-at']||entry.implemented_at||new Date().toISOString();entry.updated_at=new Date().toISOString();data.runs.find(r=>r.id===entry.run_id).status='implemented';return{outcome:'implemented',entry};
 });
 else if(command==='portfolio')result=await transaction(data=>{
  const entry=data.entries.find(e=>e.id===required('id'));if(!entry||entry.run_id!==required('run-id'))throw new Error('Reservation owner does not match');if(entry.status!=='implemented')throw new Error('Implement the MVP before recording portfolio publication');
  const url=new URL(required('url'));if(url.protocol!=='https:'||url.username||url.password)throw new Error('Portfolio URL must be HTTPS without credentials');
  entry.portfolio={project:'nex2i-landing',entry_key:entry.id,url:url.href,source_revision:required('source-revision'),deployment_id:required('deployment-id'),verification_reference:required('verification-reference'),published_at:new Date().toISOString()};return{outcome:'portfolio_recorded',entry};
 });
 else if(command==='release')result=await transaction(data=>{
  const entry=data.entries.find(e=>e.id===required('id'));if(!entry||entry.run_id!==required('run-id'))throw new Error('Reservation owner does not match');if(entry.status!=='reserved')throw new Error('Implemented entries cannot be released or forgotten');entry.status='abandoned';entry.release_status='not-built';entry.abandon_reason=required('reason');data.runs.find(r=>r.id===entry.run_id).status='abandoned';return{outcome:'released',entry};
 });
 else throw new Error('Commands: list, start, reserve, reject, mark, portfolio, release. Common: --registry path. Candidate JSON and semantic review are required for reserve.');
 console.log(JSON.stringify(result,null,2));if(result.outcome==='duplicate')process.exitCode=2;
}catch(e){console.error(e.message);process.exitCode=1;}
