"""Resúmenes estadísticos sobre los registros."""
from .schema import is_valid

def summarize(rows):
    def counts(key):
        d={}
        for r in rows:
            v=r.get(key)
            if not is_valid(v): continue
            d[str(v)]=d.get(str(v),0)+1
        return sorted(d.items(),key=lambda x:x[1],reverse=True)
    total=len(rows)
    fac=counts('Facultad'); mod=counts('Modalidad'); prog=counts('Nombre Programa'); sede=counts('Sede'); typ=counts('Tipo Programa')
    return {
        'total':total,
        'programas':len(prog),'facultades':len(fac),'sedes':len(sede),
        'facultades_top':fac[:8],'modalidades':mod[:6],'programas_top':prog[:10],
        'sedes_top':sede[:8],'tipos':typ[:6]
    }
