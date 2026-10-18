import crypto from 'node:crypto';

const SESSION_DURATION_SECONDS = 8*60*60;
const LOGIN_WINDOW_MS = 10*60*1000;
const MAX_FAILURES = 8;
const htmlEscape = value => String(value).replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function createReviewerAuth({username, password, requireCredentials=false, secureCookie=false}={}){
  const configured=Boolean(username && password);
  if(Boolean(username)!==Boolean(password))throw new Error('Both REVIEW_USERNAME and REVIEW_PASSWORD must be set.');
  if(requireCredentials&&!configured)throw new Error('Public hosting is forbidden without REVIEW_USERNAME and REVIEW_PASSWORD.');
  if(configured && (password.length<12 || username.length<3))throw new Error('Reviewer username must have at least 3 characters and password at least 12 characters.');
  const signingKey=crypto.randomBytes(32);
  const salt=crypto.randomBytes(16);
  const reference=configured?crypto.scryptSync(password,salt,64):null;
  const failures=new Map();
  const cookieName='hs_reviewer_session';
  const sign=value=>crypto.createHmac('sha256',signingKey).update(value).digest('base64url');
  const cookieAttrs=`HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}${secureCookie?'; Secure':''}`;
  const isAuthenticated=req=>{
    if(!configured)return true;
    const cookie=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='));
    if(!cookie)return false;
    const token=cookie.slice(cookieName.length+1);
    const parts=token.split('.');
    if(parts.length!==2 || parts[0].length>500 || parts[1].length>100)return false;
    const expected=Buffer.from(sign(parts[0]));
    const provided=Buffer.from(parts[1]);
    if(expected.length!==provided.length||!crypto.timingSafeEqual(expected,provided))return false;
    try{
      const payload=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'));
      return payload.user===username && Number.isFinite(payload.exp) && Date.now()<payload.exp && payload.exp<=Date.now()+SESSION_DURATION_SECONDS*1000;
    } catch {return false;}
  };
  const sendLogin=(res,{invalid=false,limited=false}={})=>{
    const message=limited?'Too many attempts. Please try again later.':invalid?'Username or password incorrect.':'';
    const page=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HaloSpark | Reviewer Login</title><style>*,*:before,*:after{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 85% 7%,#163151 0,transparent 50%),#0d1219;color:#e8f1fa;font:16px system-ui,Segoe UI,Arial,sans-serif;min-height:100vh;display:grid;place-items:center;padding:20px}.panel{width:min(430px,100%);background:#151d2a;border:1px solid #263d56;border-radius:18px;padding:35px;box-shadow:0 25px 100px #060a1180}.mark{display:inline-grid;place-items:center;background:#1976fa;width:48px;height:48px;border-radius:12px;font-weight:800;font-size:25px}h1{font-size:24px;margin:19px 0 7px}.sub{color:#9db0c5;line-height:1.5;margin:0 0 26px}.badge{display:inline-block;background:#1e343e;color:#6bdec4;border:1px solid #2d665e;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:.05em}.field{display:block;margin:17px 0 7px;color:#cdd9e7;font-size:13px;font-weight:700}input{width:100%;padding:13px 14px;border:1px solid #35506b;border-radius:9px;background:#0c141e;color:white;font-size:16px}input:focus{outline:2px solid #328af7}button{width:100%;margin-top:22px;padding:14px;background:#1675f8;color:#fff;border:0;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer}.note{font-size:12px;color:#8fa5bc;margin:22px 0 0}.error{color:#ffc8bd;padding-top:12px;font-size:13px}</style></head><body><main class="panel"><div class="mark">H</div><h1>HaloSpark Review Portal</h1><p class="sub">EverBee Research API Integration Demonstration</p><p class="badge">MOCK DATA · NO LIVE EVERBEE REQUESTS</p><form action="/login" method="post" autocomplete="on"><label class="field" for="username">Username</label><input id="username" name="username" autocomplete="username" required maxlength="128"><label class="field" for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="256"><button type="submit">Sign in to Demo</button>${message?`<p class="error" role="alert">${htmlEscape(message)}</p>`:''}</form><p class="note">Reviewer-only preview. All research metrics are synthetic and all API requests are simulated.</p></main></body></html>`;
    res.writeHead(limited?429:invalid?401:200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff'});
    res.end(page);
  };
  const postLogin=async(req,res)=>{
    const ip=req.socket.remoteAddress||'unknown';
    const now=Date.now();
    const f=failures.get(ip)||{count:0,until:0};
    if(f.until && now>f.until){f.count=0;f.until=0;}
    if(f.count>=MAX_FAILURES)return sendLogin(res,{limited:true});
    let size=0;const buffers=[];
    try{
      for await(const chunk of req){size+=chunk.length;if(size>4096){res.writeHead(413);return res.end('Request too large');}buffers.push(chunk);}
      const form=new URLSearchParams(Buffer.concat(buffers).toString('utf8'));
      const pass=String(form.get('password')||'');
      const user=String(form.get('username')||'');
      const digest=crypto.scryptSync(pass,salt,64);
      const goodPass=crypto.timingSafeEqual(digest,reference);
      if(!goodPass || user!==username){
        failures.set(ip,{count:f.count+1,until:now+LOGIN_WINDOW_MS});
        return sendLogin(res,{invalid:true});
      }
      failures.delete(ip);
      const payload=Buffer.from(JSON.stringify({user:username,exp:now+SESSION_DURATION_SECONDS*1000})).toString('base64url');
      const token=`${payload}.${sign(payload)}`;
      res.writeHead(303,{'Location':'/','Set-Cookie':`${cookieName}=${token}; ${cookieAttrs}`,'Cache-Control':'no-store'});
      res.end();
    } catch {res.writeHead(400);res.end('Invalid request');}
  };
  const logout=(req,res)=>{
    res.writeHead(303,{'Location':'/login','Set-Cookie':`${cookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureCookie?'; Secure':''}`});res.end();
  };
  return {enabled:configured,isAuthenticated,sendLogin,postLogin,logout};
}
