/* Museo 3D · visor en primera persona (Three.js r128 desde jsDelivr).
   Lo carga mapa-360.html cuando la sección está desbloqueada: Museo3D.iniciar(contenedor, datos).
   Convenciones del modelo (Blender): inicio = punto de partida · sala_1980s... = salas · info_xxx = cuadros que se tocan. */
(function(){
const CDN='https://cdn.jsdelivr.net/npm/three@0.128.0';
const cargaJs=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error(src));document.head.append(s)});
const msg=(c,t)=>{c.innerHTML='<p class="v3d-msg">'+t+'</p>'};
let listo=false;
window.Museo3D={async iniciar(cont,D){
 if(listo)return;listo=true;
 const cfg=(D.ajustes&&D.ajustes.museo3d)||{};
 msg(cont,'Cargando museo…');
 try{
  if(!window.THREE)await cargaJs(CDN+'/build/three.min.js');
  if(!THREE.GLTFLoader)await cargaJs(CDN+'/examples/js/loaders/GLTFLoader.js');
 }catch(e){listo=false;msg(cont,'No se pudo cargar el visor. Revisa tu conexión.');return}
 const gltf=await new Promise((ok,no)=>new THREE.GLTFLoader().load(cfg.modelo||'museo3d/museo.glb',ok,x=>{if(x.total)msg(cont,'Cargando museo… '+Math.round(x.loaded/x.total*100)+'%')},no)).catch(()=>null);
 if(!gltf){listo=false;msg(cont,'No se encontró el modelo del museo.');return}
 construir(cont,gltf.scene,cfg.info||{});
}};

