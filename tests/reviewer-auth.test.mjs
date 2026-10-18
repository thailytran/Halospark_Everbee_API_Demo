import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createReviewerAuth} from '../src/reviewer-auth.mjs';
import {Readable} from 'node:stream';

function response(){return {status:0,headers:{},body:'',writeHead(status,headers={}){this.status=status;this.headers=headers;},end(body=''){this.body=body;}};}
function request(user,pass,cookie=''){
 const r=Readable.from([Buffer.from(new URLSearchParams({username:user,password:pass}).toString())]);
 r.headers={cookie};r.socket={remoteAddress:'127.0.0.1'};return r;
}
test('public hosting refuses missing credentials',()=>{
 assert.throws(()=>createReviewerAuth({requireCredentials:true}),/forbidden/i);
 assert.throws(()=>createReviewerAuth({username:'reviewer',requireCredentials:true}),/both/i);
});
test('reviewer login authenticates only matching credentials',async()=>{
 const a=createReviewerAuth({username:'everbee_reviewer',password:'example-strong-password',requireCredentials:true});
 const login=response();a.sendLogin(login);assert.equal(login.status,200);assert.match(login.body,/MOCK DATA/);
 const bad=response();await a.postLogin(request('everbee_reviewer','bad-password'),bad);assert.equal(bad.status,401);
 const good=response();await a.postLogin(request('everbee_reviewer','example-strong-password'),good);assert.equal(good.status,303);
 const cookie=good.headers['Set-Cookie'].split(';')[0];
 assert.equal(a.isAuthenticated({headers:{cookie}}),true);
 assert.equal(a.isAuthenticated({headers:{cookie:cookie.replace(/.$/,'X')}}),false);
 assert.equal(a.isAuthenticated({headers:{cookie:''}}),false);
});
test('hosted login cookie uses Secure, HttpOnly, SameSite',async()=>{
 const a=createReviewerAuth({username:'everbee_reviewer',password:'example-strong-password',secureCookie:true});
 const good=response();await a.postLogin(request('everbee_reviewer','example-strong-password'),good);
 assert.match(good.headers['Set-Cookie'],/; Secure/);
 assert.match(good.headers['Set-Cookie'],/HttpOnly/);
 assert.match(good.headers['Set-Cookie'],/SameSite=Lax/);
});
