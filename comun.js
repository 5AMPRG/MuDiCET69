(function(){
const w=window,d=document,cuerpo=d.body;
w.$=s=>d.querySelector(s);
w.$$=s=>d.querySelectorAll(s);
w.alCargar=fn=>d.readyState==='complete'?fn():addEventListener('load',fn);
w.DATOS=fetch('datos.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()});

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const archivoActual=decodeURIComponent(location.pathname.split('/').pop()||'').toLowerCase();
const esInicio=cuerpo.dataset.menu==='inicio';
const raiz=esInicio?'':'index.html';
const enlace=u=>u.charAt(0)==='#'?raiz+u:u;

let tEl,tT;
w.toast=t=>{
 if(!tEl){tEl=d.createElement('div');tEl.className='toast';tEl.setAttribute('role','status');d.body.appendChild(tEl)}
 tEl.textContent=t;tEl.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>tEl.classList.remove('on'),2400);
};

w.DATOS.catch(()=>w.toast('No se pudieron cargar los datos del sitio. Ábrelo desde un servidor, no con doble clic en el archivo.'));

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:+cuerpo.dataset.umbral||.1});
const vigilar=()=>$$('.rv:not(.in)').forEach(el=>io.observe(el));
if(cuerpo.dataset.reveal==='inmediato')vigilar();
w.alCargar(()=>setTimeout(()=>{const l=$('#loader');if(l)l.classList.add('off');vigilar()},+cuerpo.dataset.carga||900));

let previo=null;
const modal=d.createElement('div');
modal.className='modal';modal.id='modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','mT');
modal.innerHTML='<div class="mbox"><button class="mx" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button><figure class="slot" id="mImg"><i class="fa-regular fa-image"></i></figure><div class="mtxt"><h3 id="mT"></h3><div class="meta" id="mM"></div><p id="mD"></p><div class="thumbs" id="mTh"><figure class="slot"><i class="fa-regular fa-image"></i></figure><figure class="slot"><i class="fa-regular fa-image"></i></figure><figure class="slot"><i class="fa-regular fa-image"></i></figure></div></div></div>';
d.body.appendChild(modal);
w.modal=modal;
w.closeM=()=>{modal.classList.remove('on');if(previo&&d.contains(previo))previo.focus()};
w.openM=o=>{
 $('#mT').textContent=o.n;$('#mM').textContent=o.r;$('#mD').textContent=o.d;$('#mImg').dataset.slot=o.k;
 $('#mTh').style.display=o.th===false?'none':'';
 if(!modal.classList.contains('on'))previo=d.activeElement;
 modal.classList.add('on');modal.querySelector('.mx').focus();
};
modal.onclick=e=>{if(e.target===modal)w.closeM()};
modal.querySelector('.mx').onclick=w.closeM;
addEventListener('keydown',e=>{
 if(!modal.classList.contains('on'))return;
 if(e.key==='Escape')w.closeM();
 if(e.key==='Tab'){
  const f=[...modal.querySelectorAll('button')],a=f[0],z=f[f.length-1];
  if(e.shiftKey&&d.activeElement===a){e.preventDefault();z.focus()}
  else if(!e.shiftKey&&d.activeElement===z){e.preventDefault();a.focus()}
 }
});

function armarNav(nav,S){
 const items=esInicio?S.menuInicio:S.menu;
 const lis=items.map(m=>{
  const act=!esInicio&&m.u.toLowerCase()===archivoActual?' class="act"':'';
  return `<li><a href="${esc(m.u)}"${act}>${esc(m.t)}</a></li>`;
 }).join('');
 nav.innerHTML=`<a href="${esInicio?'#inicio':esc(S.inicio)}" class="logo" aria-label="CETIS 69"><span class="mark" ${esInicio?'':'role="img" '}aria-hidden="true"></span>CETIS 69</a><ul class="menu" id="menu">${lis}<li><button type="button" class="busq" id="busq" aria-label="Buscar en el sitio (tecla /)" title="Buscar (tecla /)"><i class="fa-solid fa-magnifying-glass"></i></button></li></ul><button class="burger" id="burger" aria-label="Abrir menú" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>`;
 const menu=$('#menu'),burger=$('#burger');
 burger.addEventListener('click',()=>{burger.setAttribute('aria-expanded',menu.classList.toggle('open'))});
 const cerrar=()=>{menu.classList.remove('open');burger.setAttribute('aria-expanded','false')};
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',cerrar));
 d.addEventListener('click',e=>{if(menu.classList.contains('open')&&!menu.contains(e.target)&&!burger.contains(e.target))cerrar()});
 if(!nav.classList.contains('solid')){
  const alDesplazar=()=>nav.classList.toggle('solid',scrollY>40);
  addEventListener('scroll',alDesplazar,{passive:true});
  alDesplazar();
 }
}

