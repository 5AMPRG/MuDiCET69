/* Museo 3D · visor en primera persona (Three.js r128 desde jsDelivr).
   Lo carga mapa-360.html: Museo3D.iniciar(contenedor, datos).
   Convenciones del modelo (Blender → glb):
   · inicio o spawn = punto de partida y dirección de mirada
   · parada_1…parada_N = visita guiada · poi_xxx = puntos de información (botón "i")
   · sala_xxx = nombre de sala en pantalla · info_xxx = cuadros que se tocan
   · col_xxx = malla de colisión (invisible; si no existe se usan las mallas del modelo)
   Opciones en datos.ajustes.museo3d: modelo, info, alturaOjos (4.5), velocidad (9), ao (0.6), srgb (true), cielo (true)
   info = { poi_mural: {titulo, detalle, texto}, parada_3: {titulo, texto}, … } */
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
 construir(cont,gltf.scene,cfg);
}};

/* Textos de respaldo si el glb no trae titulo/texto (se pueden sobreescribir en cfg.info) */
const TIT={parada_1:'Bienvenida al museo',parada_2:'Vestíbulo y banners',parada_3:'Línea del tiempo: los 90',parada_4:'Línea del tiempo: 2020',parada_5:'Cuadro del museo',parada_6:'Mural de la galería',parada_7:'La pantera',parada_8:'Fuente del jardín',poi_pantera:'La pantera',poi_mural:'Mural',poi_letras:'CETIS 69',poi_museo:'Museo'};
const PENDIENTE='Próximamente: aquí irá la información de este lugar.';
/* Objetos del modelo que abren un poi al tocarlos */
const TOCABLE={mural:'poi_mural',museo:'poi_museo',cuadro:'poi_museo',cetis69:'poi_letras',exibidor:'poi_pantera'};
/* Piezas que no bloquean el paso cuando no hay malla col_ */
const NO_COLISION=/^(luces|lampara|luz-led|reflector|poste|banner|mural|los\d|panteras|pantalla|cetis69|cube|aud_(luces|cortinas|butacas|marco|cabina_ventana|paneles|salidas|barandal))/i;

