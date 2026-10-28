#!/usr/bin/env python3
"""Convierte el Excel de Lux et Origo en los JSON que lee el sitio.

Uso:  python3 herramientas/xlsx_a_json.py MiExcel.xlsx
Lee las hojas «Partituras», «Recursos» y «Salmos» y escribe
data/partituras.json, data/recursos.json y data/salmos.json.
"""
import json, re, sys, unicodedata
from pathlib import Path
from openpyxl import load_workbook

def norm(s):
    s = unicodedata.normalize("NFD", str(s or "")).lower()
    return re.sub(r"[^a-z0-9]+", " ", "".join(c for c in s if unicodedata.category(c) != "Mn")).strip()

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", norm(s)).strip("-")

# campo -> nombres de columna aceptados (ya normalizados)
HOJAS = {
    "partituras": ("data/partituras.json", {
        "titulo": ["titulo", "nombre", "pieza"], "obra": ["obra", "misa"],
        "compositor": ["autor", "compositor"], "parte": ["parte", "parte de la misa"],
        "notas": ["notas", "nota", "descripcion"],
        "drive_reducida": ["drive reducida", "drive partitura", "link de drive", "drive"],
        "drive_original": ["drive original", "link original", "link de la original", "original"],
        "youtube": ["youtube", "link youtube", "link de youtube", "audio"],
        "fuente": ["fuente", "link de la fuente", "link fuente"],
        "condicion": ["condicion", "estado de derechos"],
        "autorizada_por": ["autorizada por", "autorizacion", "autorizado por"],
        "id": ["id"],
    }),
    "recursos": ("data/recursos.json", {
        "categoria": ["categoria", "tipo"], "titulo": ["titulo", "nombre"],
        "autor": ["autor"], "descripcion": ["descripcion", "notas"],
        "drive": ["drive", "link de drive", "link drive"],
        "youtube": ["youtube", "link youtube"], "fuente": ["fuente", "link de la fuente"], "id": ["id"],
    }),
    "salmos": ("data/salmos.json", {
        "titulo": ["titulo", "nombre"], "referencia": ["referencia", "salmo"],
        "autor": ["autor", "compositor"], "tiempo": ["tiempo", "tiempo liturgico"],
        "descripcion": ["descripcion", "notas"], "drive": ["drive", "link de drive", "link drive"],
        "youtube": ["youtube", "link youtube"], "fuente": ["fuente", "link de la fuente"], "id": ["id"],
    }),
}
CATS = {"cantorales": "Cantorales", "libros": "Libros", "documentos": "Documentos"}

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
            for n, fila in enumerate(filas[1:], start=2):
                reg = {c: ("" if i >= len(fila) or fila[i] is None else str(fila[i]).strip()) for c, i in idx.items()}
                if not any(reg.values()): continue
                t = reg.get("titulo", "")
                if not t: avisos.append(f"{clave} fila {n}: sin título, se omitió."); continue
                if t.upper().startswith("EJEMPLO"): continue
                if clave == "recursos":
                    cat = CATS.get(norm(reg.get("categoria")))
                    if not cat: avisos.append(f"recursos fila {n} («{t}»): categoría debe ser Cantorales, Libros o Documentos."); continue
                    reg["categoria"] = cat
                if clave == "salmos": reg["categoria"] = ""
                base = reg.get("id") or slug(t + " " + reg.get("obra", ""))
                i, nid = 2, base
                while nid in ids: nid = f"{base}-{i}"; i += 1
                ids.add(nid); reg["id"] = nid
                for k in ("drive", "drive_reducida", "drive_original"):
                    v = reg.get(k, "")
                    if v and "drive.google.com" not in v and "docs.google.com" not in v:
                        avisos.append(f"{clave} fila {n} («{t}»): el enlace de {k} no parece de Drive.")
                for k in ("youtube",):
                    v = reg.get(k, "")
                    if v and "youtu" not in v: avisos.append(f"{clave} fila {n} («{t}»): el enlace de YouTube no parece válido.")
                out.append({"id": reg.pop("id"), **reg})
        (raiz / destino).write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{destino}: {len(out)} elemento(s)")
    for a in avisos: print("AVISO:", a)

if __name__ == "__main__":
    if len(sys.argv) != 2: sys.exit(__doc__)
    convertir(sys.argv[1], Path(__file__).resolve().parent.parent)
