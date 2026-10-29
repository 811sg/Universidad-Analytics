(() => {
  const U = window.UA;
  if (!U) return;
  const $ = U.$, fmt = U.fmt, norm = U.norm, valid = U.valid;
  const canvas = $('#v7Canvas'), wrap = $('#v7Wrap');
  if (!canvas || !wrap) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  const COLORS = ['#3b82f6','#5b6ee1','#38bdf8','#6366f1','#2563eb','#60a5fa','#4f46e5','#0ea5e9','#818cf8','#1d4ed8','#7dd3fc','#4338ca'];
  const state = {
    data: [], layer: 0, mode: null, focus: null, path: [], nodes: [], hover: null, selected: null,
    yaw: 0.24, pitch: -0.18, targetYaw: 0.24, targetPitch: -0.18,
    zoom: 1, targetZoom: 1, auto: true, dragging: false, px: 0, py: 0, vx: 0, vy: 0,
    raf: 0, dpr: 1, w: 900, h: 620, transition: 1, last: performance.now()
  };

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const clean=v=>String(v ?? '').replace(/[<>]/g,'');
  const fieldLabel={Facultad:'Facultades','Sede':'Sedes','Nombre Programa':'Carreras','Modalidad':'Modalidades','Sexo':'Sexo'};
  const macro=[
    {id:'Facultad', label:'Facultades', icon:'FAC', desc:'estructura académica'},
    {id:'Sede', label:'Sedes', icon:'SED', desc:'distribución institucional'},
    {id:'Nombre Programa', label:'Carreras', icon:'CAR', desc:'oferta académica'},
    {id:'Modalidad', label:'Modalidades', icon:'MOD', desc:'forma de estudio'},
    {id:'Sexo', label:'Sexo', icon:'SEX', desc:'composición general'}
  ];

  function grouped(rows,key,limit=14){
    const map=new Map();
    for(const r of rows){const v=norm(r[key]);if(valid(v))map.set(v,(map.get(v)||0)+1);}
    let arr=[...map.entries()].sort((a,b)=>b[1]-a[1]);
    if(arr.length>limit){const head=arr.slice(0,limit-1),rest=arr.slice(limit-1).reduce((s,x)=>s+x[1],0);arr=head.concat([['Otros',rest]]);}
    return arr;
  }
  function unique(rows,key){return new Set(rows.map(r=>norm(r[key])).filter(valid)).size;}
  function sourceRows(){
    if(!state.path.length)return state.data;
    return state.data.filter(r=>state.path.every(x=>x.dimension==='__macro' || norm(r[x.dimension])===x.value));
  }
  function programs(rows){return unique(rows,'Nombre Programa');}
  function topValue(rows,key){const x=grouped(rows,key,1)[0];return x?`${clean(x[0])} · ${fmt(x[1])}`:'Sin dato';}

  function buildNodes(){
    const rows=sourceRows();
    let groups=[];
    if(state.layer===0){
      groups=macro.map(m=>({id:m.id,value:unique(rows,m.id),display:m.label,desc:m.desc,macro:true}));
    }else{
      const key=state.layer===1?state.mode:detailDimension();
      groups=grouped(rows,key,state.layer===1?12:12).map(x=>({id:x[0],value:x[1],display:x[0],macro:false}));
    }
    const total=Math.max(1,rows.length), max=Math.max(1,...groups.map(x=>x.value));
    state.nodes=groups.map((g,i)=>({...g,share:g.value/total,ratio:Math.sqrt(g.value/max),color:COLORS[i%COLORS.length],i,angle:(Math.PI*2*i/groups.length)-Math.PI/2}));
    state.transition=0;
    renderStrip(rows);
    updateInspector();
  }

  function detailDimension(){
    if(state.mode==='Facultad')return 'Nombre Programa';
    if(state.mode==='Sede')return 'Facultad';
    if(state.mode==='Nombre Programa')return 'Sede';
    if(state.mode==='Modalidad')return 'Facultad';
    if(state.mode==='Sexo')return 'Facultad';
    return 'Facultad';
  }

  function resize(){
    const r=wrap.getBoundingClientRect();
    state.dpr=Math.min(window.devicePixelRatio||1,1.75);
    state.w=Math.max(520,r.width);state.h=Math.max(520,Math.min(700,r.height));
    canvas.width=Math.floor(state.w*state.dpr);canvas.height=Math.floor(state.h*state.dpr);
    canvas.style.width='100%';canvas.style.height='100%';ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
  }
  function project(x,y,z){
    const cy=Math.cos(state.yaw),sy=Math.sin(state.yaw),cp=Math.cos(state.pitch),sp=Math.sin(state.pitch);
    const X=x*cy-z*sy,Z=x*sy+z*cy,Y=y*cp-Z*sp,ZZ=y*sp+Z*cp,f=1/(1+ZZ/720);
    return{x:state.w/2+X*f*state.zoom,y:state.h/2+Y*f*state.zoom,s:f,z:ZZ};
  }
  function roundRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
  function rgba(hex,a){const n=parseInt(hex.slice(1),16);return`rgba(${n>>16},${(n>>8)&255},${n&255},${a})`;}

  function drawBackground(){
    ctx.clearRect(0,0,state.w,state.h);
    const bg=ctx.createLinearGradient(0,0,state.w,state.h);bg.addColorStop(0,'#071426');bg.addColorStop(1,'#0a1b32');ctx.fillStyle=bg;ctx.fillRect(0,0,state.w,state.h);
    const glow=ctx.createRadialGradient(state.w*.48,state.h*.47,10,state.w*.48,state.h*.47,state.w*.48);glow.addColorStop(0,'rgba(37,99,235,.17)');glow.addColorStop(.55,'rgba(14,165,233,.04)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,state.w,state.h);
    ctx.strokeStyle='rgba(148,163,184,.055)';ctx.lineWidth=1;const gap=42;
    for(let x=(state.w/2)%gap;x<state.w;x+=gap){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,state.h);ctx.stroke();}
    for(let y=(state.h/2)%gap;y<state.h;y+=gap){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(state.w,y);ctx.stroke();}
  }
  function drawRing(radius,tilt=1){ctx.save();ctx.translate(state.w/2,state.h/2);ctx.rotate(state.yaw*.15);ctx.scale(1,tilt);ctx.strokeStyle='rgba(125,211,252,.13)';ctx.lineWidth=1.2;ctx.setLineDash([3,8]);ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();ctx.restore();}

  function drawTitle(rows){
    const title=state.layer===0?'PANORAMA INSTITUCIONAL':state.layer===1?fieldLabel[state.mode]||state.mode:fieldLabel[detailDimension()]||detailDimension();
    const sub=state.layer===0?'Resumen general de la matrícula':state.focus?clean(state.focus):'Exploración del conjunto';
    ctx.textAlign='center';ctx.fillStyle='rgba(125,211,252,.88)';ctx.font='700 11px Inter,Arial';ctx.fillText(title.toUpperCase(),state.w/2,38);
    ctx.fillStyle='#f8fafc';ctx.font='700 22px Inter,Arial';ctx.fillText(sub,state.w/2,66);
    ctx.fillStyle='rgba(226,232,240,.58)';ctx.font='500 11px Inter,Arial';ctx.fillText(`${fmt(rows.length)} registros de matrícula`,state.w/2,87);
  }

  function drawCore(rows){
    const p=project(0,0,0),r=105*state.zoom;
    const g=ctx.createRadialGradient(p.x-r*.35,p.y-r*.45,4,p.x,p.y,r);g.addColorStop(0,'#60a5fa');g.addColorStop(.22,'#2563eb');g.addColorStop(.7,'#172f5f');g.addColorStop(1,'#08172d');
    ctx.shadowColor='rgba(37,99,235,.42)';ctx.shadowBlur=34;ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(147,197,253,.55)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.stroke();
    ctx.textAlign='center';ctx.fillStyle='#93c5fd';ctx.font='600 10px Inter,Arial';ctx.fillText(state.layer===0?'UNIVERSIDAD':'SELECCIÓN',p.x,p.y-27);
    ctx.fillStyle='#fff';ctx.font='700 29px Inter,Arial';ctx.fillText(fmt(rows.length),p.x,p.y+9);
    ctx.fillStyle='rgba(226,232,240,.72)';ctx.font='500 11px Inter,Arial';ctx.fillText('registros de matrícula',p.x,p.y+31);
  }

  function drawNode(n){
    const radius=state.layer===0?235:245+n.i*2.5,z=0,a=n.angle+state.transition*.45;
    const x=Math.cos(a)*radius,y=Math.sin(a)*radius*.62,zz=Math.sin(a)*radius*.70,p=project(x,y,zz);n.p=p;n.r=state.layer===0?31+n.ratio*8:22+n.ratio*27;n.depth=p.z;
    const rr=n.r*state.zoom*p.s,selected=state.selected===n.id,hovered=state.hover===n.id;
    const glow=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,rr*2.8);glow.addColorStop(0,rgba(n.color,.26));glow.addColorStop(1,rgba(n.color,0));ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,rr*2.8,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.globalAlpha=clamp(.45+p.s*.55,.35,1);ctx.shadowColor=rgba(n.color,.5);ctx.shadowBlur=selected?24:10;
    const grad=ctx.createRadialGradient(p.x-rr*.3,p.y-rr*.4,2,p.x,p.y,rr);grad.addColorStop(0,'#fff');grad.addColorStop(.08,n.color);grad.addColorStop(.7,rgba(n.color,.85));grad.addColorStop(1,'#071426');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    if(selected||hovered){ctx.strokeStyle='#e0f2fe';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,rr+4,0,Math.PI*2);ctx.stroke();}ctx.restore();
  }

  function wrapLabel(text,maxChars=24){
    const words=clean(text).split(/\s+/).filter(Boolean),lines=[];let line='';
    for(const word of words){const test=line?`${line} ${word}`:word;if(test.length>maxChars&&line){lines.push(line);line=word;}else line=test;}
    if(line)lines.push(line);if(lines.length>2){lines[1]=`${lines[1].slice(0,Math.max(0,maxChars-1))}…`;lines.length=2;}return lines;
  }
  function drawNodeLabel(n){
    const p=n.p;if(!p)return;const rr=n.r*state.zoom*p.s,selected=state.selected===n.id,hovered=state.hover===n.id;
    const title=n.macro?n.display:n.id,lines=wrapLabel(title,22),value=state.layer===0?fmt(n.value):fmt(n.value),side=p.x>=state.w/2?1:-1;
    const boxW=Math.min(205,Math.max(128,Math.max(...lines.map(x=>x.length))*6.8+28)),boxH=lines.length*14+32;
    let bx=side>0?p.x+rr+14:p.x-rr-14-boxW,by=p.y-boxH/2;bx=clamp(bx,10,state.w-boxW-10);by=clamp(by,98,state.h-boxH-10);
    const anchorX=side>0?bx:bx+boxW,anchorY=by+boxH/2;
    ctx.save();ctx.strokeStyle=selected||hovered?'rgba(125,211,252,.65)':'rgba(125,211,252,.20)';ctx.lineWidth=selected||hovered?1.5:1;ctx.beginPath();ctx.moveTo(p.x+side*(rr+3),p.y);ctx.lineTo(anchorX,anchorY);ctx.stroke();
    ctx.fillStyle=selected||hovered?'rgba(13,31,56,.95)':'rgba(7,20,38,.86)';ctx.strokeStyle=selected||hovered?'rgba(125,211,252,.50)':'rgba(148,163,184,.14)';ctx.lineWidth=1;roundRect(ctx,bx,by,boxW,boxH,9);ctx.fill();ctx.stroke();
    ctx.textAlign='left';ctx.fillStyle='#e2e8f0';ctx.font='600 10.5px Inter,Arial';lines.forEach((line,i)=>ctx.fillText(line,bx+10,by+15+i*14));
    ctx.fillStyle='#7dd3fc';ctx.font='700 10px Inter,Arial';ctx.fillText(state.layer===0?`${fmt(n.value)} grupos`:`${fmt(value)} registros`,bx+10,by+boxH-8);ctx.restore();
  }
  function drawConnections(){
    const center=project(0,0,0);for(const n of [...state.nodes].sort((a,b)=>a.depth-b.depth)){if(!n.p)continue;const active=state.selected===n.id||state.hover===n.id;ctx.strokeStyle=active?'rgba(125,211,252,.38)':'rgba(96,165,250,.10)';ctx.lineWidth=active?1.8:1;ctx.beginPath();ctx.moveTo(center.x,center.y);ctx.quadraticCurveTo((center.x+n.p.x)/2,(center.y+n.p.y)/2-30,n.p.x,n.p.y);ctx.stroke();}
  }

  function render(){
    const now=performance.now(),dt=Math.min(32,now-state.last);state.last=now;
    state.yaw+=(state.targetYaw-state.yaw)*.075;state.pitch+=(state.targetPitch-state.pitch)*.075;state.zoom+=(state.targetZoom-state.zoom)*.08;
    if(state.auto&&!state.dragging)state.targetYaw+=dt*.00010;if(!state.dragging){state.targetYaw+=state.vx;state.targetPitch+=state.vy;state.vx*=.94;state.vy*=.94;}
    state.transition+=(1-state.transition)*.06;drawBackground();drawRing(245*state.zoom,.62);drawRing(185*state.zoom,.42);
    const rows=sourceRows();drawTitle(rows);drawCore(rows);state.nodes.forEach(n=>n.p=null);state.nodes.forEach(drawNode);drawConnections();[...state.nodes].sort((a,b)=>a.depth-b.depth).forEach(drawNodeLabel);
    state.raf=requestAnimationFrame(render);
  }
  function hit(x,y){let best=null,bd=Infinity;for(const n of state.nodes){if(!n.p)continue;const d=Math.hypot(x-n.p.x,y-n.p.y),rr=n.r*state.zoom*n.p.s+10;if(d<rr&&d<bd){best=n;bd=d;}}return best;}

  function updateInspector(n){
    const rows=sourceRows(),total=Math.max(1,state.data.length);let selectedRows=rows,value=rows.length,name=state.focus||'Panorama institucional';
    if(n){
      if(state.layer===0){name=n.display;value=n.value;selectedRows=rows;}
      else {selectedRows=rows.filter(r=>norm(r[currentLayerKey()])===n.id);value=selectedRows.length;name=n.id;}
    }
    $('#v7Selected').textContent=clean(name);$('#v7SelectedValue').textContent=fmt(value);$('#v7Share').textContent=`${((value/total)*100).toFixed(1)}%`;
    $('#v7Programs').textContent=fmt(programs(selectedRows));$('#v7Accent').style.background=n?n.color:'#3b82f6';
    const list=[['Sede',topValue(selectedRows,'Sede')],['Facultad',topValue(selectedRows,'Facultad')],['Modalidad',topValue(selectedRows,'Modalidad')],['Sexo',topValue(selectedRows,'Sexo')],['Carrera principal',topValue(selectedRows,'Nombre Programa')]];
    $('#v7DetailList').innerHTML=list.map(x=>`<div><span>${clean(x[0])}</span><strong>${clean(x[1])}</strong></div>`).join('');
    $('#v7Reading').textContent=state.layer===0?'Vista resumida del conjunto. El tamaño de cada esfera representa la cantidad de categorías disponibles en esa dimensión.':n?`${fmt(value)} registros de matrícula corresponden a “${clean(name)}”. Explora la siguiente capa para ver su distribución.`:`${fmt(rows.length)} registros de matrícula en la vista actual.`;
  }
  function currentLayerKey(){return state.layer===1?state.mode:detailDimension();}

  function renderStrip(rows){
    let groups;
    if(state.layer===0){groups=macro.map(m=>[m.label,unique(rows,m.id)]);}else{groups=grouped(rows,currentLayerKey(),8);}
    const max=Math.max(1,...groups.map(g=>g[1]));$('#v7StripTitle').textContent=state.layer===0?'Indicadores generales':`Resumen · ${fieldLabel[currentLayerKey()]||currentLayerKey()}`;
    $('#v7Bars').innerHTML=groups.map((g,i)=>{const p=g[1]/max*100;return`<div class="v7-bar-item"><div class="v7-bar-label"><span>${clean(g[0])}</span><strong>${fmt(g[1])}</strong></div><div class="v7-bar-track"><i style="width:${Math.max(4,p)}%;background:${COLORS[i%COLORS.length]}"></i></div></div>`}).join('');
  }

  function drill(n){
    if(!n||state.layer>=2)return;
    if(state.layer===0){state.mode=n.id;state.path.push({dimension:'__macro',value:n.id});state.layer=1;state.focus=n.display;}
    else{const key=currentLayerKey();state.path.push({dimension:key,value:n.id});state.layer=2;state.focus=n.id;}
    state.selected=null;state.vx=state.vy=0;state.targetYaw=.25;state.targetPitch=-.18;buildNodes();updateHeader();$('#v7Back').disabled=false;
  }
  function back(){
    if(state.layer===0)return;
    state.path.pop();
    if(state.layer===2){state.layer=1;state.focus=state.mode?fieldLabel[state.mode]||state.mode:null;}
    else{state.layer=0;state.mode=null;state.focus=null;}
    state.selected=null;state.vx=state.vy=0;buildNodes();updateHeader();$('#v7Back').disabled=state.layer===0;
  }
  function reset(){state.layer=0;state.mode=null;state.focus=null;state.path=[];state.selected=null;state.targetYaw=.24;state.targetPitch=-.18;state.targetZoom=1;buildNodes();updateHeader();$('#v7Back').disabled=true;}
  function updateHeader(){
    const rows=sourceRows();$('#v7Total').textContent=fmt(state.data.length);$('#filterCount').textContent=`${fmt(state.data.length)} registros`;
    const title=state.layer===0?'Panorama institucional':state.layer===1?(fieldLabel[state.mode]||state.mode):(fieldLabel[detailDimension()]||detailDimension());
    $('#v7FocusName').textContent=clean(state.focus||'Panorama institucional');$('#v7FocusValue').textContent=`${fmt(rows.length)} registros de matrícula`;
    $('#v7ModeText').textContent=title;$('#v7StatusText').textContent=title;$('#v7Hint').textContent=state.layer<2?'Haz clic en una esfera para explorar':'Vista detallada · usa Retroceder para volver';
  }

  function select(n){if(!n){state.selected=null;updateInspector();return;}if(n.id==='Otros')return;drill(n);}
  function onDown(e){state.dragging=true;state.px=e.clientX;state.py=e.clientY;state.vx=state.vy=0;canvas.setPointerCapture(e.pointerId);}
  function onMove(e){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,n=hit(x,y);state.hover=n?n.id:null;canvas.style.cursor=n?'pointer':state.dragging?'grabbing':'grab';if(!state.dragging)return;const dx=e.clientX-state.px,dy=e.clientY-state.py;state.px=e.clientX;state.py=e.clientY;state.targetYaw+=dx*.004;state.targetPitch=clamp(state.targetPitch+dy*.003,-.75,.65);state.vx=dx*.0007;state.vy=dy*.0003;}
  function onUp(e){state.dragging=false;try{canvas.releasePointerCapture(e.pointerId);}catch(_){} }
  function onWheel(e){e.preventDefault();state.targetZoom=clamp(state.targetZoom+(e.deltaY<0?.07:-.07),.78,1.28);$('#v7Zoom').textContent=`${Math.round(state.targetZoom*100)}%`;}
  function bind(){
    canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);canvas.addEventListener('wheel',onWheel,{passive:false});canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),n=hit(e.clientX-r.left,e.clientY-r.top);select(n);});
    $('#v7Reset').addEventListener('click',reset);$('#v7Back').addEventListener('click',back);$('#v7Close').addEventListener('click',()=>select(null));
    $('#v7Plus').addEventListener('click',()=>{state.targetZoom=clamp(state.targetZoom+.08,.78,1.28);$('#v7Zoom').textContent=`${Math.round(state.targetZoom*100)}%`;});$('#v7Minus').addEventListener('click',()=>{state.targetZoom=clamp(state.targetZoom-.08,.78,1.28);$('#v7Zoom').textContent=`${Math.round(state.targetZoom*100)}%`;});$('#v7Auto').addEventListener('click',()=>{state.auto=!state.auto;$('#v7Auto').classList.toggle('on',state.auto);});
    window.addEventListener('resize',resize);window.addEventListener('data:ready',init);window.addEventListener('data:filtered',init);
  }
  function init(){state.data=Array.isArray(U.state.filtered)?U.state.filtered:(Array.isArray(U.state.data)?U.state.data:[]);resize();reset();}
  bind();init();state.raf=requestAnimationFrame(render);
})();