function construir(cont,modelo,cfg){
 const info=cfg.info||{};
 const T=THREE,V3=T.Vector3,div=(css,txt,pad)=>{const d=document.createElement('div');d.style.cssText=css;if(txt)d.textContent=txt;(pad||cont).append(d);return d};
 cont.innerHTML='';
 const U=(cfg.alturaOjos||4.5)/1.6,OJOS=1.6*U,VEL=cfg.velocidad||9;   /* U = unidades del modelo por metro */
 const R=new T.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));
 if(cfg.srgb!==false)R.outputEncoding=T.sRGBEncoding;
 const cv=R.domElement;cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab';cont.append(cv);
 const sc=new T.Scene(),HOR=0xdcecf7;sc.background=new T.Color(HOR);sc.fog=new T.Fog(HOR,350,1100);
 sc.add(new T.HemisphereLight(0xffffff,0x6a5560,.95));const sol=new T.DirectionalLight(0xfff4e0,.55);sol.position.set(60,120,40);sc.add(sol);
 let cielo=null;
 if(cfg.cielo!==false){
  cielo=new T.Mesh(new T.SphereGeometry(1400,24,12),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,
   uniforms:{a:{value:new T.Color(0x4f86d0)},b:{value:new T.Color(HOR)}},
   vertexShader:'varying float h;void main(){h=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'uniform vec3 a,b;varying float h;void main(){gl_FragColor=vec4(mix(b,a,pow(clamp(h,0.,1.),.5)),1.);}'}));
  cielo.renderOrder=-1;sc.add(cielo);
 }
 sc.add(modelo);
 const cam=new T.PerspectiveCamera(70,1,.05*U,3000);cam.rotation.order='YXZ';
 const mallas=[],cols=[],anc={},aniso=Math.min(8,R.capabilities.getMaxAnisotropy());
 modelo.traverse(o=>{
  if(/^(inicio|spawn|parada_\d+|poi_.+)$/i.test(o.name))anc[o.name.toLowerCase()]=o;
  if(!o.isMesh)return;
  if(/^col_/i.test(o.name)){o.visible=false;cols.push(o);return}
  mallas.push(o);
  const g=o.geometry;if(g.attributes.uv&&!g.attributes.uv2)g.setAttribute('uv2',g.attributes.uv);   /* AO horneado en un solo canal UV */
  (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.side=T.DoubleSide;if(m.map)m.map.anisotropy=aniso;if(m.aoMap)m.aoMapIntensity=cfg.ao||.6});
 });
 modelo.updateMatrixWorld(true);
 const colis=cols.length?cols:mallas.filter(m=>{for(let o=m;o&&o!==modelo;o=o.parent)if(NO_COLISION.test(o.name))return false;return true});
 const caja=new T.Box3();mallas.forEach(m=>{if(!/^(superficie)$/i.test(m.name))caja.expandByObject(m)});
 const tam=caja.getSize(new V3()),cen=caja.getCenter(new V3());
 const rc=new T.Raycaster(),ABAJO=new V3(0,-1,0),ARRIBA=new V3(0,1,0);
 const rayo=(o,d,far,lista)=>{rc.set(o,d);rc.far=far;return rc.intersectObjects(lista||colis,false)[0]};
 const suelo=(x,z,desdeY)=>{const h=rayo(new V3(x,desdeY,z),ABAJO,desdeY-caja.min.y+3*U);return h?h.point.y:null};
 const hayEspacio=(x,y,z)=>!rayo(new V3(x,y+.05*U,z),ARRIBA,1.9*U);

 /* Punto de partida: anchor inicio/spawn, o el primer lugar con piso y espacio libre */
 const pos=new V3();let pisoY=caja.min.y,libre=false,yaw=0,pitch=0;
 const miraDe=a=>{const d=new V3(0,0,-1).applyQuaternion(a.getWorldQuaternion(new T.Quaternion()));yaw=Math.atan2(-d.x,-d.z);pitch=Math.max(-1.2,Math.min(1.2,Math.asin(Math.max(-1,Math.min(1,d.y)))))};
 const ini=anc.inicio||anc.spawn;
 if(ini){
  const p=ini.getWorldPosition(new V3()),y=suelo(p.x,p.z,p.y+.5*U);
  pos.set(p.x,0,p.z);pisoY=y!==null?y:p.y;miraDe(ini);
 }else{
  let ok=false;
  for(let i=0;i<25&&!ok;i++){
   const x=caja.min.x+tam.x*(.5+((i%5)-2)*.15),z=caja.min.z+tam.z*(.5+(((i/5)|0)-2)*.15),y=suelo(x,z,caja.max.y+1);
   if(y!==null&&hayEspacio(x,y,z)){pos.set(x,0,z);pisoY=y;ok=true}
  }
  if(!ok){libre=true;pos.set(cen.x,0,cen.z);pisoY=caja.min.y}
 }

 /* Movimiento con choques: paredes (2 alturas) y piso */
 const RAD=.5*U;
 const choca=(dx,dz)=>{const L=Math.hypot(dx,dz);if(!L)return false;const d=new V3(dx/L,0,dz/L);return[.35,1].some(h=>rayo(new V3(pos.x,pisoY+h*U,pos.z),d,RAD+L))};
 function mover(dx,dz){
  for(const[ax,az]of[[dx,dz],[dx,0],[0,dz]]){
   if(!ax&&!az)continue;
   if(choca(ax,az))continue;
   const nx=pos.x+ax,nz=pos.z+az;
   if(!libre){const y=suelo(nx,nz,pisoY+OJOS);if(y===null||y-pisoY>.45*U||pisoY-y>1.2*U)continue;pisoY=y}
   pos.x=nx;pos.z=nz;return;
  }
 }

 /* Entradas: teclado, arrastrar para mirar, toque, joystick */
 let visible=true;new IntersectionObserver(e=>{visible=e[0].isIntersecting}).observe(cont);
 const modalAbierto=()=>{const m=document.getElementById('modal');return m&&m.classList.contains('on')};
 const tec={},joy={x:0,y:0},tactil=matchMedia('(pointer:coarse)').matches,tour={on:false,i:0,bus:false};
 addEventListener('keydown',e=>{
  if(!visible||modalAbierto())return;const k=e.key.toLowerCase();
  if(k==='g'){tour.on?salirTour():iniciarTour();return}
  if(tour.on){
   if(['arrowright','enter',' '].includes(k)){e.preventDefault();siguiente()}
   else if(k==='arrowleft')anterior();else if(k==='escape')salirTour();
   return;
  }
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();tec[k]=true;
 });
 addEventListener('keyup',e=>{tec[e.key.toLowerCase()]=false});
 addEventListener('blur',()=>{for(const k in tec)tec[k]=false});
 let mirar=null;
 cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';mirar={id:e.pointerId,x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t:performance.now()}});
 cv.addEventListener('pointermove',e=>{if(!mirar||e.pointerId!==mirar.id)return;yaw-=(e.clientX-mirar.x)*.0045;pitch=Math.max(-1.2,Math.min(1.2,pitch-(e.clientY-mirar.y)*.0045));mirar.x=e.clientX;mirar.y=e.clientY});
 cv.addEventListener('pointerup',e=>{if(!mirar||e.pointerId!==mirar.id)return;cv.style.cursor='grab';if(Math.hypot(e.clientX-mirar.x0,e.clientY-mirar.y0)<6&&performance.now()-mirar.t<400)tocar(e);mirar=null});
 cv.addEventListener('pointercancel',()=>{mirar=null;cv.style.cursor='grab'});
 cv.addEventListener('contextmenu',e=>e.preventDefault());

 /* Información: ventana del sitio (openM) con datos de cfg.info, extras del glb o texto de respaldo */
 function abrir(clave,nombreObj){
  const d=info[clave]||{},u=(anc[clave]&&anc[clave].userData)||{};
  if(!window.openM)return;
  openM({n:d.titulo||u.titulo||TIT[clave]||(nombreObj||clave).replace(/^(info_|poi_)/i,'').replace(/_/g,' '),r:d.detalle||u.detalle||'',d:d.texto||u.texto||PENDIENTE,k:'museo3d',th:false});
 }
 function tocar(e){
  const r=cv.getBoundingClientRect();
  rc.setFromCamera({x:(e.clientX-r.left)/r.width*2-1,y:-((e.clientY-r.top)/r.height*2-1)},cam);rc.far=30*U;
  const h=rc.intersectObjects(mallas,false)[0];if(!h)return;
  for(let o=h.object;o;o=o.parent){
   if(/^info_/i.test(o.name))return abrir(o.name,o.name);
   if(TOCABLE[o.name]&&anc[TOCABLE[o.name]])return abrir(TOCABLE[o.name]);
  }
 }

 /* Interfaz: sala actual, ayuda, joystick y minimapa */
 const hud=div('position:absolute;left:.8rem;top:.8rem;z-index:3;padding:.45rem .8rem;background:rgba(20,9,13,.7);color:#fff;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;pointer-events:none','Museo CETIS 69');
 const ayuda=div('position:absolute;left:50%;bottom:1rem;transform:translateX(-50%);z-index:3;padding:.5rem .9rem;background:rgba(20,9,13,.75);color:#fff;font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;pointer-events:none;transition:opacity 1s;white-space:nowrap',tactil?'Joystick para moverte · Arrastra para mirar':'W A S D para moverte · Arrastra para mirar · G visita guiada');
 setTimeout(()=>{ayuda.style.opacity=0},7000);
 const salas=[];modelo.traverse(o=>{if(/^sala_/i.test(o.name))salas.push({n:o.name.replace(/^sala_/i,'').replace(/_/g,' '),b:new T.Box3().setFromObject(o)})});
 if(tactil){
  const base=div('position:absolute;left:1.1rem;bottom:1.4rem;z-index:3;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.35);touch-action:none'),
        knob=div('position:absolute;left:34px;top:34px;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.75);pointer-events:none',0,base);
  let jid=null;
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
 const mapa=mallas.filter(m=>!/^(superficie|camino)$/i.test(m.name));
 let nt=0;mapa.forEach(m=>{const g=m.geometry;nt+=(g.index?g.index.count:g.attributes.position.count)/3});
 const paso=Math.max(1,Math.floor(nt/30000)),v=new V3();
 bx.fillStyle=bx.strokeStyle='#8a3a50';bx.lineWidth=.6;
 mapa.forEach(m=>{
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

 /* Botones "i" sobre los puntos de información (poi_*) */
 const pins=Object.keys(anc).filter(k=>/^poi_/.test(k)).map(k=>{
  const b=div('position:absolute;z-index:3;display:none;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:rgba(122,18,46,.92);color:#fff;border:2px solid #fff;font:700 15px/26px Georgia,serif;text-align:center;cursor:pointer','i');
  b.title=TIT[k]||k;b.addEventListener('click',()=>abrir(k));
  return{b,p:anc[k].getWorldPosition(new V3())};
 });
 function dibujaPins(w,h){
  const o=cam.position,d=new V3();
  pins.forEach(({b,p})=>{
   d.copy(p).sub(o);const L=d.length();let ver=!tour.on&&L<80*U&&L>2*U;
   if(ver){v.copy(p).project(cam);ver=v.z<1&&v.z>-1&&Math.abs(v.x)<1.05&&Math.abs(v.y)<1.05&&!rayo(o,d.normalize(),L-1*U)}
   b.style.display=ver?'block':'none';
   if(ver){b.style.left=(v.x*.5+.5)*w+'px';b.style.top=(-v.y*.5+.5)*h+'px'}
  });
 }

 /* Visita guiada: recorre parada_1…parada_N con fundido */
 const par=Object.keys(anc).filter(k=>/^parada_\d+$/.test(k)).sort((a,b)=>a.slice(7)-b.slice(7));
 const fade=div('position:absolute;inset:0;z-index:4;background:#140609;opacity:0;pointer-events:none;transition:opacity .28s');
 const panel=div('display:none;position:absolute;left:50%;bottom:1rem;transform:translateX(-50%);z-index:5;width:min(34rem,calc(100% - 1.6rem));box-sizing:border-box;padding:1rem 1.2rem;background:rgba(20,9,13,.86);color:#fff;border:1px solid rgba(255,255,255,.25);text-align:left');
 const pNum=div('font-size:.6rem;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:#e8a5b4',0,panel);
 const pTit=div('margin:.35rem 0 .45rem;font-size:1.1rem;font-weight:300;letter-spacing:.06em',0,panel);
 const pTxt=div('margin:0 0 .8rem;font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.85);max-height:7rem;overflow:auto',0,panel);
 const fila=div('display:flex;flex-wrap:wrap;gap:.5rem',0,panel);
 const boton=(t,f,extra)=>{const b=div('padding:.55rem .85rem;border:1px solid rgba(255,255,255,.4);font-size:.6rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;user-select:none;'+(extra||''),t,fila);b.addEventListener('click',f);return b};
 const bPrev=boton('Anterior',()=>anterior()),bVoz=boton('Escuchar',()=>{voz=!voz;bVoz.style.background=voz?'#7a122e':'transparent';hablar()}),bSig=boton('Siguiente',()=>siguiente(),'background:#7a122e;border-color:#7a122e'),bSal=boton('✕',()=>salirTour(),'margin-left:auto');
 if(!('speechSynthesis' in window))bVoz.style.display='none';
 let voz=false;
 const bTour=par.length?div('position:absolute;right:.8rem;top:.8rem;z-index:3;padding:.5rem .9rem;background:rgba(20,9,13,.7);color:#fff;border:1px solid rgba(255,255,255,.3);font-size:.62rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;cursor:pointer','Visita guiada'):null;
 if(bTour)bTour.addEventListener('click',()=>tour.on?salirTour():iniciarTour());
 function hablar(){
  if(!('speechSynthesis' in window))return;speechSynthesis.cancel();if(!voz)return;
  const u=new SpeechSynthesisUtterance(pTit.textContent+'. '+pTxt.textContent);u.lang='es-MX';speechSynthesis.speak(u);
 }
 function ir(i){
  tour.i=Math.max(0,Math.min(i,par.length-1));tour.bus=true;fade.style.opacity=1;
  setTimeout(()=>{
   const k=par[tour.i],a=anc[k],d=info[k]||{},u=a.userData||{},p=a.getWorldPosition(new V3()),y=suelo(p.x,p.z,p.y+.5*U);
   pos.set(p.x,0,p.z);pisoY=y!==null?y:p.y;camY=pisoY+OJOS;miraDe(a);
   pNum.textContent='Parada '+(tour.i+1)+' de '+par.length;
   pTit.textContent=d.titulo||u.titulo||TIT[k]||k;pTxt.textContent=d.texto||u.texto||PENDIENTE;
   bPrev.style.opacity=tour.i?1:.35;bSig.textContent=tour.i===par.length-1?'Explorar libremente':'Siguiente';
   fade.style.opacity=0;tour.bus=false;hablar();
  },300);
 }
 function iniciarTour(){if(tour.on||!par.length)return;tour.on=true;for(const k in tec)tec[k]=false;panel.style.display='block';ayuda.style.opacity=0;ir(0)}
 function salirTour(){if(!tour.on)return;tour.on=false;panel.style.display='none';if('speechSynthesis' in window)speechSynthesis.cancel()}
 function siguiente(){if(tour.bus)return;tour.i>=par.length-1?salirTour():ir(tour.i+1)}
 function anterior(){if(!tour.bus&&tour.i>0)ir(tour.i-1)}

 /* Tamaño y bucle de dibujo */
 let W=1,H=1;
 const ajusta=()=>{W=cont.clientWidth;H=cont.clientHeight;if(!W||!H)return;R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix()};
 new ResizeObserver(ajusta).observe(cont);ajusta();
 const reloj=new T.Clock();let camY=pisoY+OJOS,salaAct='';
 (function bucle(){
  requestAnimationFrame(bucle);
  const dt=Math.min(reloj.getDelta(),.05);
  if(!visible||document.hidden)return;
  let f=(tec.w||tec.arrowup?1:0)-(tec.s||tec.arrowdown?1:0)-joy.y,r=(tec.d||tec.arrowright?1:0)-(tec.a||tec.arrowleft?1:0)+joy.x;
  const l=Math.hypot(f,r);if(l>1){f/=l;r/=l}
  if(l>.05&&!modalAbierto()&&!tour.on){const sp=VEL*(tec.shift?2:1)*dt;mover((-Math.sin(yaw)*f+Math.cos(yaw)*r)*sp,(-Math.cos(yaw)*f-Math.sin(yaw)*r)*sp)}
  camY+=(pisoY+OJOS-camY)*Math.min(1,dt*8);
  cam.position.set(pos.x,camY,pos.z);cam.rotation.set(pitch,yaw,0);
  if(cielo)cielo.position.copy(cam.position);
  const s=salas.find(s=>pos.x>=s.b.min.x&&pos.x<=s.b.max.x&&pos.z>=s.b.min.z&&pos.z<=s.b.max.z),nom=s?'Sala '+s.n:'Museo CETIS 69';
  if(nom!==salaAct){salaAct=nom;hud.textContent=nom}
  cam.updateMatrixWorld();dibujaMapa();dibujaPins(W,H);R.render(sc,cam);
 })();
}
})();
