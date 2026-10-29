
window.addEventListener('data:ready',()=>renderAcad(UA.state.data));
window.addEventListener('data:filtered',e=>renderAcad(e.detail));
function renderAcad(d){
 UA.fillKpis();
 const fac=UA.top(d,'Facultad',4);
 UA.bar('facChart',fac,{labelLen:28});
 UA.bar('progChart',UA.top(d,'Nombre Programa',5),{labelLen:28,color:'#3b82f6'});
 const labels=fac.map(x=>x[0].replace(/^Facultad de /,''));
 const preg=fac.map(x=>d.filter(r=>r.Facultad===x[0]&&r['Tipo Programa']==='Pregrado').length);
 const post=fac.map(x=>d.filter(r=>r.Facultad===x[0]&&r['Tipo Programa']==='Posgrado').length);
 UA.stacked('facTipoChart',labels,[preg,post],['Pregrado','Posgrado']);
 const pres=fac.map(x=>d.filter(r=>r.Facultad===x[0]&&r.Modalidad==='Presencial').length);
 const virt=fac.map(x=>d.filter(r=>r.Facultad===x[0]&&r.Modalidad==='Virtual').length);
 const semi=fac.map(x=>d.filter(r=>r.Facultad===x[0]&&r.Modalidad==='Semipresencial').length);
 UA.stacked('facModChart',labels,[pres,virt,semi],['Presencial','Virtual','Semipresencial']);
}
