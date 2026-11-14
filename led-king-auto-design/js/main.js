/* Центр автосвета — общая логика: шапка, подвал, карточки, корзина, окно заявки */

const RUB = n => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽';
const byId = id => PRODUCTS.find(p => p.id === id);
const qs = new URLSearchParams(location.search);
const PHONE = '+7 (996) 623-68-98', PHONE_HREF = 'tel:+79966236898';
const VK = 'https://vk.ru/led_king_auto';
const TG = 'https://t.me/led_king_auto';

const I = (d, s = 22, w = 1.8) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  cart: s => I('<circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/><path d="M3 4h2.2l2.3 11a1.5 1.5 0 0 0 1.5 1.2h7.9a1.5 1.5 0 0 0 1.4-1.1L20.5 8H6.1"/>', s),
  truck: s => I('<path d="M2.5 6.5h11v9.5h-11z"/><path d="M13.5 9.5h4l3 3.2v3.3h-7"/><circle cx="6.5" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/>', s),
  box: s => I('<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>', s),
  car: s => I('<path d="M3.5 16.5v-4l2.2-5.2a1.5 1.5 0 0 1 1.4-.9h9.8a1.5 1.5 0 0 1 1.4.9l2.2 5.2v4"/><path d="M3.5 12.5h17"/><path d="M3.5 16.5h17"/><circle cx="7.5" cy="16.8" r="1.8"/><circle cx="16.5" cy="16.8" r="1.8"/>', s),
  shield: s => I('<path d="M12 3 5 6v5c0 4.6 3 8.4 7 10 4-1.6 7-5.4 7-10V6z"/><path d="m9 12 2 2 4-4"/>', s),
  play: s => I('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 9 5 3-5 3z"/>', s),
  search: s => I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', s, 2),
  phone: s => I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>', s),
  tg: s => I('<path d="m21 4-18 7 6 2 2 6 3-4 5 4z"/><path d="m9 13 8-6"/>', s),
  card: s => I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>', s),
  menu: s => I('<path d="M4 7h16M4 12h16M4 17h16"/>', s, 2),
  check: s => I('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>', s),
  arrowL: s => I('<path d="M15 6l-6 6 6 6"/>', s, 2),
  arrowR: s => I('<path d="M9 6l6 6-6 6"/>', s, 2),
  v24: () => `<svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true"><text x="22" y="28" text-anchor="middle" font-family="Unbounded" font-weight="700" font-size="15" fill="currentColor">24V</text></svg>`
};

/* Линия СТГ: ровно, потом ступенька вверх на 15° — фирменный мотив */
const STG = `<svg class="stg" viewBox="0 0 1200 22" preserveAspectRatio="none" aria-hidden="true">
  <defs><linearGradient id="stgG" x1="0" x2="1"><stop offset="0" stop-color="#2F7CFF" stop-opacity="0"/><stop offset=".55" stop-color="#4A97FF"/><stop offset="1" stop-color="#4A97FF" stop-opacity=".15"/></linearGradient></defs>
  <path d="M0 20 H640 L715 4 H1200" fill="none" stroke="url(#stgG)" stroke-width="2"/></svg>`;

const NAV = [['index.html', 'Главная', 'home'], ['catalog.html', 'Каталог', 'catalog'], ['opt.html', 'Оптовикам', 'opt'], ['delivery.html', 'Доставка и оплата', 'delivery']];

function headerHTML(page) {
  return `
  <div class="topbar"><div class="wrap">
    <span>${ICON.truck(16)} Доставка по&nbsp;России, Беларуси, Казахстану и&nbsp;СНГ</span><i class="sep"></i>
    <span class="dl">${ICON.box(16)} Цена уже с&nbsp;доставкой до&nbsp;вашего города</span>
    <a class="tel" href="${PHONE_HREF}">${PHONE}</a>
  </div></div>
  <header class="site"><div class="wrap">
    <a class="logo" href="index.html" aria-label="Центр автосвета — на главную"><i></i><span><b>Центр<br>автосвета</b><small>LED KING</small></span></a>
    <nav class="main">${NAV.map(([h, t, k]) => `<a href="${h}"${k === page ? ' class="on"' : ''}>${t}</a>`).join('')}</nav>
    <div class="h-act">
      <form class="search" action="catalog.html" role="search">${ICON.search(17)}<input name="q" placeholder="H4, P21W, ПТФ…" aria-label="Поиск по каталогу" value="${(qs.get('q') || '').replace(/"/g, '')}"></form>
      <a class="cart-btn" href="cart.html">${ICON.cart(19)}<span class="t">Корзина</span><span class="cart-count">0</span></a>
      <button class="ic-btn burger" type="button" aria-label="Меню" onclick="document.querySelector('.mnav').classList.toggle('on')">${ICON.menu(22)}</button>
    </div>
  </div></header>
  <div class="mnav">
    <form class="search" action="catalog.html">${ICON.search(17)}<input name="q" placeholder="H4, P21W, ПТФ…" aria-label="Поиск"></form>
    ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
    <a href="${PHONE_HREF}">${PHONE}</a>
  </div>`;
}

