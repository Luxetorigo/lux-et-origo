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

  /* ---------- Correo y redes ---------- */
  document.querySelectorAll(".mail").forEach(function (a) {
    a.textContent = S.email; a.href = "mailto:" + S.email;
  });
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

  /* ---------- Utilidades de enlaces ---------- */
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

  var COLORES = {
    "kyrie": "#8b5cc9", "gloria": "#d9a93a", "credo": "#3f86d6", "sanctus": "#d2483f", "agnus dei": "#3fa37a",
    "comunion": "#d65a8a", "entrada": "#2fa5a5", "ofertorio": "#cf7a35", "salmo": "#7a6fd6", "gradual": "#7a6fd6",
    "aleluya": "#e0b23a", "cantorales": "#8b5cc9", "libros": "#cf7a35", "documentos": "#3f86d6", "salmos": "#2fa5a5", "final": "#7a9a3a", "aclamacion": "#e0b23a", "padre nuestro": "#4a8fc0"
  };
  function norm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function colorDe(p) {
    var k = norm(p);
    if (COLORES[k]) return COLORES[k];
    var h = 0; for (var i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) % 360;
    return "hsl(" + h + ",55%,52%)";
  }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function cargar() {
    return fetch("data/partituras.json").then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function falloCarga(cont) {
    cont.textContent = "";
    cont.appendChild(el("p", "empty", "No se pudo cargar el catálogo. Revisa que las carpetas css, js y data estén subidas junto a index.html."));
  }

  /* ---------- Menú principal ---------- */
  var grid = document.getElementById("grid");
  if (grid) {
    var q = document.getElementById("q"), autoresBox = document.getElementById("autores"), count = document.getElementById("count"),
        azb = document.getElementById("azb"), zab = document.getElementById("zab");
    var items = [], autor = "Todos", orden = "az";

    var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.08 }) : null;

    var card = function (it, i) {
      var c = el("a", "card");
      c.href = "partitura.html?id=" + encodeURIComponent(it.id);
      c.style.setProperty("--pc", colorDe(it.parte));
      c.style.transitionDelay = Math.min(i, 8) * 60 + "ms";
      var ini = el("span", "ini", (it.titulo || "?").charAt(0).toUpperCase()); ini.setAttribute("aria-hidden", "true");
      c.append(ini, el("span", "tag", it.parte || "Pieza"), el("h3", "", it.titulo),
               el("p", "who", [it.obra, it.compositor].filter(Boolean).join(" · ")));
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
        var okA = autor === "Todos" || it.compositor === autor;
        var hay = norm([it.titulo, it.obra, it.compositor, it.parte].join(" "));
        return okA && (!term || hay.indexOf(term) !== -1);
      });
      list.sort(function (a, b) { return a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" }) * (orden === "az" ? 1 : -1); });
      grid.textContent = "";
      if (!items.length) {
        var v = el("div", "vacio"); v.appendChild(el("span", "mk")); v.appendChild(el("strong", "", "Pronto, muy pronto"));
        v.appendChild(el("span", "", "Estamos preparando las primeras partituras. Vuelve en unos días."));
        grid.appendChild(v); count.textContent = "";
        document.querySelector(".tools").hidden = true;
        return;
      }
      if (!list.length) grid.appendChild(el("p", "empty", "No hay partituras con ese criterio."));
      else list.forEach(function (it, i) { grid.appendChild(card(it, i)); });
      count.textContent = list.length + (list.length === 1 ? " partitura" : " partituras");
    };

    var chipsAutores = function () {
      var autores = ["Todos"].concat(items.map(function (i) { return i.compositor; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }).sort(function (a, b) { return a.localeCompare(b, "es"); }));
      autores.forEach(function (a) {
        var b = el("button", "chip", a); b.type = "button"; b.setAttribute("aria-pressed", a === autor);
        b.addEventListener("click", function () {
          autor = a;
          autoresBox.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
          render();
        });
        autoresBox.appendChild(b);
      });
    };

    function setOrden(o) {
      orden = o; azb.setAttribute("aria-pressed", o === "az"); zab.setAttribute("aria-pressed", o === "za"); render();
    }
    azb.addEventListener("click", function () { setOrden("az"); });
    zab.addEventListener("click", function () { setOrden("za"); });
    q.addEventListener("input", render);

    cargar().then(function (d) { items = d; chipsAutores(); render(); }).catch(function () { falloCarga(grid); });
  }

  /* ---------- Recursos y Salmos (lista genérica) ---------- */
  var lista = document.getElementById("lista");
  if (lista) {
    var cats = (lista.dataset.cats || "").split("|").filter(Boolean), cat = "Todos", datos = [];
    var lq = document.getElementById("q"), lcount = document.getElementById("count"), catsBox = document.getElementById("cats");
    var pintaLista = function () {
      var term = norm(lq.value);
      var res = datos.filter(function (it) {
        return (cat === "Todos" || it.categoria === cat) && (!term || norm([it.titulo, it.autor, it.descripcion, it.categoria, it.tiempo, it.referencia].join(" ")).indexOf(term) !== -1);
      });
      res.sort(function (a, b) { return a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" }); });
      lista.textContent = ""; lcount.textContent = "";
      if (!datos.length) {
        var v = el("div", "vacio"); v.appendChild(el("span", "mk")); v.appendChild(el("strong", "", "Pronto, muy pronto"));
        v.appendChild(el("span", "", lista.dataset.vacio || "Estamos preparando este apartado."));
        lista.appendChild(v); return;
      }
      if (!res.length) { lista.appendChild(el("p", "empty", cat !== "Todos" && !term ? "Aún no hay nada en " + cat + ". Pronto, muy pronto." : "No hay resultados con ese criterio.")); return; }
      lcount.textContent = res.length + (res.length === 1 ? " elemento" : " elementos");
      res.forEach(function (it, i) {
        var c = el("article", "card");
        c.style.setProperty("--pc", colorDe(it.categoria || "salmos"));
        c.style.transitionDelay = Math.min(i, 8) * 60 + "ms";
        c.append(el("span", "tag", it.categoria || it.tiempo || "Salmo"), el("h3", "", it.titulo));
        var who = [it.referencia, it.autor, it.categoria ? it.tiempo : ""].filter(Boolean).join(" · ");
        if (who) c.appendChild(el("p", "who", who));
        if (it.descripcion) c.appendChild(el("p", "nota", it.descripcion));
        var act = el("div", "actions");
        function a(txt, href, cls) { var x = el("a", cls || "", txt); x.href = href; x.target = "_blank"; x.rel = "noopener"; act.appendChild(x); }
        if (it.drive) { a("Ver", driveVer(it.drive), "ver"); a("Descargar", driveDesc(it.drive)); }
        if (it.youtube) a("▶ Escuchar", it.youtube);
        if (!it.drive && !it.youtube) act.appendChild(el("span", "off", "Próximamente"));
        c.appendChild(act); lista.appendChild(c);
        setTimeout(function () { c.classList.add("in"); }, 30);
      });
    };
    if (catsBox && cats.length) {
      ["Todos"].concat(cats).forEach(function (n) {
        var b = el("button", "chip", n); b.type = "button"; b.setAttribute("aria-pressed", n === cat);
        if (n !== "Todos") b.style.setProperty("--c", colorDe(n));
        b.addEventListener("click", function () {
          cat = n; catsBox.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); pintaLista();
        });
        catsBox.appendChild(b);
      });
    }
    lq.addEventListener("input", pintaLista);
    fetch(lista.dataset.src).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { datos = d; if (!d.length) document.querySelector(".tools").hidden = true; pintaLista(); })
      .catch(function () { falloCarga(lista); });
  }

  /* ---------- Página de una partitura ---------- */
  var det = document.getElementById("det");
  if (det) {
    var id = new URLSearchParams(location.search).get("id");
    cargar().then(function (d) {
      var it = d.filter(function (x) { return x.id === id; })[0];
      det.textContent = "";
      var volver = el("a", "volver", "← Todas las partituras"); volver.href = "index.html#partituras";
      det.appendChild(volver);
      if (!it) { det.appendChild(el("p", "empty", "No encontré esa partitura.")); return; }

      document.title = it.titulo + " · Lux et Origo";
      det.style.setProperty("--pc", colorDe(it.parte));
      det.appendChild(el("span", "tag", it.parte || "Pieza"));
      det.appendChild(el("h1", "", it.titulo));
      det.appendChild(el("p", "who", [it.obra, it.compositor].filter(Boolean).join(" · ")));
      if (it.notas) det.appendChild(el("p", "nota", it.notas));

      var bots = el("div", "botones");
      function boton(txt, href, primario) {
        var a = el("a", "bt" + (primario ? " p" : ""), txt);
        if (href) { a.href = href; a.target = "_blank"; a.rel = "noopener"; } else { a.className = "bt no"; a.setAttribute("aria-disabled", "true"); }
        return a;
      }
      bots.appendChild(it.drive_reducida ? boton("⬇ Descargar partitura", driveDesc(it.drive_reducida), true) : boton("Partitura: próximamente"));
      if (it.drive_original) bots.appendChild(boton("⬇ Original (Drive)", driveVer(it.drive_original)));
      if (ytId(it.youtube) || it.youtube) bots.appendChild(boton("▶ Escuchar en YouTube", it.youtube));
      det.appendChild(bots);

      /* Vista de la partitura */
      det.appendChild(el("h2", "", "Vista"));
      var tabs = el("div", "vtabs"), vista = el("div");
      var opciones = [];
      if (it.drive_reducida) opciones.push(["Reducida", it.drive_reducida]);
      if (it.drive_original) opciones.push(["Original", it.drive_original]);
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
      if (!opciones.length) vista.appendChild(el("div", "pendiente", "Esta partitura estará disponible próximamente."));
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
      var yid = ytId(it.youtube);
      if (yid) {
        det.appendChild(el("h2", "", "Escúchala"));
        var w = el("div", "yt"), fr = el("iframe");
        fr.src = "https://www.youtube-nocookie.com/embed/" + yid; fr.title = "Audio de " + it.titulo; fr.loading = "lazy";
        fr.setAttribute("allow", "accelerometer; encrypted-media; picture-in-picture"); fr.setAttribute("allowfullscreen", "");
        w.appendChild(fr); det.appendChild(w);
      }
    }).catch(function () { falloCarga(det); });
  }
})();
