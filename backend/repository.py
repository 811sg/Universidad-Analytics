"""Persistencia del dataset (JSON principal + CSV sincronizado + copias de seguridad)."""
import csv
import datetime
import json
import os
import shutil

from .config import DATA, DATA_DIR, SEED_DIR, BACKUP_DIR, FIELDS
from .schema import sanitize, normalize_row

def ensure_dataset():
    """Si DATA_DIR es un disco nuevo/vacío, copia el dataset inicial incluido en el proyecto."""
    if DATA.exists() or DATA_DIR.resolve() == SEED_DIR.resolve():
        return
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    for name in ("matriculados_limpios.json", "matriculados_limpios.csv"):
        src = SEED_DIR / name
        if src.exists():
            shutil.copy2(src, DATA_DIR / name)

def load_data():
    with DATA.open("r", encoding="utf-8") as f:
        return sanitize(json.load(f))

def save_data(rows):
    rows=[normalize_row(r) for r in rows if isinstance(r,dict)]
    seen=set(); clean=[]
    for r in rows:
        key=json.dumps(r,sort_keys=True,ensure_ascii=False,default=str)
        if key in seen: continue
        seen.add(key); clean.append(r)
    BACKUP_DIR.mkdir(parents=True,exist_ok=True)
    stamp=datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    if DATA.exists():
        shutil.copy2(DATA, BACKUP_DIR/f"matriculados_{stamp}.json")
    tmp=DATA.with_suffix('.tmp')
    with tmp.open('w',encoding='utf-8') as f:
        json.dump(clean,f,ensure_ascii=False,indent=2,allow_nan=False)
    os.replace(tmp,DATA)
    # Keep the companion CSV synchronized.
    with (DATA.parent/'matriculados_limpios.csv').open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=FIELDS); w.writeheader(); w.writerows(clean)
    return clean
