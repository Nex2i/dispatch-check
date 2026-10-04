import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
writeFileSync(new URL('../apps/web/dist/release.json',import.meta.url),JSON.stringify({revision,mode:process.env.VITE_CUSTOMER_ENABLED==='true'?'customer':'review',builtAt:new Date().toISOString()})+'\n');
