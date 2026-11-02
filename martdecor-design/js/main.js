/* МАРТдекор — общая логика: шапка, подвал, подборка, каталог, карточка товара, статья. */
(function () {
  var D = window.MD || { cats: [], items: [] }, C = window.MDC, T = window.typo || function (s) { return s; };
  var page = document.body.dataset.page;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var t = function (s) { return esc(T(s)); };
  var money = function (n) { return n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽"; };
  var byId = function (id) { return D.items.filter(function (x) { return x.id === id; })[0]; };
  var catName = function (c) { var x = D.cats.filter(function (k) { return k[0] === c; })[0]; return x ? x[1] : ""; };
  var img = function (it, k) { return it.n ? "img/p/" + it.id + "-" + (k || 0) + ".jpg" : "img/no-photo.svg"; };
  var dims = function (it) { return it.dm && it.dm.length ? it.dm.filter(Boolean).join(" × ") + " мм" : ""; };
  var I = function (n) { return '<i class="ti ti-' + n + '" aria-hidden="true"></i>'; };

  /* ---------- Шапка и подвал ---------- */
  var nav = [["catalog.html", "Каталог", "catalog"], ["designers.html", "Дизайнерам", "designers"], ["index.html#salon", "О салоне", ""], ["index.html#journal", "Журнал", "article"], ["#contacts", "Контакты", ""]];
  var logo = '<a class="logo" href="index.html" aria-label="МАРТдекор — на главную"><img src="img/logo-mark.png" alt="" width="62" height="42"><span><b>МАРТдекор</b><small>Интерьерный салон</small></span></a>';
  var hdr = $("#hdr");
  if (hdr) {
    hdr.className = "hdr";
    hdr.innerHTML = '<div class="wrap">' + logo +
      '<nav class="nav" aria-label="Основное меню">' + nav.map(function (n) { return '<a href="' + n[0] + '"' + (n[2] && n[2] === page ? ' class="on"' : "") + ">" + n[1] + "</a>"; }).join("") + "</nav>" +
      '<div class="hdr__r"><a class="tel" href="' + C.phoneHref + '">' + I("phone") + "<span>" + C.phone + "</span></a>" +
      '<button class="pickbtn" data-open-pick aria-label="Моя подборка">' + I("bookmark") + "<em></em></button>" +
      '<a class="btn btn--wine btn--sm hide-m" href="#" data-open-pick>Подобрать материалы ' + I("arrow-right") + "</a>" +
      '<button class="burger" aria-label="Меню" data-menu>' + I("menu-2") + "</button></div></div>";
    document.body.insertAdjacentHTML("beforeend",
      '<div class="mnav" id="mnav"><div class="mnav__top">' + logo + '<button class="burger" style="display:grid" aria-label="Закрыть меню" data-menu>' + I("x") + "</button></div>" +
      nav.map(function (n) { return '<a class="m" href="' + n[0] + '">' + n[1] + "</a>"; }).join("") +
      '<a class="btn btn--wine" href="#" data-open-pick>Подобрать материалы ' + I("arrow-right") + '</a><a class="tel" href="' + C.phoneHref + '">' + I("phone") + C.phone + "</a></div>");
    window.addEventListener("scroll", function () { hdr.classList.toggle("scrolled", scrollY > 8); }, { passive: true });
  }
  var ftr = $("#ftr");
  if (ftr) {
    ftr.className = "ftr"; ftr.id = "contacts";
    ftr.innerHTML = '<div class="wrap"><div class="ftr__g">' +
      "<div>" + logo + '<p class="ftr__moto">' + t("Ваше вдохновение от процесса") + "</p></div>" +
      '<div><h4>Разделы</h4><ul><li><a href="catalog.html">Каталог</a></li><li><a href="designers.html">Дизайнерам</a></li><li><a href="index.html#salon">О салоне</a></li><li><a href="index.html#journal">Журнал</a></li><li><a href="index.html#contacts-block">Контакты</a></li></ul></div>' +
      '<div class="ftr__c"><h4>Контакты</h4><ul>' +
      "<li>" + I("phone") + '<span><a href="' + C.phoneHref + '">' + C.phone + '</a><br><a href="' + C.phone2Href + '">' + C.phone2 + "</a></span></li>" +
      "<li>" + I("mail") + '<a href="mailto:' + C.email + '">' + C.email + "</a></li>" +
      "<li>" + I("map-pin") + "<span>" + t(C.address) + "</span></li>" +
      "<li>" + I("clock") + "<span>пн–пт 10:00–19:00<br>сб–вс 10:00–17:00</span></li></ul></div>" +
      "<div><h4>Подписывайтесь</h4><p>" + t("Новинки, семинары и ланчи для дизайнеров — в наших соцсетях.") + "</p>" +
      '<div class="soc"><a href="' + C.vk + '" target="_blank" rel="noopener" aria-label="ВКонтакте">' + I("brand-vk") + '</a><a href="' + C.tg + '" target="_blank" rel="noopener" aria-label="Telegram">' + I("brand-telegram") + '</a><a href="' + C.ig + '" target="_blank" rel="noopener" aria-label="Instagram">' + I("brand-instagram") + "</a></div></div>" +
      '</div><div class="ftr__b"><span>© МАРТдекор, интерьерный салон. Ростов-на-Дону</span><span>Цены и наличие уточняйте у менеджера. Оплата на сайте не производится.</span></div></div>';
  }

  /* ---------- Подборка (вместо корзины: без оплаты, только запрос на расчёт) ---------- */
  var pick = [];
  try { pick = JSON.parse(localStorage.getItem("md-pick2") || "[]").filter(byId); } catch (e) { pick = []; }
  function save() { try { localStorage.setItem("md-pick2", JSON.stringify(pick)); } catch (e) {} }
  document.body.insertAdjacentHTML("beforeend",
    '<div class="shade" data-close></div><aside class="drawer" aria-label="Моя подборка"><div class="drawer__h"><h3 class="h4">Моя подборка</h3><button class="round round--line" data-close aria-label="Закрыть">' + I("x") + "</button></div>" +
    '<div class="drawer__b"><div class="drawer__steps"><span class="on">1. Подборка</span><span>2. Расчёт</span><span>3. Счёт</span><span>4. Доставка</span></div>' +
    '<div class="dl" id="dl"></div>' +
    '<form class="form" id="pickform"><b class="h4">Отправить на расчёт</b><p class="small muted">' + t("Менеджер проверит наличие, рассчитает количество и пришлёт предложение. Оплаты на сайте нет.") + "</p>" +
    '<input class="field" name="name" placeholder="Ваше имя" autocomplete="name" required><input class="field" name="phone" type="tel" placeholder="+7 (___) ___-__-__" autocomplete="tel" required>' +
    '<textarea class="field" name="msg" placeholder="Расскажите о задаче: комната, площадь стен, сроки"></textarea>' +
    '<button class="btn btn--wine btn--block">Отправить заявку ' + I("arrow-right") + "</button><small>" + t("Нажимая кнопку, вы соглашаетесь на обработку персональных данных.") + "</small></form></div></aside>" +
    '<div class="toast" id="toast" role="status"></div>');
  function drawPick() {
    $$(".pickbtn em").forEach(function (e) { e.textContent = pick.length || ""; });
    $("#dl").innerHTML = pick.length ? pick.map(function (id) {
      var it = byId(id);
      return '<div class="dl__i"><img src="' + img(it) + '" alt=""><div><b>' + t(it.t) + "</b><small>" + (it.p ? money(it.p) : "цена по запросу") + '</small></div><button data-del="' + id + '" aria-label="Убрать">' + I("trash") + "</button></div>";
    }).join("") : '<div class="dl__empty">' + t("Подборка пока пуста. Добавляйте материалы из каталога кнопкой «В подборку» — или просто опишите задачу, и менеджер подберёт сам.") + "</div>";
    $$("[data-add]").forEach(function (b) {
      var on = pick.indexOf(b.dataset.add) >= 0; b.classList.toggle("on", on);
      if (b.dataset.lbl !== "no") b.innerHTML = on ? "В подборке " + I("check") : "В подборку " + I("plus");
    });
    $$("[data-fav]").forEach(function (b) { var on = pick.indexOf(b.dataset.fav) >= 0; b.classList.toggle("on", on); b.innerHTML = I(on ? "heart-filled" : "heart"); });
  }
  function toast(s) { var el = $("#toast"); el.textContent = s; el.classList.add("show"); clearTimeout(toast.h); toast.h = setTimeout(function () { el.classList.remove("show"); }, 2200); }
  function drawer(open) { $(".drawer").classList.toggle("open", open); $(".shade").classList.toggle("open", open); }
  function toggle(id) {
    var k = pick.indexOf(id);
    if (k >= 0) { pick.splice(k, 1); toast("Убрали из подборки"); } else { pick.push(id); toast("Добавили в подборку"); }
    save(); drawPick();
  }
  document.addEventListener("click", function (e) {
    var a;
    if ((a = e.target.closest("[data-add]")) || (a = e.target.closest("[data-fav]"))) { e.preventDefault(); toggle(a.dataset.add || a.dataset.fav); return; }
    if ((a = e.target.closest("[data-del]"))) { pick.splice(pick.indexOf(a.dataset.del), 1); save(); drawPick(); return; }
    if (e.target.closest("[data-open-pick]")) { e.preventDefault(); $("#mnav") && $("#mnav").classList.remove("open"); drawer(true); return; }
    if (e.target.closest("[data-close]")) { drawer(false); var f = $(".filters"); f && f.classList.remove("open"); return; }
    if (e.target.closest("[data-menu]")) { $("#mnav").classList.toggle("open"); return; }
    if (e.target.closest(".mnav a.m")) { $("#mnav").classList.remove("open"); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { drawer(false); $("#mnav") && $("#mnav").classList.remove("open"); } });
  // Формы — демо: в рабочем сайте заявка уйдёт менеджеру
  document.addEventListener("submit", function (e) {
    var f = e.target; e.preventDefault();
    if (f.classList.contains("sub")) { f.innerHTML = '<span style="padding:12px 16px">Спасибо!</span>'; return; }
    var list = f.id === "pickform" && pick.length ? " В заявке " + pick.length + " поз." : "";
    f.innerHTML = '<div class="ok"><b class="h4">Спасибо! Заявка принята.</b><p class="small">' + t("Менеджер перезвонит в рабочее время салона и уточнит детали." + list) + '</p><p class="small muted">Демо-версия: заявка никуда не отправляется.</p></div>';
  });

  /* ---------- Карточка товара в списке ---------- */
  function card(it) {
    var lb = it.lb && it.lb.length ? '<span class="pc__badge">' + it.lb.map(function (l) { return '<span class="pill ' + (l === "Хит" ? "pill--wine" : "pill--w") + '">' + l + "</span>"; }).join(" ") + "</span>" : "";
    return '<article class="pc rv"><div class="pc__img"><img src="' + img(it) + '" alt="' + esc(it.t) + '" loading="lazy">' + lb + "</div>" +
      '<button class="pc__fav" data-fav="' + it.id + '" aria-label="В подборку">' + I("heart") + "</button>" +
      '<div class="pc__body">' + (it.br ? '<span><span class="pill">' + esc(it.br) + "</span></span>" : "") +
      '<h3><a href="item.html?id=' + it.id + '">' + t(it.t) + "</a></h3>" +
      '<div class="pc__meta">' + esc(catName(it.c)) + (dims(it) ? " · " + dims(it) : "") + "</div>" +
      '<div class="pc__price">' + (it.p ? money(it.p) : '<small>Цена по запросу</small>') + "</div>" +
      '<button class="addb" data-add="' + it.id + '">В подборку ' + I("plus") + "</button></div></article>";
  }

  /* ---------- Главная ---------- */
  if (page === "home") {
    $("#cats").innerHTML = C.homeCats.map(function (c) {
      return '<a class="cat rv" href="catalog.html' + (c[2] ? "?c=" + c[2] : "") + '"><img src="' + c[1] + '" alt="" loading="lazy"><b>' + t(c[0]) + '</b><span class="round">' + I("arrow-right") + "</span></a>";
    }).join("") + '<a class="cat cat--more rv" href="catalog.html">' + I("circle-plus") + '<b>Ещё<br>категории</b><span class="round round--plus">' + I("plus") + "</span></a>";
    var news = D.items.filter(function (x) { return x.lb.indexOf("Новинка") >= 0 && x.n; });
    var fresh = D.items.filter(function (x) { return x.c === "poliuretan" && x.n && news.indexOf(x) < 0; });
    $("#rail").innerHTML = news.slice(0, 6).concat(fresh.slice(0, 6)).map(card).join("");
    $$("[data-rail]").forEach(function (b) { b.addEventListener("click", function () { var r = $("#rail"); r.scrollBy({ left: (b.dataset.rail === "next" ? 1 : -1) * r.clientWidth * 0.75, behavior: "smooth" }); }); });
    function revs(w) { $("#revs").innerHTML = C.reviews.filter(function (r) { return r.who === w; }).map(function (r) { return '<blockquote class="rev rv in">' + I("quote") + "<q>" + t(r.text) + '</q><footer><span class="ava">' + r.name.charAt(0) + "</span><span><b>" + esc(r.name) + "</b><small>" + esc(r.role) + "</small></span></footer></blockquote>"; }).join(""); }
    revs("d");
    $$("[data-rev]").forEach(function (b) { b.addEventListener("click", function () { $$("[data-rev]").forEach(function (x) { x.classList.toggle("on", x === b); }); revs(b.dataset.rev); }); });
    $("#arts").innerHTML = C.articles.map(artCard).join("");
  }
  function artCard(a) {
    var words = (a.lead + " " + a.parts.map(function (p) { return (p.p || p.list || []).join(" "); }).join(" ")).split(/\s+/).length;
    return '<a class="art rv" href="article.html?id=' + a.id + '"><div class="art__img"><img src="' + a.cover + '" alt="" loading="lazy"></div><div class="art__b"><span><span class="pill">' + a.tag + "</span></span><h3>" + t(a.title) + "</h3><small>" + a.date + " · " + Math.max(1, Math.round(words / 160)) + " мин чтения</small></div></a>";
  }

  /* ---------- Каталог ---------- */
  if (page === "catalog") {
    var qs = new URLSearchParams(location.search);
    var st = { cats: qs.get("c") ? [qs.get("c")] : [], brands: [], min: "", max: "", q: "", sort: "pop", shown: 24 };
    var brands = {}; D.items.forEach(function (x) { if (x.br) brands[x.br] = (brands[x.br] || 0) + 1; });
    var cnt = function (c) { return D.items.filter(function (x) { return x.c === c; }).length; };
    $("#chips").innerHTML = '<button class="chip" data-chip="">Все материалы <em>' + D.items.length + "</em></button>" + D.cats.map(function (c) { return '<button class="chip" data-chip="' + c[0] + '">' + t(c[1]) + " <em>" + cnt(c[0]) + "</em></button>"; }).join("");
    $("#f-cat").innerHTML = D.cats.map(function (c) { return '<label class="cb"><input type="checkbox" value="' + c[0] + '" data-fc>' + t(c[1]) + "<em>" + cnt(c[0]) + "</em></label>"; }).join("");
    $("#f-br").innerHTML = Object.keys(brands).sort().map(function (b) { return '<label class="cb"><input type="checkbox" value="' + esc(b) + '" data-fb>' + esc(b) + "<em>" + brands[b] + "</em></label>"; }).join("");
    function list() {
      var l = D.items.filter(function (x) {
        if (st.cats.length && st.cats.indexOf(x.c) < 0) return false;
        if (st.brands.length && st.brands.indexOf(x.br) < 0) return false;
        if (st.min && (!x.p || x.p < +st.min)) return false;
        if (st.max && (!x.p || x.p > +st.max)) return false;
        if (st.q && (x.t + " " + x.br + " " + x.sku).toLowerCase().indexOf(st.q) < 0) return false;
        return true;
      });
      if (st.sort === "asc") l.sort(function (a, b) { return (a.p || 1e9) - (b.p || 1e9); });
      if (st.sort === "desc") l.sort(function (a, b) { return b.p - a.p; });
      return l;
    }
    function draw() {
      var l = list();
      $("#found").innerHTML = "Найдено: <b>" + l.length + "</b> " + plural(l.length, ["товар", "товара", "товаров"]);
      $("#grid").innerHTML = l.length ? l.slice(0, st.shown).map(card).join("") : '<div class="empty">' + t("Ничего не нашлось. Сбросьте фильтры или напишите менеджеру — подберём под задачу.") + "</div>";
      $("#more").style.display = l.length > st.shown ? "" : "none";
      $("#more").textContent = "Показать ещё " + Math.min(24, l.length - st.shown);
      $$("[data-chip]").forEach(function (b) { b.classList.toggle("on", b.dataset.chip ? st.cats.length === 1 && st.cats[0] === b.dataset.chip : !st.cats.length); });
      $$("[data-fc]").forEach(function (b) { b.checked = st.cats.indexOf(b.value) >= 0; });
      $("#ptitle").textContent = st.cats.length === 1 ? catName(st.cats[0]) : "Каталог материалов";
      drawPick(); reveal();
    }
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-chip]");
      if (b) { st.cats = b.dataset.chip ? [b.dataset.chip] : []; st.shown = 24; draw(); }
      if (e.target.closest("#more")) { st.shown += 24; draw(); }
      if (e.target.closest("[data-filters]")) $(".filters").classList.add("open");
      if (e.target.closest("[data-reset]")) { st = { cats: [], brands: [], min: "", max: "", q: "", sort: st.sort, shown: 24 }; $$(".filters input").forEach(function (i) { i.type === "checkbox" ? (i.checked = false) : (i.value = ""); }); draw(); }
    });
    $(".filters").addEventListener("change", function () {
      st.cats = $$("[data-fc]").filter(function (i) { return i.checked; }).map(function (i) { return i.value; });
      st.brands = $$("[data-fb]").filter(function (i) { return i.checked; }).map(function (i) { return i.value; });
      st.shown = 24; draw();
    });
    $(".filters").addEventListener("input", function (e) {
      if (e.target.id === "pmin") st.min = e.target.value; if (e.target.id === "pmax") st.max = e.target.value; if (e.target.id === "q") st.q = e.target.value.trim().toLowerCase();
      st.shown = 24; draw();
    });
    $("#sort").addEventListener("change", function (e) { st.sort = e.target.value; draw(); });
    draw();
  }
  function plural(n, f) { var a = n % 100, b = n % 10; return a > 10 && a < 20 ? f[2] : b === 1 ? f[0] : b > 1 && b < 5 ? f[1] : f[2]; }

  /* ---------- Карточка товара ---------- */
  if (page === "item") {
    var it = byId(new URLSearchParams(location.search).get("id")) || D.items[0];
    document.title = it.t + " — МАРТдекор";
    $("#crumbs").innerHTML = '<a href="index.html">Главная</a><span><a href="catalog.html">Каталог</a></span><span><a href="catalog.html?c=' + it.c + '">' + t(catName(it.c)) + "</a></span><span>" + t(it.t) + "</span>";
    var k = 0, n = Math.max(1, it.n);
    function show(i) { k = (i + n) % n; $("#gmain").src = img(it, k); $$(".gal__th button").forEach(function (b, j) { b.classList.toggle("on", j === k); }); }
    var specs = [];
    if (it.sku) specs.push(["Артикул", it.sku]);
    if (it.br) specs.push(["Бренд", it.br]);
    specs.push(["Категория", catName(it.c)]);
    if (dims(it)) specs.push(["Размеры (Ш × В × Г)", dims(it)]);
    // пары «Ключ: значение» из описания ВК
    it.d.split("\n").forEach(function (l) { var m = l.match(/^([А-ЯЁA-Z][^:]{2,40}):\s*(.{1,80})$/); if (m && !/цена/i.test(m[1]) && !specs.some(function (s) { return s[0] === m[1].trim(); })) specs.push([m[1].trim(), m[2].trim()]); });
    $("#item").innerHTML =
      '<div class="gal"><div class="gal__th">' + Array.apply(null, Array(n)).map(function (_, i) { return '<button data-g="' + i + '" aria-label="Фото ' + (i + 1) + '"><img src="' + img(it, i) + '" alt=""></button>'; }).join("") + "</div>" +
      '<div class="gal__main"><img id="gmain" src="' + img(it) + '" alt="' + esc(it.t) + '">' + (n > 1 ? '<div class="gal__nav"><button data-gp aria-label="Назад">' + I("arrow-left") + '</button><button data-gn aria-label="Вперёд">' + I("arrow-right") + "</button></div>" : "") + "</div></div>" +
      '<div class="info"><div class="info__top"><span>' + (it.br ? '<span class="pill">' + esc(it.br) + "</span> " : "") + it.lb.map(function (l) { return '<span class="pill pill--wine">' + l + "</span>"; }).join(" ") + '</span><button class="pc__fav" style="position:static" data-fav="' + it.id + '" aria-label="В подборку">' + I("heart") + "</button></div>" +
      '<h1 class="h3">' + t(it.t) + "</h1>" +
      '<dl class="params">' + specs.slice(0, 5).map(function (s) { return "<div><dt>" + t(s[0]) + "</dt><dd>" + t(s[1]) + "</dd></div>"; }).join("") + "</dl>" +
      '<div class="info__price">' + (it.p ? money(it.p) : '<small style="font-size:20px">Цена по запросу</small>') + "</div>" +
      '<div class="info__btns"><button class="btn btn--wine" data-add="' + it.id + '">В подборку ' + I("plus") + '</button><a class="btn btn--line" href="#" data-sample>Заказать образец ' + I("arrow-right") + "</a></div>" +
      '<div class="info__note">' + I("info-circle") + "<span>" + t("Оплаты на сайте нет. Добавьте товар в подборку — менеджер уточнит наличие, рассчитает количество и выставит счёт.") + "</span></div></div>";
    var hasD = it.d.length > 0;
    $("#itabs").innerHTML = (hasD ? '<button class="on" data-tab="d">Описание</button>' : "") + '<button' + (hasD ? "" : ' class="on"') + ' data-tab="s">Характеристики</button><button data-tab="r">Похожие материалы</button>';
    $("#tab-d").innerHTML = hasD ? it.d.split(/\n{2,}/).map(function (p) { return "<p>" + t(p).replace(/\n/g, "<br>") + "</p>"; }).join("") : "";
    $("#tab-s").innerHTML = '<table class="spec">' + specs.map(function (s) { return "<tr><td>" + t(s[0]) + "</td><td>" + t(s[1]) + "</td></tr>"; }).join("") + "</table>";
    if (hasD) $("#tab-d").classList.add("on"); else $("#tab-s").classList.add("on");
    var rel = D.items.filter(function (x) { return x.c === it.c && x.id !== it.id && x.n; }).slice(0, 8);
    $("#tab-r").innerHTML = "";
    $("#rel").innerHTML = rel.map(card).join("");
    document.addEventListener("click", function (e) {
      var b;
      if ((b = e.target.closest("[data-g]"))) show(+b.dataset.g);
      if (e.target.closest("[data-gp]")) show(k - 1);
      if (e.target.closest("[data-gn]")) show(k + 1);
      if ((b = e.target.closest("[data-tab]"))) {
        if (b.dataset.tab === "r") { $("#related").scrollIntoView({ behavior: "smooth" }); return; }
        $$("[data-tab]").forEach(function (x) { x.classList.toggle("on", x === b); });
        $$(".ipanel").forEach(function (p) { p.classList.toggle("on", p.id === "tab-" + b.dataset.tab); });
      }
      if (e.target.closest("[data-sample]")) {
        e.preventDefault(); if (pick.indexOf(it.id) < 0) toggle(it.id);
        var m = $("#pickform textarea"); if (m && !m.value) m.value = "Хочу заказать образец: " + it.t;
        drawer(true);
      }
    });
    show(0);
  }

  /* ---------- Статья ---------- */
  if (page === "article") {
    var a = C.articles.filter(function (x) { return x.id === new URLSearchParams(location.search).get("id"); })[0] || C.articles[0];
    document.title = a.title + " — Журнал МАРТдекор";
    $("#crumbs").innerHTML = '<a href="index.html">Главная</a><span><a href="index.html#journal">Журнал</a></span><span>' + t(a.title) + "</span>";
    var words = (a.lead + " " + a.parts.map(function (p) { return (p.p || p.list || []).join(" "); }).join(" ")).split(/\s+/).length;
    $("#cover").innerHTML = '<img src="' + a.cover + '" alt=""><div class="acover__t"><span class="pill pill--w">' + a.tag + '</span><h1>' + t(a.title) + "</h1><small>" + a.date + " · " + Math.max(1, Math.round(words / 160)) + " мин чтения</small></div>";
    $("#abody").innerHTML = '<p class="lead">' + t(a.lead) + "</p>" +
      '<nav class="toc" aria-label="Содержание"><h4>В статье:</h4><ol>' + a.parts.map(function (p, i) { return '<li><a href="#s' + i + '">' + t(p.h) + "</a></li>"; }).join("") + "</ol></nav>" +
      a.parts.map(function (p, i) {
        return '<h2 id="s' + i + '">' + t(p.h) + "</h2>" + (p.p || []).map(function (x) { return "<p>" + t(x) + "</p>"; }).join("") +
          (p.list ? "<ul>" + p.list.map(function (x) { return "<li>" + t(x) + "</li>"; }).join("") + "</ul>" : "") +
          (p.fig ? '<figure><img src="' + p.fig[0] + '" alt="' + esc(p.fig[1]) + '" loading="lazy"><figcaption>' + t(p.fig[1]) + "</figcaption></figure>" : "");
      }).join("") + '<p class="small muted" style="margin-top:32px">Источник: ' + esc(a.src) + "</p>";
    var rel2 = a.cat ? D.items.filter(function (x) { return x.c === a.cat && x.n; }).slice(0, 3) : [];
    $("#aside").innerHTML = '<div class="aside__card"><b>Материалы в каталоге</b><div class="aside__links">' + D.cats.slice(0, 4).map(function (c) { return '<a href="catalog.html?c=' + c[0] + '">' + t(c[1]) + I("arrow-right") + "</a>"; }).join("") + "</div></div>" +
      '<div class="aside__card"><b>' + t("Нужна помощь с выбором?") + "</b><p>" + t("Приходите в салон с проектом, фото или картинкой из интернета — подберём материалы.") + '</p><a class="btn btn--wine btn--sm" href="#" data-open-pick>Подобрать материалы ' + I("arrow-right") + "</a></div>";
    if (rel2.length) { $("#aprods").innerHTML = rel2.map(card).join(""); } else { $("#aprods-wrap").style.display = "none"; }
    $("#arts").innerHTML = C.articles.filter(function (x) { return x !== a; }).map(artCard).join("");
  }

  /* ---------- Появление при прокрутке ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -40px" }) : null;
  function reveal() { $$(".rv:not(.in)").forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); }); }
  drawPick(); reveal();
})();
