// Вкладки направлений
document.querySelectorAll('.tab').forEach(function (t) {
  t.addEventListener('click', function () {
    document.querySelectorAll('.tab').forEach(function (x) { x.classList.toggle('on', x === t); });
    document.querySelectorAll('.dir').forEach(function (d) { d.classList.toggle('on', d.id === 'dir-' + t.dataset.dir); });
  });
});

// Квиз: логика из статьи «А если у меня небольшой стартовый капитал?»
var ans = {}, step = 1;
var RES = {
  info: ['Продюсирование', 'Капитал не нужен: главный ресурс — время, навыки и готовность вести переговоры. Своя аудитория или блог тоже не нужны.'],
  apple: ['Техника Apple', 'Самая понятная модель для старта: небольшие партии, готовые объявления и скрипты, закупка через поставки Никиты. Можно совмещать с работой.'],
  p2p: ['Криптовалюта и P2P', 'Работа с цифрами и с ноутбука из любой точки мира. Первые сделки пройдёшь на созвоне с Никитой, с демонстрацией экрана.']
};
function show(n) {
  step = n;
  document.querySelectorAll('.q-step').forEach(function (s) { s.classList.toggle('on', +s.dataset.step === n); });
  document.querySelectorAll('.q-progress span').forEach(function (p, i) { p.classList.toggle('on', i < n); });
}
function pick() {
  if (ans.cap === '0') return 'info';
  if (ans.like === 'talk') return 'info';
  if (ans.like === 'num' && ans.cap !== '1') return 'p2p';
  return 'apple';
}
document.querySelectorAll('.q-opt').forEach(function (b) {
  b.addEventListener('click', function () {
    ans[b.dataset.k] = b.dataset.v;
    if (step < 3) return show(step + 1);
    var r = RES[pick()];
    document.getElementById('q-name').textContent = r[0];
    document.getElementById('q-text').textContent = typo(r[1]);
    var sel = document.getElementById('f-dir');
    sel.selectedIndex = { info: 3, apple: 1, p2p: 2 }[pick()];
    show(4);
  });
});
document.getElementById('q-reset').addEventListener('click', function () { ans = {}; show(1); });

// Форма — демо
document.getElementById('form').addEventListener('submit', function (e) {
  e.preventDefault();
  this.style.display = 'none';
  document.getElementById('ok').style.display = 'block';
});

// Появление при прокрутке
var io = new IntersectionObserver(function (es) {
  es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

// Видеоотзывы: стрелки и окно-заглушка
var vids = document.getElementById('vids');
document.querySelectorAll('.vid-arrow').forEach(function (b) {
  b.addEventListener('click', function () {
    var card = vids.querySelector('.vid'), from = vids.scrollLeft, step = +b.dataset.dir * (card.offsetWidth + 20);
    vids.scrollBy({ left: step, behavior: 'smooth' });
    setTimeout(function () { if (vids.scrollLeft === from) vids.scrollLeft = from + step; }, 450);
  });
});
var modal = document.getElementById('modal');
vids.querySelectorAll('.vid').forEach(function (v) {
  v.addEventListener('click', function () {
    var i = v.querySelector('.vid-info');
    document.getElementById('modal-cap').textContent = v.classList.contains('empty') ? 'Пришлите видео — вставим сюда' : i.querySelector('small').textContent;
    modal.hidden = false;
  });
});
function closeModal() { modal.hidden = true; }
document.getElementById('modal-x').addEventListener('click', closeModal);
modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

// Результаты партнёров: фильтр и просмотр
document.querySelectorAll('.res-tab').forEach(function (t) {
  t.addEventListener('click', function () {
    document.querySelectorAll('.res-tab').forEach(function (x) { x.classList.toggle('on', x === t); });
    document.querySelectorAll('.res').forEach(function (r) { r.classList.toggle('hide', t.dataset.f !== 'all' && r.dataset.f !== t.dataset.f); });
  });
});
var lb = document.getElementById('lightbox');
document.querySelectorAll('.res').forEach(function (r) {
  r.addEventListener('click', function () {
    document.getElementById('lb-cap').textContent = r.querySelector('b').textContent + ': ' + r.querySelector('span').textContent;
    lb.hidden = false;
  });
});
function closeLb() { lb.hidden = true; }
document.getElementById('lb-x').addEventListener('click', closeLb);
lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