function footerHTML() {
  return `<footer class="site"><div class="wrap">
    <div><a class="logo" href="index.html"><i></i><span><b>Центр<br>автосвета</b><small>LED KING</small></span></a></div>
    <div><p>Центр автомобильного света&nbsp;— ваш надёжный партнёр в&nbsp;мире автомобильного освещения: качественные лампы, светодиодные модули, комплектующие и&nbsp;аксессуары для&nbsp;легковых и&nbsp;грузовых автомобилей.</p></div>
    <div><h5>Каталог</h5><ul>${CATEGORIES.slice(0, 4).map(c => `<li><a href="catalog.html?cat=${c.id}">${c.name}</a></li>`).join('')}</ul></div>
    <div><h5>Покупателям</h5><ul><li><a href="#" onclick="event.preventDefault();openLead()">Подбор по&nbsp;авто</a></li><li><a href="delivery.html">Доставка и&nbsp;оплата</a></li><li><a href="delivery.html#warranty">Гарантия 1&nbsp;год</a></li><li><a href="opt.html">Оптовикам</a></li></ul></div>
    <div><h5>На&nbsp;связи</h5><ul>
      <li><a class="soc" href="${VK}" target="_blank" rel="noopener">ВКонтакте</a></li>
      <li><a class="soc" href="${TG}" target="_blank" rel="noopener">Telegram</a></li>
      <li><a class="soc" href="${PHONE_HREF}">${PHONE}</a></li></ul></div>
    <div class="bottom"><span>© 2026 Центр автосвета · LED KING</span><span>Работаем дистанционно по&nbsp;России, Беларуси, Казахстану и&nbsp;СНГ</span></div>
  </div></footer>`;
}

const LEAD_FORM = `
  <div class="form">
    <div class="field"><label for="m-brand">Марка автомобиля</label><select id="m-brand" class="in" required><option value="">Выберите марку</option>${['Lada', 'KIA', 'Hyundai', 'Renault', 'Toyota', 'Volkswagen', 'Skoda', 'Nissan', 'Chevrolet', 'Нива / УАЗ / Волга', 'Грузовик (24 V)', 'Другая'].map(b => `<option>${b}</option>`).join('')}</select></div>
    <div class="field"><label for="m-model">Модель</label><input id="m-model" class="in" placeholder="Например, Granta"></div>
    <div class="field"><label for="m-year">Год выпуска</label><input id="m-year" class="in" inputmode="numeric" placeholder="2018"></div>
    <div class="field"><label for="m-name">Ваше имя</label><input id="m-name" class="in" autocomplete="name" placeholder="Имя"></div>
    <div class="field full"><label for="m-phone">Телефон или Telegram</label><input id="m-phone" class="in" required placeholder="+7 (___) ___-__-__ или @ник"></div>
    <button class="btn wide full" type="submit">Подобрать лампу</button>
    <label class="consent full"><input type="checkbox" required checked> <span>Согласие на&nbsp;<a href="#" onclick="event.preventDefault();toast('Здесь будет документ об обработке персональных данных')">обработку персональных данных</a></span></label>
  </div>`;
const DONE = `<div class="done"><b>Заявка принята</b><span class="muted">Специалист напишет вам и&nbsp;предложит лампы под&nbsp;вашу машину.</span></div>`;

function modalHTML() {
  return `<div class="modal" id="lead" role="dialog" aria-modal="true" aria-labelledby="lead-h"><div class="box">
    <button class="x" type="button" aria-label="Закрыть" onclick="closeLead()">×</button>
    <h3 id="lead-h">Заявка на&nbsp;подбор лампы</h3>
    <p class="sub">Подберём лампы конкретно под&nbsp;вашу марку и&nbsp;модель</p>
    <form id="lead-form" onsubmit="event.preventDefault();this.innerHTML=DONE">${LEAD_FORM}</form>
  </div></div>`;
}
function openLead() {
  const m = document.getElementById('lead'), f = document.getElementById('lead-form');
  if (!f.querySelector('select')) f.innerHTML = LEAD_FORM;
  m.classList.add('on'); setTimeout(() => f.querySelector('select').focus(), 50);
}
function closeLead() { document.getElementById('lead').classList.remove('on'); }

