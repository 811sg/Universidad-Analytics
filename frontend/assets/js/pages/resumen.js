
window.addEventListener('data:ready',()=>renderResumen(UA.state.data));
window.addEventListener('data:filtered',e=>renderResumen(e.detail));
function renderResumen(d){
  UA.fillKpis(); UA.renderInsights(d);
  const fac=UA.top(d,'Facultad',4);
  UA.bar('facultadChart',fac,{labelLen:27});
  const mod=UA.group(d,'Modalidad');
  UA.donut('modalidadChart',mod);
  const prog=UA.top(d,'Nombre Programa',5);
  UA.bar('programaChart',prog,{labelLen:29,color:'#3b82f6'});
  const tipo=UA.group(d,'Tipo Programa');
  UA.donut('tipoChart',tipo,{max:4});

  const facRows=UA.top(d,'Facultad',5).map(x=>x[0]);
  const modalities=UA.group(d,'Modalidad').slice(0,4).map(x=>x[0]);
  UA.matrix('concentrationMatrix',facRows,modalities,(fac,mod)=>d.filter(r=>UA.norm(r.Facultad)===fac&&UA.norm(r.Modalidad)===mod).length);
}
