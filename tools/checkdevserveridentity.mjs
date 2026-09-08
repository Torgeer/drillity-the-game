#!/usr/bin/env node
// Real HTTP fixtures; --vite additionally exercises the installed Vite plugin.
import assert from 'node:assert/strict';
import {createServer,get} from 'node:http';
import {fileURLToPath} from 'node:url';
import {copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync} from 'node:fs';
import {basename, dirname, join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {servesThisTree,ensureServer} from './devserver.mjs';
import {sourceIdentity,SOURCE_IDENTITY_PATH} from './servedSourceIdentity.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
let cases=0,closed=0;
const request=(origin,path='/')=>new Promise((resolve,reject)=>{
 const req=get(origin+path,{agent:false},res=>{let body='';res.setEncoding('utf8');res.on('data',part=>body+=part);res.on('end',()=>resolve({status:res.statusCode,body}));res.on('error',reject);});
 req.setTimeout(8000,()=>req.destroy(new Error('Fixture request timeout')));req.on('error',reject);
});
async function fixture(label,change,run){
 const expected=sourceIdentity(root),requests=[],timers=new Set(),sockets=new Set();let drips=0;
 const server=createServer((req,res)=>{
  requests.push(req.url);
  let reply=req.url===SOURCE_IDENTITY_PATH?{status:200,body:JSON.stringify(expected)}:{status:200,body:'<!doctype html><title>Fixture</title>'};
  if(req.url===SOURCE_IDENTITY_PATH)reply=change?.(reply,structuredClone(expected))||reply;
  if(reply.disconnect){req.socket.destroy();return;}
  res.writeHead(reply.status,{'Content-Type':'application/json'});
  if(reply.drip){res.write(' ');const timer=setInterval(()=>{drips++;res.write(' ');},20);timers.add(timer);res.once('close',()=>{clearInterval(timer);timers.delete(timer);});}
  else res.end(reply.body);
 });
 server.on('connection',socket=>{sockets.add(socket);socket.once('close',()=>sockets.delete(socket));});
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const port=server.address().port,origin=`http://127.0.0.1:${port}`;
  await run({origin,port,server,requests,stats:()=>({drips,sockets:sockets.size})});
  assert.equal(requests.some(path=>path.includes('/@fs/')||path.includes('?raw')),false);
  cases++;console.log(`PASS ${label}`);
 }finally{
  for(const timer of timers)clearInterval(timer);
  if(server.listening)await new Promise((resolve,reject)=>{server.close(error=>error?reject(error):resolve());server.closeAllConnections();});
  assert.equal(server.listening,false);closed++;
 }
}
const accepted=async({origin,requests})=>{assert.deepEqual(await servesThisTree(origin),{ok:true});assert.deepEqual(requests,[SOURCE_IDENTITY_PATH]);};
const rejected=reason=>async({origin})=>{const result=await servesThisTree(origin);assert.equal(result.ok,false);assert.match(result.why,reason);};
const altered=mutate=>(reply,manifest)=>{mutate(manifest);return{...reply,body:JSON.stringify(manifest)};};
await fixture('exact configured root and complete source manifest',null,accepted);
await fixture('identical files under another root rejected',altered(m=>{m.root+='-other';}),rejected(/configured root differs/));
for(const path of ['package.json','index.html','vite.config.js','src/main.js','src/game/data.js','src/core/renderer.js','src/ui/styles.css']){
 await fixture(`changed ${path} rejected`,altered(m=>{const file=m.files.find(f=>f.path===path);assert.ok(file);file.sha256='0'.repeat(64);}),rejected(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))));
}
await fixture('missing source rejected',altered(m=>{m.files.pop();}),rejected(/file count/));
await fixture('duplicate cannot replace another source',altered(m=>{m.files[1]=m.files[0];}),rejected(/path inventory/));
await fixture('wrong byte length rejected',altered(m=>{m.files[0].bytes++;}),rejected(/differs for package/));
await fixture('unsupported schema rejected',altered(m=>{m.schema=2;}),rejected(/unsupported shape/));
await fixture('extra manifest field rejected',altered(m=>{m.extra=true;}),rejected(/unexpected fields/));
await fixture('extra file field rejected',altered(m=>{m.files[0].extra=true;}),rejected(/unexpected fields/));
for(const body of ['<!doctype html>old server','null','{"schema":1}','{"schema":','(()=>{throw Error("never execute")})()',JSON.stringify(sourceIdentity(root))+'; throw Error("never execute")']){
 await fixture('missing/malformed/non-JSON manifest rejected',r=>({...r,body}),rejected(/JSON manifest|unsupported shape/));
}
for(const status of [302,404,503])await fixture(`HTTP ${status} rejected`,r=>({...r,status}),rejected(new RegExp(`HTTP ${status}`)));
await fixture('oversize rejects instead of accepting prefix',r=>({...r,body:r.body+' '.repeat(2*1024*1024)}),rejected(/2 MiB/));
await fixture('connection failure rejected',()=>({disconnect:true}),rejected(/could not fetch/));
await fixture('drip cannot extend deadline or leak socket',r=>({...r,drip:true}),async({origin,stats})=>{
 const start=performance.now();const result=await servesThisTree(origin,{timeoutMs:250});const elapsed=performance.now()-start;
 assert.equal(result.ok,false);assert.match(result.why,/wall-clock deadline exceeded after 250 ms/);assert.ok(stats().drips>=2);assert.ok(elapsed>=200&&elapsed<2000,`Deadline took ${elapsed}ms`);
 await new Promise(resolve=>setTimeout(resolve,25));assert.equal(stats().sockets,0);
});
await fixture('reused server stays owned by operator',null,async({origin,port,server})=>{const handle=await ensureServer(port,()=>{});assert.equal(handle.spawned,false);handle.stop();handle.stop();assert.equal(server.listening,true);assert.equal((await request(origin)).status,200);});
await fixture('wrong-root refusal leaves server alive',altered(m=>{m.root+='-other';}),async({origin,port,server})=>{await assert.rejects(()=>ensureServer(port,()=>{}),/NOT this repository.*configured root differs/);assert.equal(server.listening,true);assert.equal((await request(origin)).status,200);});
assert.equal(closed,cases);console.log(`PASS ${cases} HTTP identity cases; ${closed} fixture servers closed.`);
if(process.argv.includes('--vite')){
 // Actual configured plugin and installed Vite; no browser. Explicit owned port.
 const {createServer:createVite,resolveConfig}=await import('vite');const {default:config}=await import('../vite.config.js');const before=sourceIdentity(root);let server;
 const buildConfig=await resolveConfig({...config,configFile:false},'build');
 assert.equal(buildConfig.plugins.some(plugin=>plugin.name==='drillity:served-source-identity'),false);
 console.log('PASS identity endpoint plugin excluded from production build configuration.');
 try{
  server=await createVite({...config,configFile:false,root,logLevel:'error',server:{...config.server,host:'127.0.0.1',port:5209,strictPort:true}});await server.listen();
  const origin=`http://127.0.0.1:${server.httpServer.address().port}`;const response=await request(origin,SOURCE_IDENTITY_PATH);
  assert.equal(response.status,200);assert.deepEqual(JSON.parse(response.body),before);assert.deepEqual(await servesThisTree(origin),{ok:true});assert.deepEqual(sourceIdentity(root),before,'Sources changed during actual Vite proof');
  console.log(`PASS installed Vite: ${before.files.length} exact files, root ${before.root}`);
 }finally{if(server)await server.close();}
 assert.equal(server.httpServer.listening,false);
 // Same exact sources under another configured root must still be refused.
 // Only this uniquely owned temporary fixture is edited below.
 const tempBase=realpathSync(tmpdir());
 const fixtureRoot=mkdtempSync(join(tempBase,'drillity-server-identity-'));
 let other;
 try{
  for(const file of before.files){
   const target=resolve(fixtureRoot,file.path);
   assert.ok(target.startsWith(fixtureRoot+(/\\/.test(fixtureRoot)?'\\':'/')));
   mkdirSync(dirname(target),{recursive:true});copyFileSync(resolve(root,file.path),target);
  }
  const fixtureBefore=sourceIdentity(fixtureRoot);
  assert.deepEqual(fixtureBefore.files,before.files);
  other=await createVite({...config,configFile:false,root:fixtureRoot,logLevel:'error',
   optimizeDeps:{noDiscovery:true,include:[]},
   server:{...config.server,host:'127.0.0.1',port:5209,strictPort:true}});
  await other.listen();const origin='http://127.0.0.1:5209';
  const wrongRoot=await servesThisTree(origin);
  assert.equal(wrongRoot.ok,false);assert.match(wrongRoot.why,/configured root differs/);
  assert.deepEqual(JSON.parse((await request(origin,SOURCE_IDENTITY_PATH)).body),fixtureBefore);
  const dataPath=resolve(fixtureRoot,'src/game/data.js');
  writeFileSync(dataPath,readFileSync(dataPath,'utf8')+'\n// isolated identity negative control\n');
  const changed=JSON.parse((await request(origin,SOURCE_IDENTITY_PATH)).body);
  assert.deepEqual(changed,sourceIdentity(fixtureRoot));
  assert.deepEqual(changed.files.filter((file,i)=>file.sha256!==fixtureBefore.files[i].sha256).map(file=>file.path),['src/game/data.js']);
  assert.deepEqual(sourceIdentity(root),before,'Main checkout changed during isolated negative controls');
  console.log('PASS real Vite wrong configured root refused; endpoint observes exact on-disk data.js change.');
 }finally{
  if(other)await other.close();
  const owned=realpathSync(fixtureRoot);
  assert.equal(dirname(owned),tempBase);
  assert.ok(basename(owned).startsWith('drillity-server-identity-'));
  rmSync(owned,{recursive:true,force:true});
 }
 assert.equal(other.httpServer.listening,false);
 console.log('PASS owned Vite5209 closed and temporary fixture removed; no browser/GPU started.');
}
