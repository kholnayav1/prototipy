/* Центр автосвета — общая логика прототипа: шапка, футер, корзина, плейсхолдеры фото */

const RUB = n => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽';
const byId = id => PRODUCTS.find(p => p.id === id);
const qs = new URLSearchParams(location.search);
const PHONE = '+7 (996) 623-68-98';
const VK = 'https://vk.ru/led_king_auto';
const TG = 'https://t.me/led_king_auto';

const ICON = {
  cart: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.3h7.7a1.5 1.5 0 0 0 1.5-1.2L21 8H6"/></svg>',
  truck: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v10H3z"/><path d="M14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.6 3 8.4 7 10 4-1.6 7-5.4 7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>',
  car: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 16v-4l2-5h12l2 5v4z"/><path d="M4 12h16"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/></svg>',
  box: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#64728f" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
};

/* Линия СТГ — фирменный разделитель: ровно, потом ступенька вверх на 15° */
const STG = `<svg class="stg" viewBox="0 0 1200 22" preserveAspectRatio="none" aria-hidden="true">
  <defs><linearGradient id="stgG" x1="0" x2="1"><stop offset="0" stop-color="#2f7bff" stop-opacity="0"/><stop offset=".55" stop-color="#5fa0ff"/><stop offset="1" stop-color="#5fa0ff" stop-opacity=".2"/></linearGradient></defs>
  <path d="M0 20 H640 L700 3 H1200" fill="none" stroke="url(#stgG)" stroke-width="2"/></svg>`;

/* Плейсхолдер фото: фара и луч со светотеневой границей. Цвет луча — от цвета света товара. */
function ph(p, label = 'фото товара', cls = '') {
  const light = p && p.light && p.light[0] || '';
  const tint = /Жёлт/.test(light) ? '#ffc24a' : /Оранж/.test(light) ? '#ff8a1f' : /Красн/.test(light) ? '#ff4b4b' : '#8fbaff';
  const uid = 'g' + Math.random().toString(36).slice(2, 8);
  return `<div class="ph ${cls}" data-label="${label}"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="${uid}" x1="0" x2="1"><stop offset="0" stop-color="${tint}" stop-opacity=".75"/><stop offset="1" stop-color="${tint}" stop-opacity="0"/></linearGradient></defs>
    <path d="M70 160 L250 150 L300 112 L420 96 L420 300 L240 300 Z" fill="url(#${uid})" opacity=".55"/>
    <path d="M70 160 L250 150 L300 112 L420 96" fill="none" stroke="${tint}" stroke-opacity=".8" stroke-width="1.5"/>
    <circle cx="70" cy="162" r="30" fill="#0b1430" stroke="${tint}" stroke-opacity=".7" stroke-width="2"/>
    <circle cx="70" cy="162" r="13" fill="#fff" opacity=".9"/>
  </svg></div>`;
}

/* ---------- корзина ---------- */
const CART_KEY = 'lka_cart_v1', PROMO_KEY = 'lka_promo_v1';
function cartRead() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } }
function cartWrite(c) { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) {} paintCount(); }
function cartAdd(id, opt = '', qty = 1) {
  const c = cartRead();
  const f = c.find(i => i.id === id && i.opt === opt);
  if (f) f.qty += qty; else c.push({ id, opt, qty });
  cartWrite(c);
  toast('Добавлено в корзину');
}
function cartCount() { return cartRead().reduce((s, i) => s + i.qty, 0); }
function cartSum() { return cartRead().reduce((s, i) => s + (byId(i.id) ? byId(i.id).price * i.qty : 0), 0); }
function promoRead() { try { return localStorage.getItem(PROMO_KEY) === '1'; } catch (e) { return false; } }
function promoWrite(on) { try { on ? localStorage.setItem(PROMO_KEY, '1') : localStorage.removeItem(PROMO_KEY); } catch (e) {} }
function cartTotal() { const s = cartSum(); return promoRead() ? s - Math.round(s * PROMO.discount / 100) : s; }
function paintCount() { document.querySelectorAll('.cart-count').forEach(el => el.textContent = cartCount()); }

let toastTimer;
function toast(text) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = text;
  requestAnimationFrame(() => el.classList.add('on'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 2300);
}

function plural(n, one, few, many) {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return few;
  return many;
}

