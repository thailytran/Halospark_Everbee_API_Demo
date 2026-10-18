import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EverBeeResearchTransport} from '../src/everbee-client.mjs';
test('live disabled by default, no network call',async()=>{
 let called=false;const t=new EverBeeResearchTransport({clientId:'id',clientSecret:'secret',fetchImpl:()=>{called=true;}});
 await assert.rejects(t.get('/api/v1/keywords'),{code:'LIVE_NOT_ENABLED'});
 assert.equal(called,false);
});
test('live transport sends documented headers server-side and reads quota',async()=>{
 let request;
 const fakeFetch=async(url,opts)=>{request={url,opts};return {ok:true,status:200,headers:new Headers({'x-remaining-today':'15'}),json:async()=>({data:[]})};};
 const t=new EverBeeResearchTransport({clientId:'ID_REDACTED',clientSecret:'SECRET_REDACTED',enabled:true,fetchImpl:fakeFetch});
 const response=await t.get('/api/v1/keywords',{keyword_include:'mandala'});
 assert.match(request.url,/keyword_include=mandala/);
 assert.equal(request.opts.headers.client_id,'ID_REDACTED');
 assert.equal(request.opts.headers.client_secret,'SECRET_REDACTED');
 assert.equal(response.quota.todayRemaining,'15');
});
test('authentication error classified without credential leakage',async()=>{
 const t=new EverBeeResearchTransport({clientId:'ID_REDACTED',clientSecret:'SECRET_REDACTED',enabled:true,fetchImpl:async()=>({status:401,ok:false})});
 await assert.rejects(t.get('/api/v1/keywords'),err=>err.code==='UNAUTHORIZED'&&!JSON.stringify(err).includes('SECRET_REDACTED'));
});
test('arbitrary URLs and write methods unavailable',async()=>{
 const t=new EverBeeResearchTransport({clientId:'id',clientSecret:'secret',enabled:true});
 await assert.rejects(t.get('https://evil.example/collect'),{code:'ENDPOINT_NOT_ALLOWED'});
 assert.equal(typeof t.post,'undefined');
});
