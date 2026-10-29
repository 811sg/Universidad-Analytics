
window.addEventListener('data:ready',()=>renderDemo(UA.state.data));
window.addEventListener('data:filtered',e=>renderDemo(e.detail));
function renderDemo(d){
 UA.fillKpis();
 UA.donut('sexoChart',UA.group(d,'Sexo'));
 UA.bar('estratoChart',UA.group(d,'Estrato').sort((a,b)=>Number(a[0])-Number(b[0])),{labelLen:14});
 const fac=UA.top(d,'Facultad',4), labels=fac.map(x=>x[0].replace(/^Facultad de /,''));
 const fem=fac.map(x=>d.filter(r=>r.Facultad===x[0]&&r.Sexo==='Femenino').length);
 const masc=fac.map(x=>d.filter(r=>r.Facultad===x[0]&&r.Sexo==='Masculino').length);
 UA.stacked('sexoFacChart',labels,[fem,masc],['Femenino','Masculino']);
 UA.bar('ciudadesChart',UA.top(d,'Ciudad Nacimiento',5),{labelLen:19});
}
