import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {computeScores} from './src/scoring.mjs';
import {createReviewerAuth} from './src/reviewer-auth.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const publicDir=path.join(root,'public');
const port=Number(process.env.PORT||4177);
const host=process.env.REVIEW_BIND_HOST || '127.0.0.1';
const publicHosting=host==='0.0.0.0';
const reviewerAuth=createReviewerAuth({username:process.env.REVIEW_USERNAME,password:process.env.REVIEW_PASSWORD,requireCredentials:publicHosting,secureCookie:publicHosting});
const fixtures=JSON.parse(fs.readFileSync(path.join(root,'data','keywords.json'),'utf8'));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const sendJSON=(res,data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
const sendStatic=(pathname,res)=>{
 const pathnameSafe=path.normalize(decodeURIComponent(pathname)).replace(/^([/\\]+|\.\.(?:[/\\]|$))+/,'');
 let full=path.resolve(publicDir,pathnameSafe||'index.html');
 if(!full.startsWith(publicDir+path.sep)&&full!==path.join(publicDir,'index.html'))return sendJSON(res,{error:'forbidden'},403);
 if(!fs.existsSync(full)||!fs.statSync(full).isFile()) full=path.join(publicDir,'index.html');
 res.writeHead(200,{'Content-Type':types[path.extname(full)]||'text/plain','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
 fs.createReadStream(full).pipe(res);
};
export const server=http.createServer((req,res)=>{
 try {
  const u=new URL(req.url,`http://localhost:${port}`);
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  if(u.pathname==='/healthz')return sendJSON(res,{status:'up'});
  if(reviewerAuth.enabled){
   if(u.pathname==='/login' && req.method==='GET')return reviewerAuth.sendLogin(res);
   if(u.pathname==='/login' && req.method==='POST')return reviewerAuth.postLogin(req,res);
   if(u.pathname==='/logout' && req.method==='POST')return reviewerAuth.logout(req,res);
   if(!reviewerAuth.isAuthenticated(req)){
    if(u.pathname.startsWith('/api/'))return sendJSON(res,{error:'REVIEWER_LOGIN_REQUIRED'},401);
    res.writeHead(302,{Location:'/login','Cache-Control':'no-store'});return res.end();
   }
  }
  if(u.pathname==='/api/health')return sendJSON(res,{status:'OK',mode:'MOCK',provider:'EverBee (SIMULATED)',everbee_live_calls:0});
  if(u.pathname==='/api/research'){
   if(req.method!=='GET')return sendJSON(res,{error:'method_not_allowed'},405);
   const family=(u.searchParams.get('family')||'COLORING').toUpperCase();
   const seed=(u.searchParams.get('seed')||'').trim().toLowerCase();
   if(seed.length>160)return sendJSON(res,{error:'seed_too_long'},400);
   let filtered=fixtures.filter(r=>r.family===family);
   // Loose token matching for opportunities rather than requiring the entire seed phrase.
   const stop=new Set(['book','books','for','and','the','by','of','pages','printable','digital','adult','adults','coloring']);
   const tokens=seed.split(/[^a-z0-9]+/).filter(t=>t.length>=3&&!stop.has(t));
   if(tokens.length)filtered=filtered.filter(r=>tokens.some(t=>r.keyword.includes(t)));
   const result=computeScores(filtered);
   return sendJSON(res,{data_mode:'MOCK',is_live:false,provider:'EVERBEE_SIMULATED',source:'SYNTHETIC_FIXTURES_ONLY',job_id:`MOCK-${Date.now()}`,query:{seed,family},result,request_trace:[
    {type:'MOCK FIXTURE',step:'Keyword discovery',path:'/api/v1/keywords',status:'SIMULATED',detail:'Constructed request parameters; no external request'},
    {type:'MOCK FIXTURE',step:'Keyword details',path:'/api/v1/keywords/{keyword}',status:'SIMULATED',detail:'Synthetic keyword metrics loaded from local fixture'},
    {type:'NORMALIZATION',step:'Normalize & deduplicate',path:'local://m01/cleaning',status:'COMPLETE',detail:`${result.duplicates} duplicates removed; ${result.invalid} invalid rows excluded`},
    {type:'ALGORITHM',step:'Blue Ocean scoring',path:'local://m01/scoring',status:'COMPLETE',detail:result.profileVersion}
   ]});
  }
  if(u.pathname.startsWith('/api/live'))return sendJSON(res,{error:'LIVE_NOT_ENABLED',reason:'EverBee approval pending; this isolated demo does not send live requests or accept credentials. Integrate server-side credential vault into the real CORE adapter after approval.'},403);
  if(u.pathname.startsWith('/api/'))return sendJSON(res,{error:'not_found'},404);
  if(u.pathname==='/src/scoring.mjs'){res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'});return fs.createReadStream(path.join(root,'src','scoring.mjs')).pipe(res);}
  return sendStatic(u.pathname,res);
 } catch(error){return sendJSON(res,{error:'request_failed',details:String(error.message||error)},500);}
});
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(port,host,()=>console.log(`HaloSpark M01 REVIEW DEMO (MOCK) listening on ${host}:${port} | Reviewer login: ${reviewerAuth.enabled?'ENABLED':'LOCAL ONLY (DISABLED)'}`));