function construir(cont,modelo,info){
 const T=THREE,V3=T.Vector3,div=(css,txt)=>{const d=document.createElement('div');d.style.cssText=css;if(txt)d.textContent=txt;cont.append(d);return d};
 cont.innerHTML='';
 const R=new T.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));
 const cv=R.domElement;cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab';cont.append(cv);
 const sc=new T.Scene();sc.background=new T.Color(0x1a0a10);
 sc.add(new T.HemisphereLight(0xffffff,0x6a5560,1.05));const sol=new T.DirectionalLight(0xffffff,.55);sol.position.set(5,10,4);sc.add(sol);
 sc.add(modelo);
 const cam=new T.PerspectiveCamera(70,1,.05,200);cam.rotation.order='YXZ';
 const mallas=[];
 modelo.traverse(o=>{if(o.isMesh){mallas.push(o);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.side=T.DoubleSide)}});
 modelo.updateMatrixWorld(true);
 const caja=new T.Box3().setFromObject(modelo),tam=caja.getSize(new V3()),cen=caja.getCenter(new V3());
 const rc=new T.Raycaster(),ABAJO=new V3(0,-1,0),ARRIBA=new V3(0,1,0);
 const rayo=(o,d,far)=>{rc.set(o,d);rc.far=far;return rc.intersectObjects(mallas,false)[0]};
 const suelo=(x,z,desdeY)=>{const h=rayo(new V3(x,desdeY,z),ABAJO,desdeY-caja.min.y+3);return h?h.point.y:null};
 const hayEspacio=(x,y,z)=>!rayo(new V3(x,y+.05,z),ARRIBA,1.9);

 /* Punto de partida: objeto "inicio" o el primer lugar con piso y espacio libre */
 const pos=new V3();let pisoY=caja.min.y,libre=false,yaw=0,pitch=0,ini=null;
 modelo.traverse(o=>{if(!ini&&/^inicio/i.test(o.name))ini=o});
 if(ini){
  const p=ini.getWorldPosition(new V3()),y=suelo(p.x,p.z,p.y+.5);
  pos.set(p.x,0,p.z);pisoY=y!==null?y:p.y;
  yaw=new T.Euler().setFromQuaternion(ini.getWorldQuaternion(new T.Quaternion()),'YXZ').y;
 }else{
  let ok=false;
  for(let i=0;i<25&&!ok;i++){
   const x=caja.min.x+tam.x*(.5+((i%5)-2)*.15),z=caja.min.z+tam.z*(.5+(((i/5)|0)-2)*.15),y=suelo(x,z,caja.max.y+1);
   if(y!==null&&hayEspacio(x,y,z)){pos.set(x,0,z);pisoY=y;ok=true}
  }
  if(!ok){libre=true;pos.set(cen.x,0,cen.z);pisoY=caja.min.y}
 }

 /* Movimiento con choques: paredes (2 alturas) y piso */
 const RAD=.35;
 const choca=(dx,dz)=>{const L=Math.hypot(dx,dz);if(!L)return false;const d=new V3(dx/L,0,dz/L);return[.35,1].some(h=>rayo(new V3(pos.x,pisoY+h,pos.z),d,RAD+L))};
 function mover(dx,dz){
  for(const[ax,az]of[[dx,dz],[dx,0],[0,dz]]){
   if(!ax&&!az)continue;
   if(choca(ax,az))continue;
   const nx=pos.x+ax,nz=pos.z+az;
   if(!libre){const y=suelo(nx,nz,pisoY+1.6);if(y===null||y-pisoY>.45||pisoY-y>1.2)continue;pisoY=y}
   pos.x=nx;pos.z=nz;return;
  }
 }

 /* Entradas: teclado, arrastrar para mirar, toque, joystick */
 let visible=true;new IntersectionObserver(e=>{visible=e[0].isIntersecting}).observe(cont);
 const modalAbierto=()=>{const m=document.getElementById('modal');return m&&m.classList.contains('on')};
 const tec={},joy={x:0,y:0},tactil=matchMedia('(pointer:coarse)').matches;
 addEventListener('keydown',e=>{if(!visible||modalAbierto())return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();tec[k]=true});
 addEventListener('keyup',e=>{tec[e.key.toLowerCase()]=false});
 addEventListener('blur',()=>{for(const k in tec)tec[k]=false});
 let mirar=null;
 cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';mirar={id:e.pointerId,x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t:performance.now()}});
 cv.addEventListener('pointermove',e=>{if(!mirar||e.pointerId!==mirar.id)return;yaw-=(e.clientX-mirar.x)*.0045;pitch=Math.max(-1.2,Math.min(1.2,pitch-(e.clientY-mirar.y)*.0045));mirar.x=e.clientX;mirar.y=e.clientY});
 cv.addEventListener('pointerup',e=>{if(!mirar||e.pointerId!==mirar.id)return;cv.style.cursor='grab';if(Math.hypot(e.clientX-mirar.x0,e.clientY-mirar.y0)<6&&performance.now()-mirar.t<400)tocar(e);mirar=null});
 cv.addEventListener('pointercancel',()=>{mirar=null;cv.style.cursor='grab'});
 cv.addEventListener('contextmenu',e=>e.preventDefault());

 /* Tocar un cuadro (objeto cuyo nombre empieza con info_) abre su información */
 function tocar(e){
  const r=cv.getBoundingClientRect();
  rc.setFromCamera({x:(e.clientX-r.left)/r.width*2-1,y:-((e.clientY-r.top)/r.height*2-1)},cam);rc.far=30;
  const h=rc.intersectObjects(mallas,false)[0];if(!h)return;
  let o=h.object;while(o&&!/^info_/i.test(o.name))o=o.parent;
  if(!o||!window.openM)return;
  const d=info[o.name]||{};
  openM({n:d.titulo||o.name.replace(/^info_/i,'').replace(/_/g,' '),r:d.detalle||'',d:d.texto||'Aquí irá la información de este cuadro.',k:'museo3d',th:false});
 }

 /* Interfaz: sala actual, ayuda, joystick y minimapa */
 const hud=div('position:absolute;left:.8rem;top:.8rem;z-index:3;padding:.45rem .8rem;background:rgba(20,9,13,.7);color:#fff;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;pointer-events:none','Museo CETIS 69');
 const ayuda=div('position:absolute;left:50%;bottom:1rem;transform:translateX(-50%);z-index:3;padding:.5rem .9rem;background:rgba(20,9,13,.75);color:#fff;font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;pointer-events:none;transition:opacity 1s;white-space:nowrap',tactil?'Joystick para moverte · Arrastra para mirar':'W A S D para moverte · Arrastra para mirar');
 setTimeout(()=>{ayuda.style.opacity=0},7000);
 const salas=[];modelo.traverse(o=>{if(/^sala_/i.test(o.name))salas.push({n:o.name.replace(/^sala_/i,'').replace(/_/g,' '),b:new T.Box3().setFromObject(o)})});
 if(tactil){
  const base=div('position:absolute;left:1.1rem;bottom:1.4rem;z-index:3;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.35);touch-action:none'),
        knob=div('position:absolute;left:34px;top:34px;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.75);pointer-events:none');
  base.append(knob);let jid=null;
  const jm=e=>{const r=base.getBoundingClientRect();let dx=e.clientX-(r.left+60),dy=e.clientY-(r.top+60);const l=Math.hypot(dx,dy);if(l>60){dx*=60/l;dy*=60/l}joy.x=dx/60;joy.y=dy/60;knob.style.transform='translate('+dx+'px,'+dy+'px)'};
  base.addEventListener('pointerdown',e=>{jid=e.pointerId;base.setPointerCapture(jid);jm(e)});
  base.addEventListener('pointermove',e=>{if(e.pointerId===jid)jm(e)});
  const jf=e=>{if(e.pointerId!==jid)return;jid=null;joy.x=joy.y=0;knob.style.transform=''};
  base.addEventListener('pointerup',jf);base.addEventListener('pointercancel',jf);
 }
 const mm=document.createElement('canvas');mm.width=mm.height=150;
 mm.style.cssText='position:absolute;right:.8rem;bottom:.8rem;z-index:3;width:120px;height:120px;background:rgba(20,9,13,.7);border:1px solid rgba(255,255,255,.25);pointer-events:none';
 if(tactil)mm.style.bottom='4.4rem';cont.append(mm);
 const mc=mm.getContext('2d'),bs=document.createElement('canvas');bs.width=bs.height=150;
 const bx=bs.getContext('2d'),esc=Math.min(130/(tam.x||1),130/(tam.z||1)),ox=75-cen.x*esc,oz=75-cen.z*esc;
 let nt=0;mallas.forEach(m=>{const g=m.geometry;nt+=(g.index?g.index.count:g.attributes.position.count)/3});
 const paso=Math.max(1,Math.floor(nt/30000)),v=new V3();
 bx.fillStyle=bx.strokeStyle='#8a3a50';bx.lineWidth=.6;
 mallas.forEach(m=>{
  const g=m.geometry,p=g.attributes.position,ix=g.index,n=(ix?ix.count:p.count)/3;
  for(let t=0;t<n;t+=paso){
   bx.beginPath();
   for(let k=0;k<3;k++){v.fromBufferAttribute(p,ix?ix.getX(t*3+k):t*3+k).applyMatrix4(m.matrixWorld);const X=v.x*esc+ox,Z=v.z*esc+oz;k?bx.lineTo(X,Z):bx.moveTo(X,Z)}
   bx.closePath();bx.fill();bx.stroke();
  }
 });
 function dibujaMapa(){
  mc.clearRect(0,0,150,150);mc.drawImage(bs,0,0);
  const x=pos.x*esc+ox,z=pos.z*esc+oz,fx=-Math.sin(yaw),fz=-Math.cos(yaw);
  mc.strokeStyle='#fff';mc.lineWidth=2;mc.beginPath();mc.moveTo(x,z);mc.lineTo(x+fx*14,z+fz*14);mc.stroke();
  mc.fillStyle='#4aa3ff';mc.beginPath();mc.arc(x,z,5,0,7);mc.fill();mc.strokeStyle='#fff';mc.lineWidth=1.5;mc.stroke();
 }

 /* Tamaño y bucle de dibujo */
 const ajusta=()=>{const w=cont.clientWidth,h=cont.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()};
 new ResizeObserver(ajusta).observe(cont);ajusta();
 const reloj=new T.Clock();let camY=pisoY+1.6,salaAct='';
 (function bucle(){
  requestAnimationFrame(bucle);
  const dt=Math.min(reloj.getDelta(),.05);
  if(!visible||document.hidden)return;
  let f=(tec.w||tec.arrowup?1:0)-(tec.s||tec.arrowdown?1:0)-joy.y,r=(tec.d||tec.arrowright?1:0)-(tec.a||tec.arrowleft?1:0)+joy.x;
  const l=Math.hypot(f,r);if(l>1){f/=l;r/=l}
  if(l>.05&&!modalAbierto()){const sp=(tec.shift?4:2.4)*dt;mover((-Math.sin(yaw)*f+Math.cos(yaw)*r)*sp,(-Math.cos(yaw)*f-Math.sin(yaw)*r)*sp)}
  camY+=(pisoY+1.6-camY)*Math.min(1,dt*8);
  cam.position.set(pos.x,camY,pos.z);cam.rotation.set(pitch,yaw,0);
  const s=salas.find(s=>pos.x>=s.b.min.x&&pos.x<=s.b.max.x&&pos.z>=s.b.min.z&&pos.z<=s.b.max.z),nom=s?'Sala '+s.n:'Museo CETIS 69';
  if(nom!==salaAct){salaAct=nom;hud.textContent=nom}
  dibujaMapa();R.render(sc,cam);
 })();
}
})();