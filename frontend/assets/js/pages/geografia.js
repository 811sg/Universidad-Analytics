
window.addEventListener('data:ready',()=>renderGeo(UA.state.data));
window.addEventListener('data:filtered',e=>renderGeo(e.detail));
function renderGeo(d){
 UA.fillKpis();
 UA.bar('cityChart',UA.top(d,'Ciudad Nacimiento',5),{labelLen:18});
 UA.donut('countryChart',UA.top(d,'Pais Nacimiento',6));
 UA.bar('comunaChart',UA.top(d,'Comuna',5),{labelLen:18});
 const sedes=UA.top(d,'Sede',5),facs=UA.top(d,'Facultad',4);
 const labels=sedes.map(x=>x[0]);
 const sets=facs.map(f=>sedes.map(s=>d.filter(r=>r.Sede===s[0]&&r.Facultad===f[0]).length));
 UA.stacked('sedeFacChart',labels,sets,facs.map(f=>f[0].replace(/^Facultad de /,'')));
}
