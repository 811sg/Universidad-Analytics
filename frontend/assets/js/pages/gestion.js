let gSort='Nombre Programa',gDir=1,gPage=1,gSize=25,gSearch='';
window.addEventListener('data:ready',()=>renderGestion(UA.state.data));
window.addEventListener('data:filtered',e=>{gPage=1;renderGestion(e.detail)});
function renderGestion(d){
 UA.fillKpis();
 let rows=d.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(gSearch.toLowerCase())));
 rows.sort((a,b)=>String(a[gSort]??'').localeCompare(String(b[gSort]??''),'es',{numeric:true})*gDir);
 const pages=Math.max(1,Math.ceil(rows.length/gSize));gPage=Math.min(gPage,pages);const slice=rows.slice((gPage-1)*gSize,gPage*gSize);
 const cols=['Ano','Nombre Programa','Facultad','Sede','Modalidad','Tipo Programa','Sexo','Ciudad Nacimiento'];
 const t=document.getElementById('dataTable');
 t.innerHTML=`<thead><tr>${cols.map(c=>`<th data-sort="${UA.esc(c)}">${UA.esc(c)}</th>`).join('')}<th>Acciones</th></tr></thead><tbody>${slice.map(r=>{const idx=UA.state.data.indexOf(r);return `<tr>${cols.map(c=>`<td>${UA.esc(r[c]??'')}</td>`).join('')}<td class="row-actions"><button class="button small" data-edit-record="${idx}">Editar</button><button class="button small danger" data-delete-record="${idx}">Eliminar</button></td></tr>`}).join('')||`<tr><td colspan="${cols.length+1}" style="text-align:center;padding:30px;color:#64748b">No hay registros en la selección.</td></tr>`}</tbody>`;
 document.getElementById('rowInfo').textContent=`${UA.fmt(rows.length)} resultados · página ${gPage} de ${pages}`;
 document.querySelectorAll('[data-sort]').forEach(e=>e.onclick=()=>{if(gSort===e.dataset.sort)gDir*=-1;else{gSort=e.dataset.sort;gDir=1}renderGestion(d)});
}
document.addEventListener('input',e=>{if(e.target.id==='tableSearch'){gSearch=e.target.value;gPage=1;renderGestion(UA.state.filtered)}});
document.addEventListener('change',e=>{if(e.target.id==='pageSize'){gSize=Number(e.target.value);gPage=1;renderGestion(UA.state.filtered)}});
document.addEventListener('click',e=>{if(e.target.closest('#prevPage')){gPage=Math.max(1,gPage-1);renderGestion(UA.state.filtered)}if(e.target.closest('#nextPage')){const rows=UA.state.filtered.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(gSearch.toLowerCase())));gPage=Math.min(Math.max(1,Math.ceil(rows.length/gSize)),gPage+1);renderGestion(UA.state.filtered)}});