/* карточка товара */
function cardHTML(p) {
  const badge = p.hit ? '<span class="badge">Хит</span>' : p.isNew ? '<span class="badge new">Новинка</span>' : '';
  return `<article class="card">${badge}
    <a class="im" href="product.html?id=${p.id}"><img src="${p.photos[0]}" alt="${p.name}" loading="lazy"></a>
    <div class="body">
      <div class="tags">${(p.tags || []).slice(0, 3).map(t => `<span>${t}</span>`).join('')}</div>
      <a href="product.html?id=${p.id}"><h4>${p.name}</h4></a>
      <div class="foot"><span class="price${p.price ? '' : ' ask'}">${p.price ? RUB(p.price) : 'Цена по&nbsp;запросу'}</span>
        <button class="add" type="button" aria-label="В корзину" onclick="cartAdd('${p.id}')">${ICON.cart(20)}</button></div>
    </div></article>`;
}

/* корзина (хранится в браузере) */
const CART_KEY = 'lk_cart_v2';
function cartRead() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } }
function cartWrite(c) { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) {} paintCount(); }
function cartAdd(id, qty = 1) {
  const c = cartRead(), f = c.find(i => i.id === id);
  if (f) f.qty += qty; else c.push({ id, qty });
  cartWrite(c); toast('Добавлено в корзину');
}
function cartCount() { return cartRead().reduce((s, i) => s + i.qty, 0); }
function paintCount() { document.querySelectorAll('.cart-count').forEach(el => el.textContent = cartCount()); }

let toastT;
function toast(t) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = t; requestAnimationFrame(() => el.classList.add('on'));
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2200);
}
function plural(n, a, b, c) { const x = n % 10, y = n % 100; return x === 1 && y !== 11 ? a : x >= 2 && x <= 4 && (y < 10 || y >= 20) ? b : c; }
function slider(trackId, prevId, nextId) {
  const t = document.getElementById(trackId);
  const step = () => t.firstElementChild.offsetWidth + (parseFloat(getComputedStyle(t).columnGap) || 0);
  const end = () => t.scrollLeft + t.clientWidth >= t.scrollWidth - 4;
  /* на последней карточке «вперёд» возвращает к первой, на первой «назад» — к последней */
  document.getElementById(prevId).onclick = () => t.scrollLeft <= 4 ? t.scrollTo({ left: t.scrollWidth, behavior: 'smooth' }) : t.scrollBy({ left: -step(), behavior: 'smooth' });
  document.getElementById(nextId).onclick = () => end() ? t.scrollTo({ left: 0, behavior: 'smooth' }) : t.scrollBy({ left: step(), behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  document.getElementById('site-header').outerHTML = headerHTML(page);
  document.getElementById('site-footer').outerHTML = footerHTML() + modalHTML();
  document.getElementById('lead').addEventListener('click', e => { if (e.target.id === 'lead') closeLead(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLead(); });
  document.querySelectorAll('.stg-slot').forEach(el => el.innerHTML = STG);
  paintCount();
});

/* Типограф: строка не должна заканчиваться предлогом, союзом или частицей (навык «ровные строки»).
   Ставит неразрывный пробел после коротких служебных слов во ВСЕХ текстах страницы,
   в том числе в тех, что подставляются из data.js (товары, описания, отзывы). */
(function () {
  const NB = ' ';
  const FWD = new Set(('в во на с со к ко о об обо у по за из от до для без под над при про через между перед после около вокруг ' +
    'и а но или да что чтобы как если когда либо то не ни из-за из-под ещё уже').split(' '));
  const SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|CODE|PRE|SVG)$/;
  function fix(s) {
    let t = s.replace(/(?<=^|[\s(«"„—])([А-Яа-яЁё]+(?:-[а-я]+)?) (?=\S)/g, (m, w) => FWD.has(w.toLowerCase()) ? w + NB : m);
    t = t.replace(/ (же|ли|бы)(?=[\s.,!?…]|$)/g, NB + '$1');
    t = t.replace(/(\S) (—|–) /g, '$1' + NB + '$2 ');
    t = t.replace(/(\d) (\d{3})(?!\d)/g, '$1' + NB + '$2');
    t = t.replace(/(\d) (₽|%|V|W|K|лм|шт|мм|см|кг|м|год|года|лет|дн|дней|мес|мин|минут)(?=[\s.,;:!?)»]|$)/g, '$1' + NB + '$2');
    return t;
  }
  function walk(root) {
    if (root.nodeType === 3) { const f = fix(root.nodeValue); if (f !== root.nodeValue) root.nodeValue = f; return; }
    if (root.nodeType !== 1 || SKIP.test(root.nodeName.toUpperCase())) return;
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && SKIP.test(n.parentElement.nodeName.toUpperCase()) ? 2 : 1 });
    let n; while ((n = tw.nextNode())) { const f = fix(n.nodeValue); if (f !== n.nodeValue) n.nodeValue = f; }
  }
  window.typoWalk = walk;
  function start() {
    walk(document.body);
    new MutationObserver(ms => ms.forEach(m => {
      if (m.type === 'characterData') walk(m.target);
      m.addedNodes && m.addedNodes.forEach(walk);
    })).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  document.readyState === 'complete' ? start() : window.addEventListener('load', start);
})();
