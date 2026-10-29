window.addEventListener('data:ready',()=>renderRep(UA.state.data));
window.addEventListener('data:filtered',e=>renderRep(e.detail));
function renderRep(d){
  UA.fillKpis();
  UA.renderInsights(d);
  const list=document.getElementById('qualityList');
  const unique=arr=>new Set(arr.filter(v=>UA.valid(v)).map(v=>UA.norm(v))).size;
  const metrics=[
    ['Registros en vista',UA.fmt(d.length),'Filas seleccionadas'],
    ['Registros únicos',UA.fmt(new Set(d.map(r=>JSON.stringify(r))).size),'Sin duplicados exactos'],
    ['Facultades',UA.fmt(unique(d.map(r=>r.Facultad))),'Unidades con datos'],
    ['Programas',UA.fmt(unique(d.map(r=>r['Nombre Programa']))),'Oferta representada'],
    ['Sedes',UA.fmt(unique(d.map(r=>r.Sede))),'Puntos de atención']
  ];
  list.innerHTML=metrics.map(([label,value,sub])=>`<div class="quality-metric"><div><span>${UA.esc(label)}</span><small>${UA.esc(sub)}</small></div><strong>${value}</strong></div>`).join('')+
    `<div class="quality-foot">La calidad se calcula sobre la selección actual. Los valores vacíos o marcados como desconocidos no participan en las distribuciones analíticas.</div>`;
  const grid=document.getElementById('reportTables');
  const cats=['Modalidad','Tipo Programa','Sexo','Colegio'];
  grid.innerHTML=cats.map(k=>`<section class="summary-block"><div class="summary-head"><h3>${UA.esc(k)}</h3><span>${UA.fmt(d.length)} registros</span></div>${summary(k,d)}</section>`).join('');
}
function summary(k,d){
  const arr=UA.top(d,k,6),total=d.length||1;
  if(!arr.length)return '<div class="summary-empty">Sin datos válidos.</div>';
  return `<div class="summary-bars">${arr.map(([n,v])=>`<div class="summary-item"><div class="summary-line"><span title="${UA.esc(n)}">${UA.esc(UA.shorten(n,30))}</span><strong>${UA.fmt(v)} <em>${UA.pct(v,total)}</em></strong></div><div class="progress"><span style="width:${Math.min(100,v/total*100)}%"></span></div></div>`).join('')}</div>`;
}