/* ---------- шапка и футер ---------- */
function paintChrome(active) {
  const nav = [['home', 'index.html', 'Главная'], ['catalog', 'catalog.html', 'Каталог'], ['opt', 'opt.html', 'Оптовикам'], ['delivery', 'delivery.html', 'Доставка и оплата']];
  document.getElementById('site-header').innerHTML = `
  <div class="demo-bar">Прототип сайта для&nbsp;Центра автосвета. Товары, цены и&nbsp;характеристики&nbsp;— из&nbsp;группы ВКонтакте, фото&nbsp;— заглушки.</div>
  <div class="topline"><div class="wrap">
    <div class="tl-l">
      <span>${ICON.truck} Доставка по&nbsp;России, Беларуси, Казахстану и&nbsp;СНГ</span>
      <span>${ICON.box} Цена уже с&nbsp;доставкой до&nbsp;вашего города</span>
    </div>
    <a href="tel:+79966236898">${PHONE}</a>
  </div></div>
  <header class="site"><div class="head">
    <a href="index.html" class="logo"><i></i><span>Центр<br>автосвета<small>LED KING</small></span></a>
    <nav class="main">${nav.map(([k, h, t]) => `<a href="${h}" ${active === k ? 'class="active"' : ''}>${t}</a>`).join('')}</nav>
    <div class="head-act">
      <form class="search" action="catalog.html">${ICON.search}<input name="q" placeholder="H4, P21W, ПТФ…" aria-label="Поиск по каталогу"></form>
      <a href="cart.html" class="cart-btn">${ICON.cart}<span class="t">Корзина</span> <span class="cart-count">0</span></a>
    </div>
  </div></header>`;

  const footEl = document.getElementById('site-footer');
  if (footEl) footEl.innerHTML = `
  <footer class="site"><div class="wrap">
    <div class="f-grid">
      <div>
        <div class="logo" style="color:#fff"><i></i><span>Центр<br>автосвета<small>LED KING</small></span></div>
        <p style="font-size:14.5px;max-width:36ch;margin-top:16px">Лампы, светодиодные модули, комплектующие и&nbsp;аксессуары для&nbsp;легковых и&nbsp;грузовых автомобилей.</p>
        <p style="font-size:14.5px"><a href="tel:+79966236898" style="color:var(--ink);font-weight:700">${PHONE}</a></p>
      </div>
      <div><h4>Каталог</h4><ul>${CATEGORIES.slice(0, 5).map(c => `<li><a href="catalog.html?cat=${c.id}">${c.name}</a></li>`).join('')}</ul></div>
      <div><h4>Покупателям</h4><ul>
        <li><a href="podbor.html">Подбор по&nbsp;авто</a></li>
        <li><a href="delivery.html">Доставка и&nbsp;оплата</a></li>
        <li><a href="delivery.html#warranty">Гарантия</a></li>
        <li><a href="opt.html">Оптовикам</a></li>
      </ul></div>
      <div><h4>На&nbsp;связи</h4><ul>
        <li><a href="${VK}" target="_blank" rel="noopener">ВКонтакте</a></li>
        <li><a href="${TG}" target="_blank" rel="noopener">Telegram</a></li>
        <li><a href="tel:+79966236898">Позвонить</a></li>
      </ul></div>
    </div>
    <div class="f-bottom">
      <span>© 2026 Центр автосвета. Прототип сайта &nbsp;<span class="need">реквизиты ИП/ООО</span></span>
      <span>Прототип собрала: Виктория</span>
    </div>
  </div></footer>`;
  paintCount();
}

/* ---------- карточка товара в сетке ---------- */
function cardHTML(p) {
  const tags = [...p.bases.map(b => `<span class="tag">${b}</span>`), p.v24 ? '<span class="tag v24">12/24 V</span>' : ''].join('');
  const sw = p.light.map(l => `<span class="sw" title="${l}" style="background:${LIGHT_HEX[l] || '#ccc'}"></span>`).join('');
  return `<article class="card">
    ${p.hit ? '<span class="badge">Хит</span>' : ''}
    <a href="product.html?id=${p.id}">${ph(p)}</a>
    <div class="card-body">
      <div class="tags">${tags}</div>
      <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
      ${sw ? `<div style="display:flex;gap:6px">${sw}</div>` : ''}
      <div class="buy-row"><div class="price">${RUB(p.price)}</div>
        <button class="btn" onclick="cartAdd('${p.id}','${p.light[0] || ''}')" aria-label="В корзину">${ICON.cart}</button></div>
    </div>
  </article>`;
}

document.addEventListener('DOMContentLoaded', () => paintChrome(document.body.dataset.page || ''));
