
(() => {
  const state = {data:[], filtered:[], filters:{}, page:document.body.dataset.page || 'resumen', source:'api'};
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const fmt=n=>new Intl.NumberFormat('es-CO').format(Number(n)||0);
  const pct=(n,d)=>d ? `${(Number(n)/Number(d)*100).toFixed(1)}%` : '0.0%';
  const norm=s=>String(s ?? '').trim();
  const esc=s=>String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const COLORS=['#1d4ed8','#4f46e5','#0284c7','#0ea5e9','#6366f1','#1e3a8a','#2563eb','#64748b','#94a3b8','#cbd5e1'];
  const LABELS={'Ano':'Año','Barrio':'Barrio','Comuna':'Comuna','Ciudad Nacimiento':'Ciudad de nacimiento','Pais Nacimiento':'País de nacimiento','Id Estrato':'Estrato (código)','Nombre Programa':'Programa','Sexo':'Sexo','Tipo Inscripcion':'Tipo de inscripción','Sede':'Sede','Facultad':'Facultad','Area Conocimiento':'Área de conocimiento','Institucion':'Institución educativa','Colegio':'Tipo de colegio','Modalidad':'Modalidad','Tipo Programa':'Nivel del programa','Estrato':'Estrato'};

  const ICONS={
    grid:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>`,
    users:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5.8"/><path d="M17 14.5a5 5 0 0 1 3.5 4.5"/></svg>`,
    book:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/><path d="M8 7h8M8 11h8"/></svg>`,
    pin:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
    school:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M6 11v6.5c3 2 9 2 12 0V11"/><path d="M21 9v7"/></svg>`,
    table:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 9v11M15 9v11"/></svg>`,
    trend:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 17 5-5 4 3 7-8"/><path d="M17 7h3v3"/></svg>`,
    report:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h5M9 13h6M9 17h6M9 9h2"/></svg>`,
    filter:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M7 12h10M10 18h4"/></svg>`,
    download:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/></svg>`,
    upload:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M4 20h16"/></svg>`,
    refresh:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 11a8 8 0 0 0-14-4L4 9"/><path d="M4 4v5h5"/><path d="M4 13a8 8 0 0 0 14 4l2-2"/><path d="M20 20v-5h-5"/></svg>`,
    search:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>`,
    close:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M18 6 6 18"/></svg>`,
    check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m5 12 4 4L19 6"/></svg>`,
    info:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></svg>`,
    database:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7"/></svg>`,
    clock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`
  };
  function icon(name){return `<span class="nav-icon">${ICONS[name]||ICONS.info}</span>`}
  function hydrateIcons(){ $$('[data-icon]').forEach(e=>e.innerHTML=ICONS[e.dataset.icon]||ICONS.info); }
  function toast(msg){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2400)}
  function valid(v){
    const s=norm(v).toLowerCase();
    return s!=='' && !['no registrado','sin dato','no registra','desconocido','desconocida','** seleccionar**','** desconocido **','** desconocida **','nan','null','undefined'].includes(s);
  }
  function group(data,key){
    const m=new Map();
    data.forEach(r=>{const k=norm(r[key]);if(!valid(k))return;m.set(k,(m.get(k)||0)+1)});
    return [...m].sort((a,b)=>b[1]-a[1]);
  }
  function top(data,key,n=5){return group(data,key).slice(0,n)}
  function count(data,key,val){return data.filter(r=>valid(r[key])&&norm(r[key])===norm(val)).length}
  function unique(data,key){return [...new Set(data.map(r=>norm(r[key])).filter(valid))].sort((a,b)=>a.localeCompare(b,'es'))}
  function shorten(s,n=24){s=norm(s);return s.length>n?s.slice(0,n-1)+'…':s}

  const FILTERS=[
    ['Facultad','Facultad'],['Sede','Sede'],['Programa','Nombre Programa'],['Modalidad','Modalidad'],
    ['Tipo de programa','Tipo Programa'],['Sexo','Sexo'],['Estrato','Estrato'],['Colegio','Colegio'],
    ['Comuna','Comuna'],['Barrio','Barrio'],['Área de conocimiento','Area Conocimiento'],['Inscripción','Tipo Inscripcion']
  ];

  function buildFilters(){
    const root=$('#filters'); if(!root)return;
    const current=state.filters;
    const primary=['Facultad','Sede','Nombre Programa','Modalidad'];
    const make=(label,key)=>{
      const wrap=document.createElement('div');wrap.className='filter-field';
      wrap.innerHTML=`<label>${esc(label)}</label><select data-key="${esc(key)}"><option value="">Todos</option></select>`;
      const select=wrap.querySelector('select');
      const values=unique(state.data,key);
      values.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;if(current[key]===v)o.selected=true;select.appendChild(o)});
      select.addEventListener('change',()=>{state.filters[key]=select.value||undefined;delete state.filters[key] || 0; applyFilters(false)});
      return wrap;
    };
    root.innerHTML='';
    const p=document.createElement('div');p.className='filter-primary';
    FILTERS.filter(x=>primary.includes(x[1])).forEach(([label,key])=>p.appendChild(make(label,key)));
    root.appendChild(p);
    const tools=document.createElement('div');tools.className='filter-tools';
    tools.innerHTML=`<button class="button" id="moreFilters" title="Más filtros">${icon('filter')}<span>Más filtros</span></button><button class="button ghost" id="clearFilters">Limpiar</button>`;
    root.appendChild(tools);
    $('#moreFilters').onclick=()=>openDrawer();
    $('#clearFilters').onclick=()=>clearFilters();
    renderDrawer();
  }
  function renderDrawer(){
    let d=$('#filterDrawer');if(!d)return;
    const grid=$('#drawerFilters');grid.innerHTML='';
    FILTERS.filter(x=>!['Facultad','Sede','Nombre Programa','Modalidad'].includes(x[1])).forEach(([label,key])=>{
      const wrap=document.createElement('div');wrap.className='filter-field';
      wrap.innerHTML=`<label>${esc(label)}</label><select data-dkey="${esc(key)}"><option value="">Todos</option></select>`;
      const select=wrap.querySelector('select');
      unique(state.data,key).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;if(state.filters[key]===v)o.selected=true;select.appendChild(o)});
      grid.appendChild(wrap);
    });
    $('#drawerApply').onclick=()=>{ $$('#drawerFilters select').forEach(s=>{if(s.value)state.filters[s.dataset.dkey]=s.value;else delete state.filters[s.dataset.dkey]}); applyFilters(); closeDrawer(); };
    $('#drawerClear').onclick=()=>{ $$('#drawerFilters select').forEach(s=>s.value=''); ['Sexo','Estrato','Colegio','Comuna','Barrio','Area Conocimiento','Tipo Inscripcion'].forEach(k=>delete state.filters[k]); applyFilters(); closeDrawer(); };
  }
  function openDrawer(){ $('#drawerBackdrop')?.classList.add('open'); $('#filterDrawer')?.classList.add('open') }
  function closeDrawer(){ $('#drawerBackdrop')?.classList.remove('open'); $('#filterDrawer')?.classList.remove('open') }
  function clearFilters(){state.filters={};buildFilters();state.filtered=[...state.data];dispatch();toast('Filtros limpiados')}
  function applyFilters(showToast=true){
    state.filtered=state.data.filter(r=>Object.entries(state.filters).every(([k,v])=>!v||norm(r[k])===norm(v)));
    dispatch();
    if(showToast)toast(`${fmt(state.filtered.length)} registros en la vista`);
  }
  function dispatch(){window.dispatchEvent(new CustomEvent('data:filtered',{detail:state.filtered}));renderActiveFilters();updateCount()}
  function renderActiveFilters(){
    const box=$('#activeFilters');if(!box)return;
    const entries=Object.entries(state.filters).filter(([,v])=>v);
    box.innerHTML=entries.map(([k,v])=>`<span class="filter-chip">${esc(k)}: ${esc(shorten(v,25))}<button data-remove-filter="${esc(k)}" aria-label="Quitar filtro">×</button></span>`).join('');
    $$('[data-remove-filter]').forEach(b=>b.onclick=()=>{delete state.filters[b.dataset.removeFilter];buildFilters();applyFilters()});
  }
  function updateCount(){const e=$('#filterCount');if(e)e.textContent=`${fmt(state.filtered.length)} registros`}
  function kpi(label,value,sub){return `<div class="kpi fade-in"><div class="kpi-label">${esc(label)}</div><div class="kpi-value">${value}</div><div class="kpi-sub">${esc(sub||'')}</div></div>`}
  function fillKpis(extra=[]){
    const d=state.filtered,total=d.length;
    const programs=new Set(d.map(r=>norm(r['Nombre Programa'])).filter(valid)).size,fac=new Set(d.map(r=>norm(r.Facultad)).filter(valid)).size,sedes=new Set(d.map(r=>norm(r.Sede)).filter(valid)).size;
    const topMod=top(d,'Modalidad',1)[0], topType=top(d,'Tipo Programa',1)[0];
    const box=$('#kpis');if(!box)return;
    box.innerHTML=[
      kpi('Estudiantes',fmt(total),'Registros en la selección'),
      kpi('Programas',fmt(programs),'Programas con matrícula'),
      kpi('Facultades',fmt(fac),'Unidades con matrícula'),
      kpi('Sedes',fmt(sedes),'Sedes representadas'),
      kpi('Modalidad principal',shorten(topMod?.[0]||'—',18),topMod?`${fmt(topMod[1])} · ${pct(topMod[1],total)}`:'Sin datos'),
      kpi('Tipo de programa',shorten(topType?.[0]||'—',18),topType?`${fmt(topType[1])} · ${pct(topType[1],total)}`:'Sin datos'),
      ...extra
    ].join('');
  }

  // ---------- SVG charts: no external chart library is required ----------
  function clearChart(id){const e=$('#'+id);if(e)e.innerHTML='';return e}
  function chartBase(id){
    const e=clearChart(id); if(!e)return null;
    const w=e.clientWidth||600,h=e.clientHeight||220;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('role','img');e.appendChild(svg);return {e,svg,w,h}
  }
  function text(svg,x,y,value,attrs={}){
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');t.setAttribute('x',x);t.setAttribute('y',y);t.textContent=value;
    Object.entries(attrs).forEach(([k,v])=>t.setAttribute(k,v));svg.appendChild(t);return t;
  }
  function rect(svg,x,y,w,h,attrs={}){
    const r=document.createElementNS('http://www.w3.org/2000/svg','rect');r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width',Math.max(0,w));r.setAttribute('height',Math.max(0,h));r.setAttribute('rx',attrs.rx??6);
    Object.entries(attrs).filter(([k])=>k!=='rx').forEach(([k,v])=>r.setAttribute(k,v));svg.appendChild(r);return r;
  }
  function line(svg,x1,y1,x2,y2,attrs={}){
    const l=document.createElementNS('http://www.w3.org/2000/svg','line');Object.entries({x1,y1,x2,y2,...attrs}).forEach(([k,v])=>l.setAttribute(k,v));svg.appendChild(l);return l;
  }
  function tip(textValue){
    let t=$('#chartTooltip');
    if(!t){t=document.createElement('div');t.id='chartTooltip';t.className='chart-tooltip';document.body.appendChild(t)}
    t.textContent=textValue;t.classList.add('show');
    return t;
  }
  function hideTip(){ $('#chartTooltip')?.classList.remove('show') }
  function bindHover(node,label,value){
    node.addEventListener('mouseenter',e=>{const t=tip(`${label} · ${fmt(value)}`);t.style.left=`${e.clientX+12}px`;t.style.top=`${e.clientY+12}px`;});
    node.addEventListener('mousemove',e=>{const t=$('#chartTooltip');if(t){t.style.left=`${e.clientX+12}px`;t.style.top=`${e.clientY+12}px`;}});
    node.addEventListener('mouseleave',hideTip);
  }
  function bar(id,items,opts={}){
    const c=chartBase(id);if(!c)return;
    const {svg,w,h}=c;
    if(!items.length){chartEmpty(id,'Sin datos suficientes','No hay categorías válidas para esta selección.');return}
    const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
    defs.innerHTML=`<linearGradient id="uaBarGradient-${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#60a5fa"/></linearGradient>`;
    svg.appendChild(defs);
    const left=opts.left||Math.min(215,Math.max(132,w*.31)),right=72,topm=12,bottom=10;
    const row=Math.min(48,Math.max(34,(h-topm-bottom)/items.length));
    const max=Math.max(...items.map(x=>Number(x[1])||0),1), trackW=Math.max(100,w-left-right-8);
    items.forEach((it,i)=>{
      const y=topm+i*row+5,val=Number(it[1])||0,bw=trackW*(val/max),label=shorten(it[0],opts.labelLen||30);
      text(svg,left-12,y+12,label,{'text-anchor':'end','font-size':'10.5','font-weight':'600','fill':'#475569'});
      rect(svg,left,y,trackW,13,{fill:'#edf2f7',rx:6.5});
      const r=rect(svg,left,y,Math.max(8,bw),13,{fill:`url(#uaBarGradient-${id})`,rx:6.5});
      r.style.transformOrigin=`${left}px ${y+6.5}px`;r.style.animation=`chartBar .55s cubic-bezier(.2,.8,.2,1) ${i*55}ms both`;
      bindHover(r,it[0],val);
      text(svg,left+trackW+10,y+10,fmt(val),{'font-size':'9.5','font-weight':'850','fill':'#111827'});
    });
  }
  function donut(id,items,opts={}){
    const c=chartBase(id);if(!c)return;
    if(!items.length){chartEmpty(id,'Sin datos suficientes','No hay categorías válidas para esta selección.');return}
    const {svg,w,h}=c,cx=w*.32,cy=h*.5,r=Math.min(78,h*.34,w*.25),total=items.reduce((a,b)=>a+b[1],0)||1;
    let angle=-Math.PI/2;
    const shown=items.slice(0,opts.max||5), shownTotal=shown.reduce((a,b)=>a+b[1],0)||1;
    shown.forEach((it,i)=>{
      const frac=it[1]/shownTotal,a2=angle+frac*Math.PI*2;
      const x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2),large=frac>.5?1:0;
      const p=document.createElementNS('http://www.w3.org/2000/svg','path');
      p.setAttribute('d',`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`);
      p.setAttribute('fill',COLORS[i%COLORS.length]);p.setAttribute('stroke','#fff');p.setAttribute('stroke-width','3');p.style.cursor='pointer';p.style.transition='.18s ease';
      p.style.transformOrigin=`${cx}px ${cy}px`;p.style.animation=`pieIn .55s ease ${i*45}ms both`;
      bindHover(p,it[0],it[1]);
      p.addEventListener('mouseenter',()=>p.setAttribute('opacity','.78'));p.addEventListener('mouseleave',()=>p.setAttribute('opacity','1'));
      svg.appendChild(p);angle=a2;
    });
    const hole=document.createElementNS('http://www.w3.org/2000/svg','circle');hole.setAttribute('cx',cx);hole.setAttribute('cy',cy);hole.setAttribute('r',r*.58);hole.setAttribute('fill','#fff');svg.appendChild(hole);
    text(svg,cx,cy-2,fmt(total),{'text-anchor':'middle','font-size':'19','font-weight':'850','fill':'#0f172a'});
    text(svg,cx,cy+14,'estudiantes',{'text-anchor':'middle','font-size':'8.5','fill':'#64748b'});
    shown.forEach((it,i)=>{
      const y=24+i*27,x=w*.56;
      const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r',4);dot.setAttribute('fill',COLORS[i%COLORS.length]);svg.appendChild(dot);
      text(svg,x+10,y+3,shorten(it[0],22),{'font-size':'9.5','fill':'#475569'});
      text(svg,w-8,y+3,`${fmt(it[1])} · ${pct(it[1],total)}`,{'text-anchor':'end','font-size':'9.5','font-weight':'800','fill':'#172033'});
    });
  }
  function addChartLegend(container,names){
    if(!names?.length)return;
    const legend=document.createElement('div');legend.className='chart-legend';
    names.forEach((name,i)=>{const item=document.createElement('span');item.className='chart-legend-item';item.innerHTML=`<i style="background:${COLORS[i%COLORS.length]}"></i><span>${esc(shorten(name,28))}</span>`;legend.appendChild(item)});
    container.appendChild(legend);
  }
  function groupedBars(id,labels,sets,names,opts={}){
    const c=chartBase(id);if(!c)return;const {svg,w,h,e}=c;
    if(!labels.length){chartEmpty(id,'Sin datos suficientes','No hay categorías válidas para esta selección.');return}
    const left=42,right=16,topm=24,bottom=36,plotH=Math.max(80,h-topm-bottom),max=Math.max(...sets.flat().map(Number),1),groups=labels.length,gap=(w-left-right)/groups,bw=Math.min(46,Math.max(14,gap/(sets.length+1)));
    for(let i=0;i<4;i++){const y=topm+plotH*i/3;line(svg,left,y,w-right,y,{stroke:'#e8edf3','stroke-width':'1'});}
    labels.forEach((lab,i)=>{
      const x=left+i*gap+gap/2;
      sets.forEach((arr,j)=>{const val=Number(arr[i]||0),bh=plotH*val/max,rx=x-(sets.length*bw/2)+j*bw;const r=rect(svg,rx,h-bottom-bh,Math.max(7,bw-5),bh,{fill:COLORS[j%COLORS.length],rx:Math.min(7,(bw-5)/2)});r.style.transformOrigin=`${rx+bw/2}px ${h-bottom}px`;r.style.animation=`growUp .55s ease ${i*35+j*40}ms both`;bindHover(r,`${lab} · ${names[j]}`,val);});
      text(svg,x,h-10,shorten(lab,15),{'text-anchor':'middle','font-size':'8.5','fill':'#64748b'});
    });
    addChartLegend(e,names);
  }
  function stacked(id,labels,sets,names,opts={}){
    const c=chartBase(id);if(!c)return;const {svg,w,h,e}=c;
    if(!labels.length){chartEmpty(id,'Sin datos suficientes','No hay categorías válidas para esta selección.');return}
    const left=42,right=16,topm=24,bottom=36,plotH=Math.max(80,h-topm-bottom),totals=labels.map((_,i)=>sets.reduce((a,s)=>a+(Number(s[i])||0),0)),max=Math.max(...totals,1),gap=(w-left-right)/labels.length,bw=Math.min(72,Math.max(18,gap*.62));
    for(let i=0;i<4;i++){const y=topm+plotH*i/3;line(svg,left,y,w-right,y,{stroke:'#e8edf3','stroke-width':'1'});}
    labels.forEach((lab,i)=>{let y=h-bottom;sets.forEach((arr,j)=>{const val=Number(arr[i]||0),bh=plotH*val/max;y-=bh;const r=rect(svg,left+i*gap+gap/2-bw/2,y,bw,bh,{fill:COLORS[j%COLORS.length],rx:Math.min(7,bw/2)});r.style.animation=`growUp .5s ease ${i*45+j*55}ms both`;bindHover(r,`${lab} · ${names[j]}`,val)});text(svg,left+i*gap+gap/2,h-10,shorten(lab,16),{'text-anchor':'middle','font-size':'8.5','fill':'#64748b'});});
    addChartLegend(e,names);
  }
  function matrix(id,rows,cols,getValue){
    const c=chartBase(id);if(!c)return;const {svg,w,h}=c;
    if(!rows.length||!cols.length){chartEmpty(id,'Sin datos suficientes','No hay dimensiones válidas para construir la matriz.');return}
    const left=Math.min(165,w*.26),topm=40,right=10,bottom=28,cw=(w-left-right)/cols.length,ch=Math.min(62,(h-topm-bottom)/rows.length);
    const max=Math.max(...rows.flatMap(r=>cols.map(col=>getValue(r,col))),1);
    cols.forEach((col,j)=>text(svg,left+j*cw+cw/2,18,shorten(col,15),{'text-anchor':'middle','font-size':'9','font-weight':'800','fill':'#475569'}));
    rows.forEach((row,i)=>{
      const y=topm+i*ch;
      text(svg,left-9,y+ch*.62,shorten(row,24),{'text-anchor':'end','font-size':'9','fill':'#475569'});
      cols.forEach((col,j)=>{
        const v=getValue(row,col),ratio=v/max,x=left+j*cw+5,cellW=Math.max(18,cw-10),cellH=Math.max(22,ch-8);
        const r=rect(svg,x,y+4,cellW,cellH,{fill:`rgba(37,99,235,${.08+.72*ratio})`,rx:9,stroke:'#e5eaf1','stroke-width':'1'});
        text(svg,x+cellW/2,y+4+cellH/2+4,v?fmt(v):'—',{'text-anchor':'middle','font-size':'10','font-weight':'800','fill':ratio>.48?'#fff':'#334155'});
        bindHover(r,`${row} · ${col}`,v);
      });
    });
  }
  function chartEmpty(id,title,desc){
    const e=clearChart(id);if(!e)return;e.classList.add('is-empty');e.innerHTML=`<div class="chart-empty"><div><div class="empty-icon">${ICONS.clock}</div><strong>${esc(title)}</strong><div style="margin-top:4px">${esc(desc)}</div></div></div>`
  }

  function insights(data){
    const total=data.length, mod=top(data,'Modalidad',1)[0], fac=top(data,'Facultad',1)[0], sede=top(data,'Sede',1)[0];
    const concentration=sede?Number((sede[1]/total*100).toFixed(1)):0;
    return [
      ['Mayor concentración',sede?`${shorten(sede[0],24)} · ${pct(sede[1],total)}`:'Sin datos'],
      ['Unidad con más matrícula',fac?`${shorten(fac[0].replace(/^Facultad de /,''),25)} · ${pct(fac[1],total)}`:'Sin datos'],
      ['Modalidad dominante',mod?`${mod[0]} · ${pct(mod[1],total)}`:'Sin datos'],
      ['Concentración sede líder',concentration>=45?'Alta concentración en una sede':'Distribución más diversificada']
    ];
  }

  function renderInsights(data){
    const el=$('#insights');if(!el)return;el.innerHTML=insights(data).map(x=>`<div class="insight"><b>${esc(x[0])}</b>${esc(x[1])}</div>`).join('');
  }

  function csv(data){
    if(!data.length)return '';
    const cols=Object.keys(data[0]), q=v=>`"${String(v??'').replaceAll('"','""')}"`;
    return '\uFEFF'+[cols.map(q).join(','),...data.map(r=>cols.map(c=>q(r[c])).join(','))].join('\r\n');
  }
  function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),800)}
  function exportCSV(){download(new Blob([csv(state.filtered)],{type:'text/csv;charset=utf-8'}),'matriculas_filtrado.csv');toast('CSV exportado')}
  function exportJSON(){download(new Blob([JSON.stringify(state.filtered,null,2)],{type:'application/json'}),'matriculas_filtrado.json');toast('JSON exportado')}
  async function exportXLSX(){try{const r=await fetch('/api/export/xlsx',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:state.filtered})});if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.error||`Servidor respondió ${r.status}`)}download(await r.blob(),'matriculas_filtrado.xlsx');toast(`Excel exportado · ${fmt(state.filtered.length)} registros`)}catch(e){toast(e.message||'No se pudo generar Excel')}}
  function printReport(){
    const d=state.filtered,total=d.length;
    const rows=(items)=>items.map(([a,b])=>`<tr><td>${esc(a)}</td><td>${fmt(b)}</td><td>${pct(b,total)}</td></tr>`).join('');
    const filters=Object.entries(state.filters).filter(([,v])=>v).map(([k,v])=>`${esc(k)}: ${esc(v)}`).join(' · ')||'Sin filtros';
    const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe Universidad Analytics</title><style>@page{size:A4;margin:16mm}*{box-sizing:border-box}body{font-family:Arial;color:#172033;margin:0}header{border-bottom:3px solid #173b68;padding-bottom:14px;margin-bottom:22px}h1{font-size:25px;margin:0;color:#173b68}h2{font-size:15px;margin:26px 0 8px;color:#173b68}p{font-size:10px;line-height:1.55;color:#526174}.meta{font-size:9px;color:#68788d}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:16px 0}.card{border:1px solid #dfe5ed;border-radius:9px;padding:11px}.label{font-size:8px;color:#708096;text-transform:uppercase}.value{font-size:20px;font-weight:800;margin-top:5px}table{width:100%;border-collapse:collapse;font-size:9px}th{background:#edf3fa;color:#173b68;text-align:left;padding:7px}td{border-bottom:1px solid #e7ebf0;padding:6px}footer{margin-top:30px;padding-top:10px;border-top:1px solid #dfe5ed;font-size:8px;color:#748297}</style></head><body><header><h1>Universidad Analytics</h1><p>Informe ejecutivo de matrícula</p><div class="meta">Periodo 2026-1 · Vista ${esc(state.page)} · Generado ${new Date().toLocaleString('es-CO')}<br>Filtros: ${filters}</div></header><div class="cards"><div class="card"><div class="label">Estudiantes</div><div class="value">${fmt(total)}</div></div><div class="card"><div class="label">Programas</div><div class="value">${fmt(new Set(d.map(r=>norm(r['Nombre Programa'])).filter(valid)).size)}</div></div><div class="card"><div class="label">Facultades</div><div class="value">${fmt(new Set(d.map(r=>norm(r.Facultad)).filter(valid)).size)}</div></div><div class="card"><div class="label">Sedes</div><div class="value">${fmt(new Set(d.map(r=>norm(r.Sede)).filter(valid)).size)}</div></div></div><p>Resumen descriptivo de la selección actual. Los datos sin información válida no participan en las visualizaciones.</p><h2>Facultades con mayor matrícula</h2><table><thead><tr><th>Facultad</th><th>Estudiantes</th><th>Participación</th></tr></thead><tbody>${rows(top(d,'Facultad',8))}</tbody></table><h2>Programas con mayor matrícula</h2><table><thead><tr><th>Programa</th><th>Estudiantes</th><th>Participación</th></tr></thead><tbody>${rows(top(d,'Nombre Programa',10))}</tbody></table><h2>Modalidades y sedes</h2><table><thead><tr><th>Categoría</th><th>Estudiantes</th><th>Participación</th></tr></thead><tbody>${rows(top(d,'Modalidad',6))}${rows(top(d,'Sede',8))}</tbody></table><footer>Universidad Analytics · Informe descriptivo del periodo 2026-1.</footer></body></html>`;
    const w=window.open('','_blank');if(!w){toast('El navegador bloqueó el informe');return}w.document.write(html);w.document.close();setTimeout(()=>w.print(),400);
  }
  async function exportReportDocx(){try{const r=await fetch('/api/report/docx',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:state.filtered,filters:state.filters,page:document.getElementById('pageName')?.textContent||state.page})});if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.error||'No se pudo generar el informe')}download(await r.blob(),'informe_universidad_analytics.docx');toast('Informe Word generado')}catch(e){toast(e.message||'No se pudo generar el informe')}
  }
  async function downloadTemplate(){try{const r=await fetch('/api/template/xlsx');if(!r.ok)throw new Error('No se pudo generar la plantilla');download(await r.blob(),'plantilla_universidad_analytics.xlsx');toast('Plantilla Excel generada')}catch(e){toast(e.message)}}
  function recordForm(row={},idx=null){
    const fields=['Ano','Barrio','Comuna','Ciudad Nacimiento','Pais Nacimiento','Id Estrato','Nombre Programa','Sexo','Tipo Inscripcion','Sede','Facultad','Area Conocimiento','Institucion','Colegio','Modalidad','Tipo Programa','Estrato'];
    let modal=$('#recordModal');if(!modal){modal=document.createElement('div');modal.id='recordModal';modal.className='modal-backdrop';document.body.appendChild(modal)}
    modal.innerHTML=`<div class="modal-card"><div class="modal-head"><div><h2>${idx===null?'Registrar estudiante':'Editar registro'}</h2><p>Guarda el cambio y todas las vistas se actualizarán.</p></div><button class="icon-button" data-close-modal>×</button></div><div class="record-form">${fields.map(f=>`<label><span>${esc(f)}</span><input data-field="${esc(f)}" value="${esc(row[f]??'')}"></label>`).join('')}</div><div class="modal-actions"><button class="button" data-close-modal>Cancelar</button><button class="button primary" data-save-record>Guardar</button></div></div>`;
    modal.classList.add('open');const close=()=>modal.classList.remove('open');modal.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=close);
    modal.querySelector('[data-save-record]').onclick=async()=>{const record={};modal.querySelectorAll('[data-field]').forEach(i=>record[i.dataset.field]=i.value);try{const r=await fetch(idx===null?'/api/records':'/api/records/'+idx,{method:idx===null?'POST':'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({record})});const j=await r.json();if(!r.ok)throw new Error(j.error||'No se pudo guardar');close();await load();toast(idx===null?'Registro agregado':'Registro actualizado')}catch(e){toast(e.message)}};
  }
  async function deleteRecord(idx){if(!confirm('¿Eliminar este registro? Se guardará una copia de seguridad.'))return;try{const r=await fetch('/api/records/'+idx,{method:'DELETE'});const j=await r.json();if(!r.ok)throw new Error(j.error||'No se pudo eliminar');await load();toast('Registro eliminado')}catch(e){toast(e.message)}}
  async function importFile(file){
    const fd=new FormData();fd.append('file',file);try{const r=await fetch('/api/import',{method:'POST',body:fd});const j=await r.json();if(!r.ok||!j.data)throw new Error(j.error||'Importación fallida');const merge=confirm(`Se encontraron ${fmt(j.data.length)} registros.\n\nAceptar = agregarlos al dataset actual.\nCancelar = reemplazar el dataset actual.`);const rows=merge?[...state.data,...j.data]:j.data;const save=await fetch('/api/dataset/replace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:rows})});const sj=await save.json();if(!save.ok)throw new Error(sj.error||'No se pudo guardar la importación');await load();const rejected=sj.meta?.rejected_count||0;toast(rejected?`${fmt(sj.meta.records)} registros guardados · ${fmt(rejected)} filas omitidas por validación`:`${fmt(sj.meta.records)} registros disponibles`);return true}catch(e){toast(e.message||'No se pudo importar el archivo');return false}
  }

  async function load(){
    try{
      const health=await fetch('/api/health',{cache:'no-store'});
      if(!health.ok) throw new Error(`Servidor local respondió HTTP ${health.status}`);
      const hv=await health.json();
      if(hv.version && hv.version!=='3.2') throw new Error('El servidor local no corresponde a esta versión. Ejecuta iniciar_dashboard.bat para iniciar Universidad Analytics 3.2.');

      const r=await fetch('/api/data',{cache:'no-store'});
      if(!r.ok){
        let detail='';
        try{ const er=await r.json(); detail=er.error?` · ${er.error}`:'' }catch(_){}
        throw new Error(`No se pudo consultar /api/data (HTTP ${r.status})${detail}`);
      }
      const j=await r.json();
      if(!Array.isArray(j.data)) throw new Error('El servidor respondió, pero el campo data no es una lista.');
      state.data=j.data;
      state.filtered=[...state.data];
      state.meta=j.meta||{};
      buildFilters();
      dispatch();
      $('#loading')?.classList.add('hide');
      window.dispatchEvent(new CustomEvent('data:ready',{detail:state.data}));
    }catch(e){
      console.error('Universidad Analytics:',e);
      $('#loadingTitle').textContent='No se pudo cargar el dataset';
      $('#loadingSub').textContent=e?.message || 'Error desconocido al cargar los datos.';
      const line=$('#loadingLine');if(line)line.style.display='none';
      $('#loadingActions').style.display='flex';
    }
  }

  function setupGlobal(){
    hydrateIcons();
    const tr=document.querySelector('.top-right');
    if(tr && !tr.querySelector('[data-report]')){const b=document.createElement('button');b.className='button';b.dataset.report='1';b.title='Generar informe';b.textContent='Informe';const exp=tr.querySelector('[data-export=\"xlsx\"]');if(exp)tr.insertBefore(b,exp);else tr.appendChild(b)}
    $('#drawerBackdrop')?.addEventListener('click',closeDrawer);
    $('#drawerClose')?.addEventListener('click',closeDrawer);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-export]');if(b){const fn={csv:exportCSV,json:exportJSON,xlsx:exportXLSX,print:printReport,docx:exportReportDocx,template:downloadTemplate}[b.dataset.export];if(fn){e.preventDefault();fn()}}
      const report=e.target.closest('[data-report]');if(report){e.preventDefault();exportReportDocx()}
      const imp=e.target.closest('[data-import]');if(imp)$('#importFile')?.click();
      const add=e.target.closest('[data-add-record]');if(add)recordForm();
      const edit=e.target.closest('[data-edit-record]');if(edit)recordForm(state.data[Number(edit.dataset.editRecord)],Number(edit.dataset.editRecord));
      const del=e.target.closest('[data-delete-record]');if(del)deleteRecord(Number(del.dataset.deleteRecord));
    });
    const input=$('#importFile');
    input?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importFile(f);e.target.value=''});
    const dz=$('#dropzone');
    if(dz){
      ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag')}));
      ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag')}));
      dz.addEventListener('drop',e=>{const f=e.dataTransfer.files?.[0];if(f)importFile(f)});
    }
    $('#refreshBtn')?.addEventListener('click',()=>{toast('Actualizando dataset…');load()});
  }

  function renderShell(){
    const page=state.page;
    $$('[data-page-link]').forEach(a=>a.classList.toggle('active',a.dataset.pageLink===page));
    const names={resumen:'Resumen general',demografia:'Demografía',academico:'Académico',geografia:'Geografía',colegios:'Colegios de origen',explorador:'Explorador de datos',universidad360:'Universidad 360',gestion:'Gestión de datos',reportes:'Reportes'};
    const e=$('#pageName');if(e)e.textContent=names[page]||'Analítica institucional';
  }

  window.UA={state,$,$$,fmt,pct,norm,esc,shorten,valid,group,top,count,unique,icon,ICONS,bar,donut,groupedBars,stacked,matrix,chartEmpty,fillKpis,renderInsights,toast,applyFilters,clearFilters,buildFilters,exportCSV,exportJSON,exportXLSX,printReport,exportReportDocx,downloadTemplate,recordForm,deleteRecord,importFile};
  renderShell();setupGlobal();load();
})();
