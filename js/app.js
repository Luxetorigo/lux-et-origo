(function () {
  var S = window.SITE || {};
  var root = document.documentElement;

  /* ---------- Almacenamiento seguro ---------- */
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* ---------- Tiempo litúrgico automático ---------- */
  function pascua(y) { // algoritmo de Meeus/Jones/Butcher
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
        f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
        mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mes - 1, dia);
  }
  function suma(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function temaAuto(hoy) {
    var y = hoy.getFullYear(), p = pascua(y), cenizas = suma(p, -46), pentecostes = suma(p, 49);
    var navidad = new Date(y, 11, 25), dow = navidad.getDay() || 7;
    var adviento = suma(navidad, -(dow + 21)); // primer domingo de Adviento
    var bautismo = new Date(y, 0, 13);
    if (hoy < bautismo) return "dorado";
    if (hoy >= cenizas && hoy < suma(p, -1)) return "morado";
    if (hoy >= suma(p, -1) && hoy < pentecostes) return "dorado";
    if (hoy.toDateString() === pentecostes.toDateString()) return "rojo";
    if (hoy >= adviento && hoy < navidad) return "morado";
    if (hoy >= navidad) return "dorado";
    return "ordinario";
  }

  var guardado = leer("lux-tema");
  var tema = guardado || temaAuto(new Date());
  root.setAttribute("data-tema", tema);
  var modo = leer("lux-modo") || "oscuro";
  root.setAttribute("data-modo", modo);

  /* ---------- Controles de tema ---------- */
  var ctrl = document.getElementById("ctrl");
  if (ctrl) {
    var nombres = { ordinario: "Tiempo ordinario (verde)", morado: "Adviento / Cuaresma (morado)", dorado: "Navidad / Pascua (blanco y oro)", rojo: "Pentecostés / mártires (rojo)", azul: "Mariano (azul)" };
    Object.keys(nombres).forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "sw"; b.dataset.t = t; b.title = nombres[t]; b.setAttribute("aria-label", nombres[t]);
      b.setAttribute("aria-pressed", t === tema);
      b.addEventListener("click", function () {
        tema = t; root.setAttribute("data-tema", t); guardar("lux-tema", t);
        ctrl.querySelectorAll(".sw").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      });
      ctrl.appendChild(b);
    });
    var m = document.createElement("button");
    m.type = "button"; m.className = "modo"; m.setAttribute("aria-label", "Cambiar entre modo claro y oscuro");
    function pintaModo() { m.textContent = modo === "oscuro" ? "☀" : "☾"; }
    pintaModo();
    m.addEventListener("click", function () {
      modo = modo === "oscuro" ? "claro" : "oscuro";
      root.setAttribute("data-modo", modo); guardar("lux-modo", modo); pintaModo();
    });
    ctrl.appendChild(m);
  }

  /* ---------- Versión del sitio ---------- */
  var pieF = document.querySelector("footer");
  if (pieF && S.version) { var pv = el("p", "small muted ver", "Versión " + S.version); pieF.appendChild(pv); }

  /* ---------- Botón «Filtrar por» junto a la búsqueda ---------- */
  (function () {
    var qi = document.getElementById("q"), fb = document.getElementById("filtros");
    if (!qi || !fb) return;
    var fila = el("div", "buscar"); qi.parentNode.insertBefore(fila, qi); fila.appendChild(qi);
    var btn = el("button", "chip filtrar", "Filtrar por ▾"); btn.type = "button";
    btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "panelfil");
    fila.appendChild(btn);
    var panel = el("div", "panelfil"); panel.id = "panelfil"; panel.hidden = true;
    fila.parentNode.insertBefore(panel, fila.nextSibling);
    panel.appendChild(fb);
    var ord = document.querySelector(".orden"); if (ord) panel.appendChild(ord);
    btn.addEventListener("click", function () {
      var ab = panel.hidden; panel.hidden = !ab;
      btn.setAttribute("aria-expanded", ab ? "true" : "false"); btn.textContent = ab ? "Filtrar por ▴" : "Filtrar por ▾";
    });
  })();

  /* ---------- Correo y redes ---------- */
  document.querySelectorAll(".mail").forEach(function (a) {
    a.textContent = S.email; a.href = "mailto:" + S.email;
  });
  var rep = document.getElementById("reporte");
  if (rep) { var er = S.emailPie || S.email; rep.href = "mailto:" + er + "?subject=" + encodeURIComponent("Reportar un error - Lux et Origo") + "&body=" + encodeURIComponent("Página donde ocurrió el error: " + location.href + "\n\nDescribe el error:\n"); }
  var pie = document.getElementById("mail"); // pie de página: correo del proyecto
  if (pie) { var ep = S.emailPie || S.email; pie.textContent = ep; pie.href = "mailto:" + ep; }
  var soc = document.getElementById("social");
  if (soc) {
    (S.redes || []).filter(function (r) { return r.url; }).forEach(function (r) {
      var li = document.createElement("li"), a = document.createElement("a");
      a.href = r.url; a.textContent = r.nombre; a.rel = "noopener"; a.target = "_blank";
      li.appendChild(a); soc.appendChild(li);
    });
  }

  /* ---------- Frases rotativas ---------- */
  var frase = document.getElementById("frase");
  if (frase) {
    var frases = [
      ["Kyrie, eleison", "Señor, ten piedad"],
      ["Gloria in excelsis Deo", "Gloria a Dios en el cielo"],
      ["Sanctus, Sanctus, Sanctus", "Santo, Santo, Santo"],
      ["Agnus Dei, qui tollis peccata mundi", "Cordero de Dios, que quitas el pecado del mundo"],
      ["Lux perpetua luceat eis", "Brille para ellos la luz perpetua"],
      ["Cantate Domino canticum novum", "Canten al Señor un cántico nuevo"]
    ], n = 0;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) setInterval(function () {
      frase.classList.add("fade");
      setTimeout(function () {
        n = (n + 1) % frases.length;
        frase.querySelector(".la").textContent = frases[n][0];
        frase.querySelector(".es").textContent = frases[n][1];
        frase.classList.remove("fade");
      }, 650);
    }, 4800);
  }

  /* ---------- Utilidades ---------- */
  function driveId(u) {
    if (!u) return "";
    var m = u.match(/\/d\/([\w-]+)/) || u.match(/[?&]id=([\w-]+)/);
    return m ? m[1] : "";
  }
  function driveVer(u) { var id = driveId(u); return id ? "https://drive.google.com/file/d/" + id + "/view" : u; }
  function drivePrev(u) { var id = driveId(u); return id ? "https://drive.google.com/file/d/" + id + "/preview" : ""; }
  function driveDesc(u) { var id = driveId(u); return id ? "https://drive.google.com/uc?export=download&id=" + id : u; }
  function ytId(u) {
    if (!u) return "";
    var m = u.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    return m ? m[1] : "";
  }

  var ND = "No disponible", ANON = "Anónimo";
  function norm(s) { return (s || "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  /* Un solo color para todo el sitio: el del tema litúrgico activo */
  function colorDe() { return "var(--acc)"; }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  /* Miniatura: primera página del PDF de Drive; si falla o no hay archivo, pentagrama decorativo con la inicial */
  function miniatura(url, titulo, cls) {
    var d = el("div", cls || "thumb"), id = driveId(url || "");
    var ini = el("span", "ini", (titulo || "?").charAt(0).toUpperCase()); ini.setAttribute("aria-hidden", "true");
    d.appendChild(ini);
    if (id) {
      var img = new Image(); img.alt = ""; img.loading = "lazy"; img.decoding = "async"; img.referrerPolicy = "no-referrer";
      img.onload = function () { d.classList.add("ok"); };
      img.onerror = function () { img.remove(); };
      img.src = "https://drive.google.com/thumbnail?id=" + id + "&sz=w480";
      d.appendChild(img);
    }
    return d;
  }
  /* Estado de carga: esqueletos mientras llegan los datos */
  function skeleton(cont, n, cls) {
    cont.textContent = "";
    for (var i = 0; i < n; i++) { var s = el("div", "sk " + cls); s.setAttribute("aria-hidden", "true"); cont.appendChild(s); }
  }
  function cargar(src) {
    return fetch(src, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function falloCarga(cont) {
    cont.textContent = "";
    var p = el("div", "empty");
    p.appendChild(el("p", "", "No se pudo cargar el contenido. Revisa tu conexión (o que las carpetas css, js y data estén junto a index.html)."));
    var b = el("button", "chip", "Reintentar"); b.type = "button"; b.addEventListener("click", function () { location.reload(); });
    p.appendChild(b); cont.appendChild(p);
  }
  function vacioMsg(txt) {
    var v = el("div", "vacio"); v.appendChild(el("span", "mk")); v.appendChild(el("strong", "", "Pronto, muy pronto"));
    v.appendChild(el("span", "", txt)); return v;
  }
  /* Botón de enlace; si no hay enlace queda desactivado con «No disponible» */
  function enlace(cont, cls, txtSi, txtNo, href) {
    if (href) { var a = el("a", cls, txtSi); a.href = href; a.target = "_blank"; a.rel = "noopener"; cont.appendChild(a); return a; }
    var s = el("span", "off", txtNo); cont.appendChild(s); return s;
  }

  /* Filtros: un grupo por campo. Lo vacío o «Anónimo» no se clasifica. Pocos valores = botones; muchos = lista. */
  function filtros(box, items, dims, cambio) {
    var est = {};
    box.textContent = "";
    dims.forEach(function (d) {
      var vals = d.fijos ? d.fijos.slice() : items.map(function (i) { return i[d.campo]; })
        .filter(function (v, i, a) { return v && norm(v) !== "anonimo" && a.indexOf(v) === i; });
      if (!vals.length) return;
      var num = vals.every(function (v) { return /^\d+$/.test(v); });
      if (!d.fijos) vals.sort(function (a, b) { return num ? a - b : a.localeCompare(b, "es"); });
      est[d.campo] = "*";
      var fila = el("div", "fil"); fila.appendChild(el("span", "lbl", d.label + ":"));
      var fmt = d.fmt || function (v) { return v; };
      if (vals.length <= 8) {
        ["*"].concat(vals).forEach(function (v) {
          var b = el("button", "chip", v === "*" ? "Cualquiera" : fmt(v)); b.type = "button"; b.setAttribute("aria-pressed", v === "*");
          b.addEventListener("click", function () {
            est[d.campo] = v; fila.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); cambio();
          });
          fila.appendChild(b);
        });
      } else {
        var s = el("select"); s.setAttribute("aria-label", d.label);
        ["*"].concat(vals).forEach(function (v) { var o = el("option", "", v === "*" ? "Cualquiera" : fmt(v)); o.value = v; s.appendChild(o); });
        s.addEventListener("change", function () { est[d.campo] = s.value; cambio(); });
        fila.appendChild(s);
      }
      box.appendChild(fila);
    });
    return est;
  }
  function pasa(it, est) {
    return Object.keys(est).every(function (k) { return est[k] === "*" || it[k] === est[k]; });
  }
  function ordena(list, dir) {
    return list.sort(function (a, b) { return a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" }) * dir; });
  }

  /* ---------- Menú principal ---------- */
  var grid = document.getElementById("grid");
  if (grid) {
    var q = document.getElementById("q"), fbox = document.getElementById("filtros"), count = document.getElementById("count"),
        azb = document.getElementById("azb"), zab = document.getElementById("zab");
    var items = [], est = {}, orden = "az";
    var DIMS = [{ campo: "autor", label: "Autor" }, { campo: "tipo", label: "Tipo", color: true },
                { campo: "parte", label: "Parte", color: true }, { campo: "tiempo", label: "Tiempo" }];

    var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.08 }) : null;

    var card = function (it, i) {
      var c = el("a", "card");
      c.href = "partitura.html?id=" + encodeURIComponent(it.id);
      c.style.setProperty("--pc", colorDe(it.parte || it.tipo));
      c.style.transitionDelay = Math.min(i, 8) * 60 + "ms";
      if (it.parte || it.tipo) c.appendChild(el("span", "tag", it.parte || it.tipo));
      c.appendChild(el("h3", "", it.titulo));
      c.appendChild(el("p", "who", [it.parte ? it.tipo : "", it.autor || ANON].filter(Boolean).join(" · ")));
      var b = el("div", "badges");
      [["drive_reducida", "Partitura"], ["drive_original", "Original"], ["youtube", "Audio"]].forEach(function (x) {
        b.appendChild(el("span", "badge" + (it[x[0]] ? "" : " no"), x[1]));
      });
      c.appendChild(b);
      c.appendChild(el("span", "go", "Abrir partitura →"));
      if (io) io.observe(c); else c.classList.add("in");
      return c;
    };

    var render = function () {
      var term = norm(q.value);
      var list = items.filter(function (it) {
        var hay = norm([it.titulo, it.tipo, it.autor || ANON, it.parte, it.tiempo, it.descripcion].join(" "));
        return pasa(it, est) && (!term || hay.indexOf(term) !== -1);
      });
      ordena(list, orden === "az" ? 1 : -1);
      grid.textContent = "";
      if (!items.length) {
        grid.appendChild(vacioMsg("Estamos preparando las primeras partituras. Vuelve en unos días."));
        count.textContent = ""; document.querySelector(".tools").hidden = true; return;
      }
      if (!list.length) grid.appendChild(el("p", "empty", "No hay partituras con ese criterio."));
      else list.forEach(function (it, i) { grid.appendChild(card(it, i)); });
      count.textContent = list.length + (list.length === 1 ? " partitura" : " partituras");
    };

    function setOrden(o) { orden = o; azb.setAttribute("aria-pressed", o === "az"); zab.setAttribute("aria-pressed", o === "za"); render(); }
    azb.addEventListener("click", function () { setOrden("az"); });
    zab.addEventListener("click", function () { setOrden("za"); });
    q.addEventListener("input", render);

    skeleton(grid, 3, "sk-card"); count.textContent = "Cargando partituras…";
    cargar("data/partituras.json").then(function (d) { items = d; est = filtros(fbox, items, DIMS, render); render(); })
      .catch(function () { falloCarga(grid); });
  }

  /* ---------- Recursos y Salmos (filas) ---------- */
  var lista = document.getElementById("lista");
  if (lista) {
    var modo = lista.dataset.tipo, datos = [], estL = {}, numsSel = null;
    var lq = document.getElementById("q"), lcount = document.getElementById("count"), lbox = document.getElementById("filtros");
    var DIMSL = modo === "recursos"
      ? [{ campo: "categoria", label: "Categoría", fijos: ["Cantorales", "Libros", "Documentos"] }, { campo: "autor", label: "Autor" }]
      : [{ campo: "autor", label: "Autor" }];

    /* «5, 6, 77» o rangos «20-25» -> conjunto de números; vacío o inválido = sin filtro */
    function parseNums(s) {
      var set = {}, hay = false;
      (s || "").split(/[\s,;]+/).forEach(function (tok) {
        if (!tok) return;
        var m = tok.match(/^(\d+)-(\d+)$/);
        if (m) { var a = +m[1], b = +m[2]; if (a > b) { var x = a; a = b; b = x; } if (b - a <= 200) { for (var n = a; n <= b; n++) set[n] = 1; hay = true; } }
        else if (/^\d+$/.test(tok)) { set[+tok] = 1; hay = true; }
      });
      return hay ? set : null;
    }

    var fila = function (it, i) {
      var c = el("a", "fila");
      c.href = (modo === "recursos" ? "recurso.html" : "salmo.html") + "?id=" + encodeURIComponent(it.id);
      c.style.setProperty("--pc", colorDe(modo === "recursos" ? it.categoria : "salmos"));
      c.style.transitionDelay = Math.min(i, 8) * 50 + "ms";
      c.appendChild(el("span", "tag", modo === "recursos" ? (it.categoria || "Recurso") : (it.numero ? "Salmo " + it.numero : "Salmo")));
      var mid = el("div", "mid"); mid.appendChild(el("h3", "", it.titulo));
      var extra = modo === "recursos" ? it.editorial : it.rito;
      mid.appendChild(el("p", "who", [it.autor || ANON, extra].filter(Boolean).join(" · ")));
      c.appendChild(mid);
      var b = el("div", "badges");
      (modo === "recursos" ? [["drive", "Archivo"], ["fuente", "Fuente"]] : [["drive", "Partitura"], ["youtube", "Audio"], ["fuente", "Fuente"]])
        .forEach(function (x) { b.appendChild(el("span", "badge" + (it[x[0]] ? "" : " no"), x[1])); });
      c.appendChild(b);
      c.appendChild(el("span", "go", "Abrir →"));
      setTimeout(function () { c.classList.add("in"); }, 30);
      return c;
    };

    var pintaLista = function () {
      var term = norm(lq.value);
      var res = datos.filter(function (it) {
        if (numsSel && !numsSel[parseInt(it.numero, 10)]) return false;
        return pasa(it, estL) && (!term || norm([it.titulo, it.autor || ANON, it.descripcion, it.categoria, it.rito, it.editorial, it.numero ? "salmo " + it.numero : ""].join(" ")).indexOf(term) !== -1);
      });
      if (modo === "salmos") res.sort(function (a, b) { return (parseInt(a.numero, 10) || 999) - (parseInt(b.numero, 10) || 999) || a.titulo.localeCompare(b.titulo, "es"); });
      else ordena(res, 1);
      lista.textContent = ""; lcount.textContent = "";
      if (!datos.length) {
        lista.appendChild(vacioMsg(modo === "recursos" ? "Estamos preparando los primeros recursos." : "Estamos preparando los primeros salmos."));
        document.querySelector(".tools").hidden = true; return;
      }
      if (!res.length) { lista.appendChild(el("p", "empty", "No hay resultados con ese criterio.")); return; }
      lcount.textContent = res.length + (res.length === 1 ? " elemento" : " elementos");
      res.forEach(function (it, i) { lista.appendChild(fila(it, i)); });
    };

    lq.addEventListener("input", pintaLista);
    skeleton(lista, 3, "sk-fila"); lcount.textContent = "Cargando…";
    cargar(lista.dataset.src).then(function (d) {
      datos = d;
      estL = filtros(lbox, datos, DIMSL, pintaLista);
      if (modo === "salmos") {
        var f = el("div", "fil"); f.appendChild(el("span", "lbl", "Salmo:"));
        var inp = el("input", "numsalmo"); inp.type = "text"; inp.inputMode = "numeric"; inp.autocomplete = "off";
        inp.placeholder = "Escribe números: 5, 6, 77 o 20-25"; inp.setAttribute("aria-label", "Números de salmo");
        inp.addEventListener("input", function () { numsSel = parseNums(inp.value); pintaLista(); });
        f.appendChild(inp); lbox.appendChild(f);
      }
      pintaLista();
    }).catch(function () { falloCarga(lista); });
  }

  /* ---------- Página de detalle (partitura, recurso o salmo) ---------- */
  var det = document.getElementById("det");
  if (det) {
    var tipoDet = det.dataset.tipo || "partituras";
    var CFG = {
      partituras: { src: "data/partituras.json", volver: ["← Todas las partituras", "index.html#partituras"] },
      recursos:   { src: "data/recursos.json",   volver: ["← Todos los recursos", "recursos.html"] },
      salmos:     { src: "data/salmos.json",     volver: ["← Todos los salmos", "salmos.html"] }
    }[tipoDet];
    var id = new URLSearchParams(location.search).get("id");
    cargar(CFG.src).then(function (d) {
      var it = d.filter(function (x) { return x.id === id; })[0];
      det.textContent = "";
      var volver = el("a", "volver", CFG.volver[0]); volver.href = CFG.volver[1];
      det.appendChild(volver);
      if (!it) { det.appendChild(el("p", "empty", "No encontré esta página.")); return; }

      document.title = it.titulo + " · Lux et Origo";
      var etiqueta, quien, extra = [], bt = [], opciones = [], yt = "";
      if (tipoDet === "partituras") {
        det.style.setProperty("--pc", colorDe(it.parte, it.tipo));
        etiqueta = it.parte || it.tipo;
        quien = [it.parte ? it.tipo : "", it.autor || ANON, it.tiempo ? "Tiempo: " + it.tiempo : ""].filter(Boolean).join(" · ");
        extra.push(["Condición: ", (it.condicion || "No hay dominio específico") + (it.autorizada_por ? " — autorizada por " + it.autorizada_por : "")]);
        bt = [["⬇ Descargar partitura", it.drive_reducida && driveDesc(it.drive_reducida), true, "Partitura: " + ND],
              ["⬇ Original (Drive)", it.drive_original && driveVer(it.drive_original), false, "Original: " + ND],
              ["▶ Escuchar en YouTube", it.youtube, false, "YouTube: " + ND],
              ["Fuente", it.fuente, false, "Fuente: " + ND]];
        if (it.drive_reducida) opciones.push(["Reducida", it.drive_reducida]);
        if (it.drive_original) opciones.push(["Original", it.drive_original]);
        yt = it.youtube;
      } else if (tipoDet === "recursos") {
        det.style.setProperty("--pc", colorDe(it.categoria));
        etiqueta = it.categoria || "Recurso";
        quien = it.autor || ANON;
        extra.push(["Editorial: ", it.editorial || ND]);
        bt = [["⬇ Descargar", it.drive && driveDesc(it.drive), true, "Archivo: " + ND],
              ["Fuente", it.fuente, false, "Fuente: " + ND]];
        if (it.drive) opciones.push(["Documento", it.drive]);
      } else {
        det.style.setProperty("--pc", colorDe("salmos"));
        etiqueta = it.numero ? "Salmo " + it.numero : "Salmo";
        quien = it.autor || ANON;
        extra.push(["Día o rito: ", it.rito || "No específico"]);
        bt = [["⬇ Descargar partitura", it.drive && driveDesc(it.drive), true, "Partitura: " + ND],
              ["▶ Escuchar en YouTube", it.youtube, false, "YouTube: " + ND],
              ["Fuente", it.fuente, false, "Fuente: " + ND]];
        if (it.drive) opciones.push(["Partitura", it.drive]);
        yt = it.youtube;
      }
      if (etiqueta) det.appendChild(el("span", "tag", etiqueta));
      det.appendChild(el("h1", "", it.titulo));
      det.appendChild(el("p", "who", quien));
      det.appendChild(el("p", "nota", it.descripcion || "Aún no hay descripción."));
      extra.forEach(function (x) {
        var p = el("p", "cond"); p.appendChild(el("strong", "", x[0])); p.appendChild(document.createTextNode(x[1])); det.appendChild(p);
      });

      var bots = el("div", "botones");
      bt.forEach(function (b) {
        var a;
        if (b[1]) { a = el("a", "bt" + (b[2] ? " p" : ""), b[0]); a.href = b[1]; a.target = "_blank"; a.rel = "noopener"; }
        else a = el("span", "bt no", b[3]);
        bots.appendChild(a);
      });
      det.appendChild(bots);

      /* Vista previa */
      det.appendChild(el("h2", "", "Vista"));
      var tabs = el("div", "vtabs"), vista = el("div");
      function pinta(o) {
        vista.textContent = "";
        var src = drivePrev(o[1]);
        if (!src) { vista.appendChild(el("div", "pendiente", "No se pudo previsualizar este enlace. Usa el botón de descarga.")); return; }
        var f = el("iframe", "marco"); f.src = src; f.title = o[0] + " — " + it.titulo; f.setAttribute("allow", "autoplay"); f.loading = "lazy";
        vista.appendChild(f);
        var p = el("p", "muted small", "Si no se ve, abre el archivo directamente en Drive: ");
        var l = el("a", "", "abrir"); l.href = driveVer(o[1]); l.target = "_blank"; l.rel = "noopener"; p.appendChild(l);
        vista.appendChild(p);
      }
      if (!opciones.length) vista.appendChild(el("div", "pendiente", "Vista: " + ND + ". Aún no hay archivo."));
      else {
        if (opciones.length > 1) {
          opciones.forEach(function (o, i) {
            var b = el("button", "", o[0]); b.type = "button"; b.setAttribute("aria-pressed", i === 0);
            b.addEventListener("click", function () {
              tabs.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
              pinta(o);
            });
            tabs.appendChild(b);
          });
          det.appendChild(tabs);
        }
        pinta(opciones[0]);
      }
      det.appendChild(vista);

      /* Audio */
      var yid = ytId(yt);
      if (yid) {
        det.appendChild(el("h2", "", "Escúchala"));
        var w = el("div", "yt"), fr = el("iframe");
        fr.src = "https://www.youtube-nocookie.com/embed/" + yid; fr.title = "Audio de " + it.titulo; fr.loading = "lazy";
        fr.setAttribute("allow", "accelerometer; encrypted-media; picture-in-picture"); fr.setAttribute("allowfullscreen", "");
        w.appendChild(fr); det.appendChild(w);
      }
    }).catch(function () { falloCarga(det); });
  }

  /* ---------- Contadores de la portada ---------- */
  var tilesBox = document.querySelector(".tiles");
  if (tilesBox) {
    [["partituras", "partitura"], ["recursos", "recurso"], ["salmos", "salmo"]].forEach(function (x) {
      var n = tilesBox.querySelector('[data-n="' + x[0] + '"]');
      cargar("data/" + x[0] + ".json").then(function (d) {
        n.textContent = d.length ? d.length + " " + (d.length === 1 ? x[1] : x[0]) : "Muy pronto";
      }).catch(function () { n.textContent = ""; });
    });
  }
})();
