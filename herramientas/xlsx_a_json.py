#!/usr/bin/env python3
"""Convierte el Excel de Lux et Origo en los JSON que lee el sitio.

Uso:  python3 herramientas/xlsx_a_json.py herramientas/lux_et_origo_Datos.xlsx
Lee las hojas «Partituras», «Recursos» y «Salmos» y escribe
data/partituras.json, data/recursos.json y data/salmos.json.

Regla de celdas vacías: una celda en blanco o con 0 cuenta como "sin dato".
El sitio es quien muestra «No disponible», «Anónimo», etc. (ver la primera hoja del Excel).
"""
import json, re, sys, unicodedata
from pathlib import Path
from openpyxl import load_workbook

def norm(s):
    s = unicodedata.normalize("NFD", str(s or "")).lower()
    return re.sub(r"[^a-z0-9]+", " ", "".join(c for c in s if unicodedata.category(c) != "Mn")).strip()

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", norm(s)).strip("-")

def limpia(v):
    if v is None: return ""
    if isinstance(v, float) and v.is_integer(): v = int(v)
    s = str(v).strip()
    return "" if s in ("0", "-", "—") else s

HOJAS = {
    "partituras": ("data/partituras.json", {
        "titulo": ["titulo"], "tipo": ["tipo"], "compositor": ["autor", "compositor"], "parte": ["parte"],
        "drive_reducida": ["drive reducida"], "drive_original": ["drive original"], "youtube": ["youtube"],
        "fuente": ["fuente"], "condicion": ["condicion"], "autorizada_por": ["autorizada por"],
        "tiempo": ["tiempo"], "descripcion": ["descripcion"],
    }),
    "recursos": ("data/recursos.json", {
        "categoria": ["categoria"], "titulo": ["titulo"], "autor": ["autor"], "descripcion": ["descripcion"],
        "drive": ["drive"], "fuente": ["fuente"], "editorial": ["editorial"],
    }),
    "salmos": ("data/salmos.json", {
        "titulo": ["titulo"], "numero": ["no de salmo", "numero", "salmo"], "autor": ["autor"],
        "rito": ["dia o rito", "rito"], "descripcion": ["descripcion"],
        "drive": ["drive"], "youtube": ["youtube"], "fuente": ["fuente"],
    }),
}
CATS = {"cantoral": "Cantorales", "cantorales": "Cantorales", "libro": "Libros", "libros": "Libros",
        "documento": "Documentos", "documentos": "Documentos"}
PARTES = {"comunion": "Comunión", "aclamacion": "Aclamación", "kyrie": "Kyrie", "gloria": "Gloria", "credo": "Credo",
          "sanctus": "Sanctus", "agnus dei": "Agnus Dei", "entrada": "Entrada", "ofertorio": "Ofertorio", "salmo": "Salmo", "final": "Final"}

def convertir(xlsx, raiz):
    wb = load_workbook(xlsx, data_only=True)
    hojas = {norm(n): wb[n] for n in wb.sheetnames}
    avisos = []
    for clave, (destino, campos) in HOJAS.items():
        out, ids = [], set()
        ws = hojas.get(clave)
        if ws is None:
            avisos.append(f"No encontré la hoja «{clave.capitalize()}» (se deja vacía).")
        else:
            filas = list(ws.iter_rows(values_only=True))
            cab = [norm(c) for c in (filas[0] if filas else [])]
            idx = {}
            for campo, alias in campos.items():
                for a in alias:
                    if a in cab: idx[campo] = cab.index(a); break
            faltan = [c for c in campos if c not in idx]
            if faltan: avisos.append(f"{clave}: no encontré las columnas {faltan}.")
            for n, fila in enumerate(filas[1:], start=2):
                reg = {c: limpia(fila[i]) if i < len(fila) else "" for c, i in idx.items()}
                if not any(reg.values()): continue
                t = reg.get("titulo", "")
                if not t: avisos.append(f"{clave} fila {n}: sin título, no aparece."); continue
                if t.upper().startswith("EJEMPLO"): continue
                if clave == "recursos" and reg.get("categoria"):
                    cat = CATS.get(norm(reg["categoria"]))
                    if not cat: avisos.append(f"recursos fila {n} («{t}»): categoría «{reg['categoria']}» no válida; queda sin clasificar."); reg["categoria"] = ""
                    else: reg["categoria"] = cat
                if clave == "partituras" and reg.get("parte"):
                    reg["parte"] = PARTES.get(norm(reg["parte"]), reg["parte"])
                base = slug(t)
                i, nid = 2, base
                while nid in ids: nid = f"{base}-{i}"; i += 1
                ids.add(nid)
                for k in ("drive", "drive_reducida", "drive_original"):
                    v = reg.get(k, "")
                    if v and "drive.google.com" not in v and "docs.google.com" not in v:
                        avisos.append(f"{clave} fila {n} («{t}»): el enlace de {k} no parece de Drive.")
                if reg.get("youtube") and "youtu" not in reg["youtube"]:
                    avisos.append(f"{clave} fila {n} («{t}»): el enlace de YouTube no parece válido.")
                out.append({"id": nid, **reg})
        (raiz / destino).write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{destino}: {len(out)} elemento(s)")
    for a in avisos: print("AVISO:", a)

if __name__ == "__main__":
    if len(sys.argv) != 2: sys.exit(__doc__)
    convertir(sys.argv[1], Path(__file__).resolve().parent.parent)
