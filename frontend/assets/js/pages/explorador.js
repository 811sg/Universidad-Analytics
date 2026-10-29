
let sortKey='Nombre Programa',sortDir=1,page=1,pageSize=25,search='';
window.addEventListener('data:ready',()=>renderExp(UA.state.data));
window.addEventListener('data:filtered',e=>{page=1;renderExp(e.detail)});
function renderExp(d){
 UA.fillKpis();
 const q=search.toLowerCase();
 let rows=d.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(q)));
 rows.sort((a,b)=>String(a[sortKey]??'').localeCompare(String(b[sortKey]??''),'es',{numeric:true})*sortDir);
 const pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(page,pages);
 const cols=['Ano','Nombre Programa','Facultad','Sede','Modalidad','Tipo Programa','Sexo','Estrato','Ciudad Nacimiento','Comuna','Barrio','Colegio','Tipo Inscripcion'];
 const slice=rows.slice((page-1)*pageSize,page*pageSize);
 const t=document.getElementById('dataTable');
 t.innerHTML=`<thead><tr>${cols.map(c=>`<th data-sort="${UA.esc(c)}">${UA.esc(c)}</th>`).join('')}</tr></thead><tbody>${slice.map(r=>`<tr>${cols.map(c=>`<td>${UA.esc(r[c]??'')}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${cols.length}" style="text-align:center;padding:30px;color:#64748b">Sin resultados</td></tr>`}</tbody>`;
 document.getElementById('rowInfo').textContent=`${UA.fmt(rows.length)} resultados · página ${page} de ${pages}`;
 document.querySelectorAll('[data-sort]').forEach(e=>e.onclick=()=>{if(sortKey===e.dataset.sort)sortDir*=-1;else{sortKey=e.dataset.sort;sortDir=1}renderExp(d)});
}
document.addEventListener('input',e=>{if(e.target.id==='tableSearch'){search=e.target.value;page=1;renderExp(UA.state.filtered)}});
document.addEventListener('change',e=>{if(e.target.id==='pageSize'){pageSize=Number(e.target.value);page=1;renderExp(UA.state.filtered)}});
document.addEventListener('click',e=>{
 if(e.target.closest('#prevPage')){page=Math.max(1,page-1);renderExp(UA.state.filtered)}
 if(e.target.closest('#nextPage')){const rows=UA.state.filtered.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(search.toLowerCase())));page=Math.min(Math.max(1,Math.ceil(rows.length/pageSize)),page+1);renderExp(UA.state.filtered)}
});
