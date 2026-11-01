/* Общая логика прототипа: шапка и подвал, карточки, подборка на расчёт, «открыто сейчас», каталог, карточка, статья. */
(function () {
  var D = window.MD, T = window.typo || function (s) { return s; };
  var PHONE = "+7 (909) 420-04-20", TEL = "+79094200420";
  var page = document.body.dataset.page;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var t = function (s) { return esc(T(s)); };
  // последнее слово не остаётся одно на строке
  var tl = function (s) { return t(s).replace(/(\S+) (\S+)$/, function (m, a, b) { return (a + "\u00a0" + b).replace(/-/g, "\u2011"); }); };
  var money = function (n) { return n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽"; };
  var secName = function (id) { var s = D.sections.filter(function (x) { return x.id === id; })[0]; return s ? s.name : ""; };
  var tones = ["", "ph--wine", "ph--sage", "ph--taupe"];

  var logo = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 36V18a14 14 0 0 1 28 0v18" fill="none" stroke="#1E1A18" stroke-width="2.4"/>' +
    '<path d="M9 36V18A11 11 0 0 1 20 7v29z" fill="#5E1F27"/><path d="M20 7a11 11 0 0 1 11 11v18H20z" fill="#B5A48A"/>' +
    '<path d="M12.5 36V25a3.5 3.5 0 0 1 7 0v11z" fill="#6E8A5E"/><path d="M4 36h32" stroke="#1E1A18" stroke-width="2.4"/></svg>';

  /* шапка и подвал — одинаковые на всех страницах */
  var nav = [["catalog.html", "Каталог", "catalog"], ["index.html#steps", "Как заказать"], ["index.html#pro", "Дизайнерам"], ["index.html#where", "Контакты"]];
  $("#top").innerHTML = '<header class="top"><div class="wrap">' +
    '<a class="logo" href="index.html">' + logo + '<span><small>интерьерный салон</small><b>МАРТдекор</b></span></a>' +
    '<nav class="nav">' + nav.map(function (n) { return '<a href="' + n[0] + '"' + (n[2] === page ? ' class="on"' : "") + ">" + n[1] + "</a>"; }).join("") + "</nav>" +
    '<a class="phone" href="tel:' + TEL + '">' + PHONE + "</a>" +
    '<a class="pick-count" href="#" data-drawer><i class="ti ti-list-check"></i>Подборка <b id="pc">0</b></a></div></header>';

  $("#foot").innerHTML = '<footer class="foot"><div class="wrap">' +
    "<div><b>МАРТдекор — интерьерный салон</b>" + t("Обои, фрески, краски, лепнина, панели и каменный шпон от 90+ брендов. Ростов-на-Дону, пр-т Михаила Нагибина, 30Л, дизайн-центр WEST.") + "</div>" +
    '<div><b>Связаться</b><a href="tel:' + TEL + '">' + PHONE + '</a><a href="tel:+79094209420">+7 (909) 420-94-20</a><a href="mailto:info@martdecor.ru">info@martdecor.ru</a></div>' +
    '<div><b>Соцсети</b><a href="https://vk.ru/martdecoronline">ВКонтакте</a><a href="https://t.me/martdecorrostov">Telegram</a><a href="https://instagram.com/martdecor.ru">Instagram</a></div>' +
    '<div class="proto">' + t("Прототип для обсуждения структуры. Тексты, цены и отзывы взяты из группы ВКонтакте и сайтов салона, наличие показано для примера, фото — заглушки. Прототип подготовила Виктория.") + "</div></div></footer>";

  document.body.insertAdjacentHTML("beforeend",
    '<div class="shade" data-close></div><aside class="drawer" aria-label="Подборка"><header><h3 style="margin:0">Подборка на расчёт</h3><button class="x" data-close aria-label="Закрыть">×</button></header>' +
    '<div class="list" id="dl"></div><footer><p class="src" style="margin:0">' + t("Менеджер проверит наличие и сроки, посчитает количество и пришлёт счёт. Оплаты на сайте нет.") + '</p>' +
    '<a class="btn" href="index.html#form" data-close>Отправить на расчёт</a></footer></aside><div class="toast" id="toast"></div>');

  /* подборка: список позиций для расчёта вместо корзины */
  var pick = [];
  try { pick = JSON.parse(localStorage.getItem("md-pick") || "[]"); } catch (e) { pick = []; }
  function save() { try { localStorage.setItem("md-pick", JSON.stringify(pick)); } catch (e) {} }
  function drawPick() {
    $("#pc").textContent = pick.length;
    $("#dl").innerHTML = pick.length ? pick.map(function (id) {
      var it = D.items.filter(function (x) { return x.id === id; })[0];
      return it ? '<div class="li"><span>' + t(it.name) + '<br><small class="src">' + (it.price ? money(it.price) + " " + it.unit : "цена по запросу") + '</small></span><button data-del="' + id + '" aria-label="Убрать">×</button></div>' : "";
    }).join("") : '<p class="src" style="padding:20px 0">' + t("Пока пусто. Добавляйте материалы из каталога — менеджер посчитает всё сразу.") + "</p>";
    document.querySelectorAll("[data-add]").forEach(function (b) {
      var on = pick.indexOf(b.dataset.add) >= 0;
      b.classList.toggle("on", on);
      b.textContent = on ? "В подборке" : (b.dataset.label || "В подборку");
    });
    var fl = $("#form-list");
    if (fl) fl.value = pick.map(function (id) { var it = D.items.filter(function (x) { return x.id === id; })[0]; return it ? it.name : ""; }).join("\n");
  }
  function toast(s) { var el = $("#toast"); el.textContent = s; el.classList.add("show"); clearTimeout(toast.h); toast.h = setTimeout(function () { el.classList.remove("show"); }, 2000); }
  function drawer(open) { $(".drawer").classList.toggle("open", open); $(".shade").classList.toggle("open", open); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-add]"), d = e.target.closest("[data-del]");
    if (a) { e.preventDefault(); var i = pick.indexOf(a.dataset.add); if (i >= 0) pick.splice(i, 1); else { pick.push(a.dataset.add); toast("Добавлено в подборку"); } save(); drawPick(); }
    if (d) { pick.splice(pick.indexOf(d.dataset.del), 1); save(); drawPick(); }
    if (e.target.closest("[data-drawer]")) { e.preventDefault(); drawer(true); }
    if (e.target.closest("[data-close]")) drawer(false);
  });

  /* карточка товара в сетке */
  function card(it, n) {
    return '<article class="card rv"><a href="item.html?id=' + it.id + '" class="ph ' + tones[n % 4] + '"><span><i class="ti ti-photo"></i>' + t("Фото: " + it.name) + "</span></a>" +
      '<div class="b"><span class="s">' + t(secName(it.sec)) + '</span><h3><a href="item.html?id=' + it.id + '">' + tl(it.name) + "</a></h3><p>" + tl(it.line) + "</p>" +
      '<div class="row"><span class="price">' + (it.price ? money(it.price) + " <small>" + esc(it.unit) + "</small>" : '<small>цена по запросу</small>') + "</span>" +
      '<span class="badge' + (it.status === "few" ? " few" : "") + '">' + (it.status === "few" ? "мало" : "в наличии") + "</span></div>" +
      '<button class="add" data-add="' + it.id + '" style="margin-top:14px">В подборку</button></div></article>';
  }

  /* «открыто сейчас» по графику из ВК */
  var op = $("#open-now");
  if (op) {
    var now = new Date(), m = now.getHours() * 60 + now.getMinutes(), h = D.hours[now.getDay()];
    var isOpen = h && m >= h[0] && m < h[1];
    op.className = "open" + (isOpen ? "" : " closed");
    op.textContent = isOpen ? "Открыто до " + Math.floor(h[1] / 60) + ":00" : "Сейчас закрыто, откроемся в 10:00";
  }

  /* главная */
  if (page === "home") {
    $("#secs").innerHTML = D.sections.map(function (s, n) {
      var prices = D.items.filter(function (i) { return i.sec === s.id && i.price; }).map(function (i) { return i.price; });
      return '<a class="sec rv" href="catalog.html?sec=' + s.id + '"><div class="ph ' + tones[n % 4] + '"><span><i class="ti ti-photo"></i>' + t("Фото раздела из салона") + "</span></div>" +
        '<div class="t"><h3>' + t(s.name) + '</h3><span class="from">' + (prices.length ? "от " + money(Math.min.apply(null, prices)) : "цена по запросу") + "</span> · <small>" + esc(s.count) + '</small><p class="f">' + t(s.fact) + "</p></div></a>";
    }).join("");
    $("#hits").innerHTML = ["shangrila", "verde", "bamstek", "charmant"].map(function (id, n) { return card(D.items.filter(function (x) { return x.id === id; })[0], n); }).join("");
    $("#revs").innerHTML = D.reviews.map(function (r) { return '<div class="rev rv"><q>' + t(r.text) + "</q><b>" + esc(r.name) + "</b><small>" + esc(r.role) + " · отзыв с " + esc(r.src) + "</small></div>"; }).join("");
    $("#arts").innerHTML = D.articles.map(function (a, n) { return '<a class="art rv" href="article.html?id=' + a.id + '"><div class="ph ph--arch ' + tones[(n + 1) % 4] + '"><span><i class="ti ti-photo"></i>Фото к статье</span></div><h3>' + t(a.title) + "</h3><p>" + t(a.lead) + "</p></a>"; }).join("");
    $("#faq").innerHTML = D.faq.map(function (f, n) { return "<details" + (n ? "" : " open") + "><summary>" + t(f[0]) + "</summary><p>" + t(f[1]) + "</p></details>"; }).join("");
    var form = $("#req");
    form.addEventListener("submit", function (e) { e.preventDefault(); form.innerHTML = '<h3>Спасибо!</h3><p>' + t("Это демо: в рабочем сайте заявка уйдёт менеджеру, и он перезвонит в рабочее время салона.") + "</p>"; });
  }

  /* каталог: поиск, раздел, назначение, наличие */
  if (page === "catalog") {
    var q = new URLSearchParams(location.search), st = { sec: q.get("sec") || "all", room: "all", txt: "", only: false };
    var rooms = [["all", "Любое помещение"], ["Ванн", "Ванная и кухня"], ["Гостин", "Гостиная"], ["Спальн", "Спальня"], ["коммерч", "Коммерция"]];
    $("#f-sec").innerHTML = [["all", "Все разделы"]].concat(D.sections.map(function (s) { return [s.id, s.name]; })).map(function (s) { return '<button class="chip" data-sec="' + s[0] + '">' + t(s[1]) + "</button>"; }).join("");
    $("#f-room").innerHTML = rooms.map(function (r) { return '<button class="chip" data-room="' + r[0] + '">' + r[1] + "</button>"; }).join("");
    function draw() {
      var list = D.items.filter(function (i) {
        var hay = (i.name + " " + i.line + " " + (i.brand || "")).toLowerCase();
        return (st.sec === "all" || i.sec === st.sec) && (st.room === "all" || (i.who + " " + i.plus.join(" ")).toLowerCase().indexOf(st.room.toLowerCase()) >= 0) &&
          (!st.txt || hay.indexOf(st.txt) >= 0) && (!st.only || i.status === "in");
      });
      $("#list").innerHTML = list.length ? list.map(card).join("") : '<div class="empty">' + t("Ничего не нашлось. Напишите, что ищете, — менеджер подберёт.") + "</div>";
      $("#cnt").textContent = list.length;
      $("#cat-title").textContent = st.sec === "all" ? "Каталог" : secName(st.sec);
      document.querySelectorAll("[data-sec]").forEach(function (b) { b.classList.toggle("on", b.dataset.sec === st.sec); });
      document.querySelectorAll("[data-room]").forEach(function (b) { b.classList.toggle("on", b.dataset.room === st.room); });
      drawPick(); reveal();
    }
    document.addEventListener("click", function (e) {
      var s = e.target.closest("[data-sec]"), r = e.target.closest("[data-room]");
      if (s) { st.sec = s.dataset.sec; draw(); }
      if (r) { st.room = r.dataset.room; draw(); }
    });
    $("#q").addEventListener("input", function (e) { st.txt = e.target.value.trim().toLowerCase(); draw(); });
    $("#only").addEventListener("change", function (e) { st.only = e.target.checked; draw(); });
    draw();
  }

  /* карточка позиции */
  if (page === "item") {
    var id = new URLSearchParams(location.search).get("id"), it = D.items.filter(function (x) { return x.id === id; })[0] || D.items[0];
    document.title = it.name + " — МАРТдекор";
    $("#crumb").innerHTML = '<a href="index.html">Главная</a> / <a href="catalog.html">Каталог</a> / <a href="catalog.html?sec=' + it.sec + '">' + t(secName(it.sec)) + "</a>";
    $("#item").innerHTML = '<div class="gallery"><div class="ph ph--arch"><span><i class="ti ti-photo"></i>' + t("Главное фото: материал в интерьере") + '</span></div><div class="ph ph--taupe"><span>Фактура крупно</span></div><div class="ph ph--sage"><span>Образец в салоне</span></div></div>' +
      '<div><span class="eyebrow">' + t(secName(it.sec)) + (it.brand ? " · " + esc(it.brand) : "") + "</span><h1 style=\"font-size:clamp(34px,4vw,52px)\">" + t(it.name) + '</h1><p class="lead">' + t(it.line) + "</p>" +
      '<div style="display:flex;align-items:center;gap:16px;margin:20px 0"><span class="price" style="font-size:36px">' + (it.price ? money(it.price) + " <small>" + esc(it.unit) + "</small>" : "<small>цена по запросу</small>") + "</span>" +
      '<span class="badge' + (it.status === "few" ? " few" : "") + '">' + (it.status === "few" ? "количество ограничено" : "в наличии") + ' (для примера)</span></div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn" data-add="' + it.id + '" data-label="Добавить в подборку">Добавить в подборку</button><a class="btn btn--ghost" href="index.html#form">Посмотреть образец</a></div>' +
      '<table class="specs">' + it.specs.map(function (s) { return "<tr><td>" + t(s[0]) + "</td><td>" + t(s[1]) + "</td></tr>"; }).join("") + "</table>" +
      (it.plus.length ? "<h3>Чем хорош</h3><ul class=\"pl\">" + it.plus.map(function (p) { return "<li>" + t(p) + "</li>"; }).join("") + "</ul>" : "") +
      '<div class="box"><b>Куда подходит:</b> ' + t(it.who) + (it.need ? "<br><b>Что учесть:</b> " + t(it.need) : "") + "</div>" +
      '<div class="box" style="display:flex;gap:14px"><i class="ti ti-truck" style="font-size:26px;color:var(--wine)"></i><span>' + t("По Ростову — Яндекс Go по тарифу, в регионы — транспортными компаниями. Оплата по счёту после консультации.") + "</span></div>" +
      '<p class="src">Источник: ' + t(it.src) + "</p></div>";
    $("#more").innerHTML = D.items.filter(function (x) { return x.sec === it.sec && x.id !== it.id; }).concat(D.items.filter(function (x) { return x.sec !== it.sec; })).slice(0, 4).map(card).join("");
  }

  /* статья */
  if (page === "article") {
    var a = D.articles.filter(function (x) { return x.id === new URLSearchParams(location.search).get("id"); })[0] || D.articles[0];
    document.title = a.title + " — МАРТдекор";
    $("#art").innerHTML = '<div class="crumbs"><a href="index.html">Главная</a> / Советы</div><span class="eyebrow">Советы салона</span><h1 style="font-size:clamp(36px,4.4vw,56px)">' + t(a.title) + '</h1><p class="lead">' + t(a.lead) + '</p>' +
      '<div class="ph ph--arch ph--sage"><span><i class="ti ti-photo"></i>Фото из поста</span></div><ol>' + a.body.map(function (b) { return "<li>" + t(b) + "</li>"; }).join("") + '</ol><p class="src">' + t("Источник: " + a.src) + "</p>" +
      '<div class="box"><h3>' + t("Подберём материалы под ваш проект") + "</h3><p>" + t("Приезжайте в салон с фото или дизайн-проектом — или пришлите их менеджеру.") + '</p><a class="btn" href="index.html#form">Оставить заявку</a></div>';
  }

  /* появление при прокрутке */
  function reveal() {
    var els = document.querySelectorAll(".rv:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -40px" });
    els.forEach(function (e) { io.observe(e); });
  }
  drawPick(); reveal();
})();
