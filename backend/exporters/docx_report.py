"""Informe ejecutivo en Word (.docx), generado sin dependencias externas."""
import datetime
import io
import html
import zipfile

from ..analytics import summarize
from ..config import LABELS, PERIOD

def _xml_text(value):
    return html.escape(str(value if value is not None else ""), quote=False)

def _docx_run(value, bold=False, size=18, color="172033", font="Arial"):
    b = '<w:b/>' if bold else ''
    return f'<w:r><w:rPr><w:rFonts w:ascii="{font}" w:hAnsi="{font}"/><w:color w:val="{color}"/><w:sz w:val="{size}"/>{b}</w:rPr><w:t xml:space="preserve">{_xml_text(value)}</w:t></w:r>'

def _docx_paragraph(value="", bold=False, size=18, color="172033", align=None, space_after=120, before=0, keep=False):
    jc = f'<w:jc w:val="{align}"/>' if align else ''
    keep_xml = '<w:keepNext/>' if keep else ''
    return f'<w:p><w:pPr>{jc}<w:spacing w:before="{before}" w:after="{space_after}"/><w:widowControl/>{keep_xml}</w:pPr>{_docx_run(value,bold,size,color)}</w:p>'

def _docx_heading(value, level=1):
    if level==1:
        return _docx_paragraph(value,True,22,"173B68",None,110,220,True)
    return _docx_paragraph(value,True,17,"173B68",None,80,150,True)