function armarPie(pie,S){
 const P=S.pie;
 pie.innerHTML=`
 <div class="f-grid">
  <div>
   <a href="${raiz}#inicio" class="logo"><span class="mark dgeti" role="img" aria-label="DGETI"></span>CETIS 69</a>
   <p>${esc(P.descripcion)}</p>
  </div>
  <div>
   <h4>Contacto</h4>
   ${P.contacto.map(c=>`<p><i class="${esc(c.i)}"></i> ${esc(c.t)}</p>`).join('')}
  </div>
  <div>
   <h4>Enlaces</h4>
   <ul>${P.enlaces.map(l=>`<li><a href="${esc(enlace(l.u))}">${esc(l.t)}</a></li>`).join('')}</ul>
  </div>
  <div>
   <h4>Redes sociales</h4>
   <div class="soc">${P.redes.map(r=>`<a href="${esc(enlace(r.u))}" aria-label="${esc(r.t)}"><i class="${esc(r.i)}"></i></a>`).join('')}</div>
  </div>
 </div>
 <div class="copy">${esc(P.copyright)}</div>`;
}

function indice(D){
 const lista=[],vistos=new Set();
 const inicio=D.sitio.inicio;
 const destino=u=>esInicio&&u.startsWith(inicio+'#')?u.slice(inicio.length):u;
 const add=(k,t,x,u)=>{
  const clave=u+'|'+t+'|'+x;
  if(!t||vistos.has(clave))return;
  vistos.add(clave);
  lista.push({k,t,x:x||'',u:destino(u),n:norm(t),m:norm((x||'')+' '+k)});
 };
 D.sitio.paginas.forEach(p=>add('Página',p.t,p.x,p.u));
 (D.hitos||[]).forEach(h=>{
  add('Línea del tiempo',h.y+' · '+h.t,h.d,inicio+'#linea');
  (h.s||[]).forEach(s=>add('Oferta educativa',s[1],'Especialidad',inicio+'#oferta'));
  (h.docentes||[]).forEach(o=>add('Docentes',o.n,o.m+' · Generación '+h.y,inicio+'#docentes'));
 });
 (D.eventos||[]).forEach(e=>add('Eventos',e.n,e.t,inicio+'#eventos'));
 (D.proyectos||[]).forEach(p=>add('Proyectos de estudiantes',p.n,p.t,inicio+'#eventos'));
 (D.exalumnos||[]).forEach(e=>add('Exalumnos',e.n,e.r+' · '+e.d,inicio+'#exalumnos'));
 (D.ciencia||[]).forEach(c=>add('Ciencia',c.n,c.r+' · '+c.d,inicio+'#ciencia'));
 (D.premios||[]).forEach(p=>add('Salón de la fama',p.n,p.l+' · '+p.y+' · '+p.p,'salon-fama.html'));
  (D.archivo||[]).forEach(a=>add('Archivo fotográfico',a.c,'Década '+a.d+'0s','archivo-fotografico.html'));
 const C=D.creditos||{};
 (C.equipo||[]).forEach(p=>add('Créditos',p.nombre,p.rol+(p.detalle?' · '+p.detalle:''),'creditos.html'));
 (C.fuentes||[]).forEach(f=>add('Créditos',f.tipo,f.fuente,'creditos.html'));
 return lista;
}

