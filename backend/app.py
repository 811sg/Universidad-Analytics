"""Servidor HTTP local: API REST + archivos estáticos del frontend."""
import json
import os
import traceback
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

from .config import ROOT, FRONTEND_DIR, DATA, HOST, PORT, VERSION, PERIOD, FIELDS
from .schema import sanitize, normalize_row
from .repository import load_data, save_data
from .importers import read_multipart, parse_upload
from .exporters.xlsx import xlsx_bytes, template_bytes
from .exporters.docx_report import docx_bytes

class Handler(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        # Solo se sirven archivos de frontend/. Cualquier ruta que escape de esa carpeta se descarta.
        rel=urlparse(path).path.lstrip('/'); target=(FRONTEND_DIR/rel).resolve()
        if target!=FRONTEND_DIR.resolve() and FRONTEND_DIR.resolve() not in target.parents:
            return str(FRONTEND_DIR/'__no_encontrado__')
        return str(target)
    def end_headers(self):
        self.send_header('Cache-Control','no-store, max-age=0'); self.send_header('Access-Control-Allow-Origin','*'); super().end_headers()
    def _json(self,payload,status=200):
        raw=json.dumps(sanitize(payload),ensure_ascii=False,allow_nan=False).encode('utf-8'); self.send_response(status); self.send_header('Content-Type','application/json; charset=utf-8'); self.send_header('Content-Length',str(len(raw))); self.end_headers(); self.wfile.write(raw)
    def _download(self,raw,ctype,name):
        self.send_response(200); self.send_header('Content-Type',ctype); self.send_header('Content-Disposition',f'attachment; filename="{name}"'); self.send_header('Content-Length',str(len(raw))); self.end_headers(); self.wfile.write(raw)
    def do_GET(self):
        parsed=urlparse(self.path)
        try:
            if parsed.path=='/api/health': return self._json({'ok':True,'service':'Universidad Analytics','version':VERSION,'port':PORT})
            if parsed.path=='/api/version': return self._json({'ok':True,'version':VERSION,'dataset':DATA.name})
            if parsed.path=='/api/data':
                rows=load_data(); return self._json({'data':rows,'meta':{'records':len(rows),'period':PERIOD,'source':DATA.name,'fields':FIELDS}})
            if parsed.path=='/api/template/xlsx': return self._download(template_bytes(),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','plantilla_universidad_analytics.xlsx')
            if parsed.path=='/': self.path='/index.html'
            return super().do_GET()
        except Exception as exc:
            traceback.print_exc(); return self._json({'error':str(exc)},500)
    def do_POST(self):
        parsed=urlparse(self.path)
        try:
            if parsed.path=='/api/import':
                filename,raw=read_multipart(self); rows,rejected=parse_upload(filename,raw)
                return self._json({'data':rows,'meta':{'records':len(rows),'filename':filename,'rejected':rejected[:25],'rejected_count':len(rejected)}})
            if parsed.path=='/api/records':
                length=int(self.headers.get('Content-Length','0')); payload=json.loads(self.rfile.read(length).decode('utf-8'))
                row=normalize_row(payload.get('record',payload)); rows=load_data(); rows.append(row); rows=save_data(rows)
                return self._json({'ok':True,'record':row,'meta':{'records':len(rows)}})
            if parsed.path=='/api/dataset/replace':
                length=int(self.headers.get('Content-Length','0')); payload=json.loads(self.rfile.read(length).decode('utf-8')); rows=payload.get('data',payload)
                if not isinstance(rows,list): raise ValueError('El conjunto recibido no es una lista.')
                rows=save_data(rows); return self._json({'ok':True,'data':rows,'meta':{'records':len(rows)}})
            if parsed.path=='/api/report/docx':
                length=int(self.headers.get('Content-Length','0')); payload=json.loads(self.rfile.read(length).decode('utf-8')); raw=docx_bytes(payload.get('data',[]),payload.get('filters',{}),payload.get('page','Resumen general')); return self._download(raw,'application/vnd.openxmlformats-officedocument.wordprocessingml.document','informe_universidad_analytics.docx')
            if parsed.path=='/api/export/xlsx':
                length=int(self.headers.get('Content-Length','0')); payload=json.loads(self.rfile.read(length).decode('utf-8')); raw=xlsx_bytes(payload.get('data',payload)); return self._download(raw,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','matriculas_filtrado.xlsx')
            if parsed.path=='/api/export/all':
                length=int(self.headers.get('Content-Length','0')); payload=json.loads(self.rfile.read(length).decode('utf-8')); raw=xlsx_bytes(payload.get('data',payload),'Vista completa'); return self._download(raw,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','universidad_analytics_vista_completa.xlsx')
            return self._json({'error':'Ruta no encontrada'},404)
        except ImportError as exc: return self._json({'error':f'Falta una dependencia para esta operación: {exc}'},500)
        except Exception as exc:
            traceback.print_exc(); return self._json({'error':str(exc)},500)
    def do_PUT(self):
        if urlparse(self.path).path.startswith('/api/records/'):
            try:
                idx=int(urlparse(self.path).path.rsplit('/',1)[-1]); length=int(self.headers.get('Content-Length','0')); payload=json.loads(self.rfile.read(length).decode('utf-8')); row=normalize_row(payload.get('record',payload)); rows=load_data()
                if idx<0 or idx>=len(rows): return self._json({'error':'Registro no encontrado.'},404)
                rows[idx]=row; rows=save_data(rows); return self._json({'ok':True,'record':row,'meta':{'records':len(rows)}})
            except Exception as exc: return self._json({'error':str(exc)},400)
        return self._json({'error':'Ruta no encontrada'},404)
    def do_DELETE(self):
        if urlparse(self.path).path.startswith('/api/records/'):
            try:
                idx=int(urlparse(self.path).path.rsplit('/',1)[-1]); rows=load_data()
                if idx<0 or idx>=len(rows): return self._json({'error':'Registro no encontrado.'},404)
                deleted=rows.pop(idx); rows=save_data(rows); return self._json({'ok':True,'record':deleted,'meta':{'records':len(rows)}})
            except Exception as exc: return self._json({'error':str(exc)},400)
        return self._json({'error':'Ruta no encontrada'},404)


def main():
    os.chdir(ROOT); print('='*58); print('       UNIVERSIDAD ANALYTICS - LOCAL'); print('='*58); print(f'Servidor: http://localhost:{PORT}'); print(f'Versión:  {VERSION}'); print(f'Dataset:   {DATA}')
    try: print(f'Registros disponibles: {len(load_data()):,}'.replace(',','.')); print('[OK] Dataset listo.')
    except Exception as exc: print(f'[ERROR] {exc}')
    print('Presiona Ctrl+C para detener.'); print(); ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()


if __name__ == "__main__":
    main()
