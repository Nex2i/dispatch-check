import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {renderToString} from 'react-dom/server';
import {createElement} from 'react';
import {App} from '../dist-ssr/main.js';
const base=new URL('../dist/',import.meta.url), origin='https://dispatch-check.nex2i.com';
const template=readFileSync(new URL('index.html',base),'utf8');
const pages=[['/','Dispatch Check — Crew schedule CSV conflict checker','Review a crew schedule CSV for double bookings, buffers and arrival-window mismatches. Public synthetic review; customer launch pending.'],['/guide/','Dispatch CSV review guide — Overlaps, buffers & arrival windows','A worked spreadsheet dispatch review: identify both conflicting rows, preserve arrival commitments and understand unchecked travel and crew assumptions.'],['/templates/','Dispatch schedule CSV template — Seven explicit fields','Download a synthetic crew schedule CSV and learn the fixed job, crew, timestamp, arrival-window and buffer schema.'],['/pricing/','Dispatch Check pricing — Proposed $19 nonrenewing pass','Proposed $19 USD 30-day pass with no automatic renewal. Customer launch and purchasing remain pending; explore synthetic examples today.'],['/privacy/','Privacy & data — Dispatch Check','Public review uses only synthetic schedules. Local analysis, account data rights and customer release boundaries explained.'],['/portfolio-preview/','Dispatch Check — Interactive synthetic preview','Explore a fictional dispatch schedule. Synthetic-only portfolio preview without accounts or payments.'],['/404/','Page not found — Dispatch Check','This page is unavailable. Return to the schedule checker or review guide.']];
if(process.env.VITE_CUSTOMER_ENABLED==='true')pages.push(['/account/reset/','Password recovery — Dispatch Check','Complete recovery using your dedicated account email link.']);
for(const [path,title,description] of pages){
 const canonical=path==='/404/'?'':`<link rel="canonical" href="${origin}${path}"/>`;
 const noindex=path==='/portfolio-preview/'||path==='/404/'||path==='/account/reset/'?'<meta name="robots" content="noindex,nofollow"/>':'';
 let html=template.replace(/<title>.*?<\/title>/,`<title>${title}</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${description}"/>`).replace('</head>',`${canonical}${noindex}<meta property="og:title" content="${title}"/><meta property="og:description" content="${description}"/><meta property="og:type" content="website"/><meta property="og:url" content="${origin}${path}"/><meta property="og:image" content="${origin}/social.svg"/><meta name="twitter:card" content="summary_large_image"/></head>`).replace('<div id="root"></div>',`<div id="root">${renderToString(createElement(App,{path}))}</div>`);
 const dir=path==='/'?base:new URL(path.slice(1),base);mkdirSync(dir,{recursive:true});writeFileSync(new URL('index.html',dir),html);
 if(path==='/404/')writeFileSync(new URL('404.html',base),html);
}
writeFileSync(new URL('sitemap.xml',base),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(([p])=>!['/portfolio-preview/','/404/','/privacy/','/account/reset/'].includes(p)).map(([p])=>`<url><loc>${origin}${p}</loc></url>`).join('')}</urlset>`);
writeFileSync(new URL('robots.txt',base),`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /portfolio-preview/\nSitemap: ${origin}/sitemap.xml\n`);
rmSync(new URL('../dist-ssr',import.meta.url),{recursive:true,force:true});
console.log('Prerendered public content and synthetic preview.');
