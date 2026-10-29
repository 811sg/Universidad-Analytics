
window.addEventListener('data:ready',()=>renderCol(UA.state.data));
window.addEventListener('data:filtered',e=>renderCol(e.detail));
function renderCol(d){
 UA.fillKpis();
 UA.donut('collegeChart',UA.group(d,'Colegio'));
 const labels=['Presencial','Virtual','Semipresencial'];
 const pub=labels.map(m=>d.filter(r=>r.Modalidad===m&&r.Colegio==='PÚBLICO').length);
 const pri=labels.map(m=>d.filter(r=>r.Modalidad===m&&r.Colegio==='PRIVADO').length);
 UA.groupedBars('collegeModChart',labels,[pub,pri],['Público','Privado']);
 const fac=UA.top(d,'Facultad',4), fl=fac.map(x=>x[0].replace(/^Facultad de /,''));
 const pubf=fac.map(x=>d.filter(r=>r.Facultad===x[0]&&r.Colegio==='PÚBLICO').length);
 const prif=fac.map(x=>d.filter(r=>r.Facultad===x[0]&&r.Colegio==='PRIVADO').length);
 UA.groupedBars('collegeFacChart',fl,[pubf,prif],['Público','Privado']);
 UA.bar('schoolsChart',UA.top(d,'Institucion',5),{labelLen:28});
}
