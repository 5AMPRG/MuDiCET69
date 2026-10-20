const VERSION='museo-cetis69-v1';
const NUCLEO=['index.html','salon-fama.html','libro-visitas.html','mapa-360.html','archivo-fotografico.html','creditos.html','qr-zonas.html','estilos.css','paginas.css','comun.js','qrcode.js','datos.json','manifest.webmanifest','iconos/icono-180.png','iconos/icono-192.png','iconos/icono-512.png'];
const EXTERNOS=['https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/js/all.min.js','https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800&display=swap'];
const ESPERA_RED=4000;

const guardar=async(cache,url,opciones)=>{
 try{
  const r=await fetch(new Request(url,opciones));
  if(r.ok||r.type==='opaque')await cache.put(url,r);
 }catch(e){}
};

self.addEventListener('install',e=>{
 e.waitUntil((async()=>{
  const cache=await caches.open(VERSION);
  let extra=[];
  try{
   const r=await fetch('datos.json',{cache:'reload'});
   if(r.ok){await cache.put('datos.json',r.clone());extra=(await r.json()).offline||[]}
  }catch(err){}
  await Promise.all([...NUCLEO,...extra].map(u=>guardar(cache,u,{cache:'reload'})));
  await Promise.all(EXTERNOS.map(u=>guardar(cache,u,{mode:'no-cors'})));
  await self.skipWaiting();
 })());
});

self.addEventListener('activate',e=>{
 e.waitUntil((async()=>{
  const nombres=await caches.keys();
  await Promise.all(nombres.filter(n=>n!==VERSION).map(n=>caches.delete(n)));
  await self.clients.claim();
 })());
});

const conEspera=req=>Promise.race([fetch(req),new Promise((_,no)=>setTimeout(no,ESPERA_RED))]);

const redPrimero=async req=>{
 const cache=await caches.open(VERSION);
 try{
  const r=await conEspera(req);
  if(r.ok)cache.put(req,r.clone());
  return r;
 }catch(err){
  const guardado=await cache.match(req,{ignoreSearch:true});
  if(guardado)return guardado;
  if(req.mode==='navigate'){
   const inicio=await cache.match('museo-cetis69.html');
   if(inicio)return inicio;
  }
  return Response.error();
 }
};

const guardadoPrimero=async req=>{
 const cache=await caches.open(VERSION);
 const guardado=await cache.match(req);
 const actualizar=fetch(req).then(r=>{
  if(r.ok||r.type==='opaque')cache.put(req,r.clone());
  return r;
 }).catch(()=>guardado||Response.error());
 return guardado||actualizar;
};

self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET'||req.headers.has('range'))return;
 const url=new URL(req.url);
 if(url.protocol!=='http:'&&url.protocol!=='https:')return;
 const propio=url.origin===location.origin;
 const codigo=propio&&(req.mode==='navigate'||/\.(html|css|js|json|webmanifest)$/i.test(url.pathname)||url.pathname.endsWith('/'));
 e.respondWith(codigo?redPrimero(req):guardadoPrimero(req));
});