def _docx_table(headers, rows, widths=None, header_fill="173B68", stripe=True):
    widths = widths or [5200, 1900, 1500]
    while len(widths)<len(headers): widths.append(max(1200, 7200//len(headers)))
    parts=['<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar><w:tblBorders><w:top w:val="single" w:sz="6" w:color="C8D5E5"/><w:left w:val="single" w:sz="6" w:color="C8D5E5"/><w:bottom w:val="single" w:sz="6" w:color="C8D5E5"/><w:right w:val="single" w:sz="6" w:color="C8D5E5"/><w:insideH w:val="single" w:sz="4" w:color="E5EAF1"/><w:insideV w:val="single" w:sz="4" w:color="E5EAF1"/></w:tblBorders></w:tblPr>']
    def row(cells, header=False, stripe_row=False):
        out=['<w:tr>']
        for i,cell in enumerate(cells):
            shade=header_fill if header else ('F7F9FC' if stripe_row else 'FFFFFF')
            color='FFFFFF' if header else '172033'
            align='right' if (not header and i==len(cells)-1) else 'left'
            out.append(f'<w:tc><w:tcPr><w:tcW w:w="{widths[i]}" w:type="dxa"/><w:shd w:fill="{shade}"/></w:tcPr><w:p><w:pPr><w:jc w:val="{align}"/><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="{color}"/><w:sz w:val="16"/>{"<w:b/>" if header else ""}</w:rPr><w:t xml:space="preserve">{_xml_text(cell)}</w:t></w:r></w:p></w:tc>')
        out.append('</w:tr>')
        return ''.join(out)
    parts.append(row(headers,True))
    for idx,values in enumerate(rows): parts.append(row(values,False,stripe and idx%2==1))
    parts.append('</w:tbl>')
    return ''.join(parts)

def _docx_kpi_table(kpis):
    cells=[]
    for label,value in kpis:
        cells.append(f'<w:tc><w:tcPr><w:tcW w:w="2250" w:type="dxa"/><w:shd w:fill="F3F7FC"/><w:tcBorders><w:top w:val="single" w:sz="6" w:color="D8E3F0"/><w:left w:val="single" w:sz="6" w:color="D8E3F0"/><w:bottom w:val="single" w:sz="6" w:color="D8E3F0"/><w:right w:val="single" w:sz="6" w:color="D8E3F0"/></w:tcBorders></w:tcPr><w:p><w:pPr><w:spacing w:after="40"/></w:pPr>{_docx_run(label.upper(),True,12,"66768A")}</w:p><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>{_docx_run(str(value),True,26,"173B68")}</w:p></w:tc>')
    return '<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="150" w:type="dxa"/><w:left w:w="160" w:type="dxa"/><w:bottom w:w="150" w:type="dxa"/><w:right w:w="160" w:type="dxa"/></w:tblCellMar><w:tblBorders><w:insideV w:val="nil"/><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tblBorders></w:tblPr><w:tr>'+''.join(cells)+'</w:tr></w:tbl>'

def _docx_callout(title, text, fill="EEF5FF", border="AFC7EE"):
    return f'<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="130" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:bottom w:w="130" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tblCellMar><w:tblBorders><w:top w:val="single" w:sz="7" w:color="{border}"/><w:left w:val="single" w:sz="7" w:color="{border}"/><w:bottom w:val="single" w:sz="7" w:color="{border}"/><w:right w:val="single" w:sz="7" w:color="{border}"/></w:tblBorders></w:tblPr><w:tr><w:tc><w:tcPr><w:shd w:fill="{fill}"/></w:tcPr><w:p><w:pPr><w:spacing w:after="35"/></w:pPr>{_docx_run(title,True,14,"173B68")}</w:p><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>{_docx_run(text,False,16,"344054")}</w:p></w:tc></w:tr></w:tbl>'

def _docx_page_break():
    return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'

def _docx_footer():
    return '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="80"/></w:pPr><w:r><w:rPr><w:color w:val="718096"/><w:sz w:val="14"/></w:rPr><w:t>Universidad Analytics · Informe ejecutivo de matrícula · 2026-1</w:t></w:r></w:p></w:ftr>'

def docx_bytes(rows, filters=None, page_name='Resumen general'):
    s=summarize(rows); filters=filters or {}
    generated=datetime.datetime.now().strftime('%d/%m/%Y %H:%M')
    body=[]
    body.append(_docx_paragraph('UNIVERSIDAD ANALYTICS',True,32,'173B68','center',45,100))
    body.append(_docx_paragraph('Informe ejecutivo de matrícula',True,25,'111827','center',70,0))
    body.append(_docx_paragraph(f'Periodo {PERIOD}  ·  Vista {page_name}  ·  Generado {generated}',False,12,'66768A','center',170,0))
    body.append(_docx_callout('PROPÓSITO DEL INFORME','Resumen descriptivo para consulta institucional. Presenta el volumen de matrícula y sus principales concentraciones académicas, territoriales y de origen escolar.'))
    body.append(_docx_heading('Lectura rápida',1))
    body.append(_docx_kpi_table([('Estudiantes',f"{s['total']:,}".replace(',','.')),('Programas',f"{s['programas']:,}".replace(',','.')),('Facultades',f"{s['facultades']:,}".replace(',','.')),('Sedes',f"{s['sedes']:,}".replace(',','.'))]))
    if filters:
        items=[f'{LABELS.get(k,k)}: {v}' for k,v in filters.items() if v]
        body.append(_docx_heading('Alcance y filtros',2))
        body.append(_docx_callout('SELECCIÓN ANALIZADA',' · '.join(items) if items else 'Sin filtros aplicados.',fill='F8FAFC',border='D7E0EA'))
    body.append(_docx_heading('Qué muestran los datos',1))
    if s['facultades_top']:
        f=s['facultades_top'][0]; body.append(_docx_paragraph(f"La mayor concentración de matrícula corresponde a {f[0]}, con {f[1]:,} estudiantes.".replace(f'{f[1]:,}',f'{f[1]:,}'.replace(',', '.')),False,16,'344054',None,55))
    if s['modalidades']:
        m=s['modalidades'][0]; body.append(_docx_paragraph(f"La modalidad con mayor presencia es {m[0]}, con {m[1]:,} estudiantes.".replace(f'{m[1]:,}',f'{m[1]:,}'.replace(',', '.')),False,16,'344054',None,100))
    body.append(_docx_heading('Facultades con mayor matrícula',1))
    body.append(_docx_table(['Facultad','Estudiantes','Participación'],[[a,f"{b:,}".replace(',','.'),f"{b/s['total']*100:.1f}%" if s['total'] else '0.0%'] for a,b in s['facultades_top']],[5200,1900,1900]))
    body.append(_docx_heading('Modalidades',1))
    body.append(_docx_table(['Modalidad','Estudiantes','Participación'],[[a,f"{b:,}".replace(',','.'),f"{b/s['total']*100:.1f}%" if s['total'] else '0.0%'] for a,b in s['modalidades']],[5200,1900,1900]))
    body.append(_docx_paragraph('ANÁLISIS DE LA OFERTA',True,11,'66768A',None,35,60))
    body.append(_docx_heading('Programas con mayor matrícula',1))
    body.append(_docx_table(['Programa','Estudiantes','Participación'],[[a,f"{b:,}".replace(',','.'),f"{b/s['total']*100:.1f}%" if s['total'] else '0.0%'] for a,b in s['programas_top']],[5200,1900,1900]))
    body.append(_docx_heading('Sedes con mayor matrícula',1))
    body.append(_docx_table(['Sede','Estudiantes','Participación'],[[a,f"{b:,}".replace(',','.'),f"{b/s['total']*100:.1f}%" if s['total'] else '0.0%'] for a,b in s['sedes_top']],[5200,1900,1900]))
    body.append(_docx_heading('Nivel de los programas',1))
    body.append(_docx_table(['Nivel','Estudiantes','Participación'],[[a,f"{b:,}".replace(',','.'),f"{b/s['total']*100:.1f}%" if s['total'] else '0.0%'] for a,b in s['tipos']],[5200,1900,1900]))
    body.append(_docx_heading('Nota metodológica',1))
    body.append(_docx_callout('METODOLOGÍA','Este informe presenta patrones descriptivos de los registros seleccionados. No interpreta causalidad ni proyecta tendencias futuras. Los valores sin información válida no se usan para las visualizaciones analíticas.',fill='F8FAFC',border='D7E0EA'))
    body.append(_docx_paragraph('Fuente: dataset local de Universidad Analytics · periodo 2026-1.',False,11,'718096',None,40,150))
    document='''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>'''+''.join(body)+'''<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="700" w:right="900" w:bottom="850" w:left="900"/><w:cols w:num="1"/><w:footerReference w:type="default" r:id="rId4"/></w:sectPr></w:body></w:document>'''
    styles='''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:lang w:val="es-CO"/><w:sz w:val="20"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:line="260" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>'''
    rels='''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>'''
    doc_rels='''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>'''
    content='''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>'''.replace(' ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml" ContentType="application/xml"/>',' ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>')
    now=datetime.datetime.utcnow().replace(microsecond=0).isoformat()+'Z'
    core=f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"><dc:title>Universidad Analytics — Informe ejecutivo de matrícula</dc:title><dc:subject>Informe ejecutivo de matrícula</dc:subject><dc:creator>Universidad Analytics</dc:creator><cp:lastModifiedBy>Universidad Analytics</cp:lastModifiedBy><dcterms:created xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="dcterms:W3CDTF">{now}</dcterms:created></cp:coreProperties>'''
    app='''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Universidad Analytics</Application><AppVersion>3.2</AppVersion></Properties>'''
    buf=io.BytesIO()
    with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml',content); z.writestr('_rels/.rels',rels); z.writestr('word/document.xml',document); z.writestr('word/styles.xml',styles); z.writestr('word/_rels/document.xml.rels',doc_rels); z.writestr('word/footer1.xml',_docx_footer()); z.writestr('docProps/core.xml',core); z.writestr('docProps/app.xml',app)
    return buf.getvalue()