function armarBuscador(D){
 const items=indice(D);
 const panel=d.createElement('div');
 panel.className='bq';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Buscar en el sitio');
 panel.innerHTML='<div class="bq-box"><div class="bq-in"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input type="search" id="bqIn" placeholder="Buscar en todo el museo" aria-label="Buscar en todo el museo" autocomplete="off"><kbd>ESC</kbd></div><ul class="bq-list" id="bqLista" role="listbox"></ul></div>';
 d.body.appendChild(panel);
 const input=panel.querySelector('#bqIn'),lista=panel.querySelector('#bqLista');
 let sel=-1,retorno=null,res=[];
 const abierto=()=>panel.classList.contains('on');
 const pintar=()=>{
  if(!res.length){lista.innerHTML=input.value.trim()?'<li class="bq-vacio">Nada coincide con tu búsqueda.</li>':'<li class="bq-vacio">Escribe un nombre, un año o una palabra.</li>';return}
  lista.innerHTML=res.map((r,i)=>`<li role="option"><a href="${esc(r.u)}"${i===sel?' class="on"':''}><small>${esc(r.k)}</small><b>${esc(r.t)}</b>${r.x?`<span>${esc(r.x.length>110?r.x.slice(0,107)+'…':r.x)}</span>`:''}</a></li>`).join('');
 };
 const buscar=()=>{
  const ts=norm(input.value).split(/\s+/).filter(Boolean);
  res=ts.length?items.map(it=>{
   let p=0;
   for(const t of ts){
    if(it.n.includes(t))p+=it.n.startsWith(t)?4:3;
    else if(it.m.includes(t))p+=1;
    else return null;
   }
   return {it,p};
  }).filter(Boolean).sort((a,b)=>b.p-a.p).slice(0,12).map(o=>o.it):[];
  sel=res.length?0:-1;
  pintar();
 };
 const abrir=()=>{
  if(abierto())return;
  retorno=d.activeElement;
  panel.classList.add('on');
  input.value='';res=[];sel=-1;pintar();
  input.focus();
 };
 const cerrar=()=>{
  if(!abierto())return;
  panel.classList.remove('on');
  if(retorno&&d.contains(retorno))retorno.focus();
 };
 const mover=n=>{
  if(!res.length)return;
  sel=(sel+n+res.length)%res.length;
  lista.querySelectorAll('a').forEach((a,i)=>a.classList.toggle('on',i===sel));
  const a=lista.querySelectorAll('a')[sel];
  if(a)a.scrollIntoView({block:'nearest'});
 };
 input.addEventListener('input',buscar);
 panel.addEventListener('click',e=>{if(e.target===panel||e.target.closest('a'))cerrar()});
 addEventListener('keydown',e=>{
  if(abierto()){
   if(e.key==='Escape'){e.preventDefault();cerrar()}
   else if(e.key==='ArrowDown'){e.preventDefault();mover(1)}
   else if(e.key==='ArrowUp'){e.preventDefault();mover(-1)}
   else if(e.key==='Enter'&&sel>=0){e.preventDefault();location.href=res[sel].u;cerrar()}
   else if(e.key==='Tab'){e.preventDefault();input.focus()}
   return;
  }
  const t=e.target,campo=t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  if(e.key==='/'&&!campo&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!modal.classList.contains('on')){e.preventDefault();abrir()}
 });
 const boton=$('#busq');
 if(boton)boton.addEventListener('click',abrir);
}

function armarKiosco(D){
 const K='c69_kiosco',par=new URLSearchParams(location.search).get('kiosco');
 let activo=false;
 try{
  if(par==='1')localStorage.setItem(K,'1');
  if(par==='0')localStorage.removeItem(K);
  activo=localStorage.getItem(K)==='1';
 }catch(e){activo=par==='1'}
 if(!activo)return;
 d.documentElement.classList.add('kiosco');
 const espera=((D&&D.ajustes&&D.ajustes.kiosco&&D.ajustes.kiosco.segundosInactividad)||90)*1000;
 const inicio=(D&&D.sitio&&D.sitio.inicio)||'index.html';
 let ultimo=Date.now();
 const tocar=()=>{ultimo=Date.now()};
 ['pointerdown','pointermove','keydown','wheel','touchstart','scroll'].forEach(n=>addEventListener(n,tocar,{passive:true,capture:true}));
 setInterval(()=>{
  if(Date.now()-ultimo<espera)return;
  ultimo=Date.now();
  if(modal.classList.contains('on')){modal.classList.remove('on');previo=null}
  const bq=$('.bq.on');if(bq)bq.classList.remove('on');
  if(d.fullscreenElement&&d.exitFullscreen)d.exitFullscreen().catch(()=>{});
  if(!esInicio){location.href=inicio;return}
  if(scrollY>0)scrollTo({top:0,behavior:'smooth'});
 },1000);
}

w.DATOS.then(D=>{
 const S=D.sitio,nav=$('#nav'),pie=$('footer');
 if(nav)armarNav(nav,S);
 if(pie)armarPie(pie,S);
 armarBuscador(D);
}).catch(()=>{});
w.DATOS.catch(()=>({})).then(armarKiosco);

if('serviceWorker' in navigator&&location.protocol!=='file:')w.alCargar(()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
