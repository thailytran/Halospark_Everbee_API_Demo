/**
 * Server-side-only EverBee Research API transport, prepared for post-approval integration.
 * IMPORTANT: this module is NOT imported into the browser and is not wired into this demo server.
 * Live access remains disabled until app installation is approved and credentials are vaulted.
 */
const BASE='https://research-open-api.everbee.com';
const ALLOWED=[/^\/api\/v1\/keywords(?:\/[A-Za-z0-9%+._~-]+)?$/, /^\/api\/v1\/listings(?:\/[A-Za-z0-9%+._~-]+)?$/];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export class EverBeeTransportError extends Error {
 constructor(code,status){super(code);this.name='EverBeeTransportError';this.code=code;this.status=status;}
}
export class EverBeeResearchTransport {
 constructor({clientId,clientSecret,enabled=false,fetchImpl=globalThis.fetch,timeoutMs=12000}={}){
  this.clientId=clientId;this.clientSecret=clientSecret;this.enabled=enabled;this.fetchImpl=fetchImpl;this.timeoutMs=timeoutMs;
 }
 async get(path,params={}){
  if(!this.enabled) throw new EverBeeTransportError('LIVE_NOT_ENABLED',403);
  if(!this.clientId||!this.clientSecret)throw new EverBeeTransportError('MISSING_SERVER_CREDENTIALS',401);
  if(!ALLOWED.some(pattern=>pattern.test(path)))throw new EverBeeTransportError('ENDPOINT_NOT_ALLOWED',400);
  const url=new URL(path,BASE);
  for(const [key,value] of Object.entries(params))if(value!==null&&value!==undefined)url.searchParams.set(key,String(value));
  for(let attempt=0;attempt<3;attempt++){
   const ac=new AbortController();const timer=setTimeout(()=>ac.abort(),this.timeoutMs);
   try{
    const res=await this.fetchImpl(url.toString(),{method:'GET',headers:{client_id:this.clientId,client_secret:this.clientSecret,Accept:'application/json'},signal:ac.signal});
    if(res.status===401)throw new EverBeeTransportError('UNAUTHORIZED',401);
    if(res.status===403)throw new EverBeeTransportError('ACCESS_DENIED',403);
    if(res.status===429){
     if(attempt===2)throw new EverBeeTransportError('RATE_LIMITED',429);
     const rawRetry=Number(res.headers.get('retry-after'));
     const waitMs=Number.isFinite(rawRetry)&&rawRetry>=0?Math.min(rawRetry*1000,20000):Math.min(750*(2**attempt)+Math.floor(Math.random()*250),20000);
     await sleep(waitMs);continue;
    }
    if(res.status>=500&&attempt<2){await sleep(300*(2**attempt));continue;}
    if(!res.ok)throw new EverBeeTransportError('EVERBEE_HTTP_ERROR',res.status);
    const data=await res.json();
    return {data,quota:{secondRemaining:res.headers.get('x-remaining-this-second'),todayRemaining:res.headers.get('x-remaining-today'),secondLimit:res.headers.get('x-limit-per-second'),dayLimit:res.headers.get('x-limit-per-day')}};
   } catch(err){if(err instanceof EverBeeTransportError)throw err;if(err.name==='AbortError')throw new EverBeeTransportError('TIMEOUT',408);throw new EverBeeTransportError('NETWORK_ERROR',0);}
   finally{clearTimeout(timer);}
  }
 }
}
