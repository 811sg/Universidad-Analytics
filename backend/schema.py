"""Normalización y validación de registros según el modelo institucional."""
import math
import unicodedata

from .config import FIELDS, LABELS, INVALID

def key_norm(value):
    text = str(value or "").strip().lower()
    return "".join(ch for ch in unicodedata.normalize("NFD", text) if unicodedata.category(ch) != "Mn")

HEADER_ALIASES = {}
for _field in FIELDS:
    HEADER_ALIASES[key_norm(_field)] = _field
    HEADER_ALIASES[key_norm(LABELS[_field])] = _field


def sanitize(v):
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    if isinstance(v, dict): return {k: sanitize(x) for k,x in v.items()}
    if isinstance(v, list): return [sanitize(x) for x in v]
    return v

def clean_value(v):
    if v is None: return None
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)): return None
    if isinstance(v, str):
        s=v.strip()
        if s.lower() in INVALID: return None
        return s
    return v

def normalize_row(row):
    out={}
    for f in FIELDS:
        out[f]=clean_value(row.get(f))
    # Mantener campos desconocidos no es necesario para el modelo institucional.
    if out.get("Ano") is not None:
        try: out["Ano"]=int(float(out["Ano"]))
        except: pass
    for f in ("Id Estrato",):
        if out.get(f) is not None:
            try: out[f]=int(float(out[f]))
            except: pass
    if out.get("Estrato") is not None:
        try: out["Estrato"]=float(out["Estrato"])
        except: pass
    return out

def is_valid(v):
    if v is None: return False
    return str(v).strip().lower() not in INVALID
