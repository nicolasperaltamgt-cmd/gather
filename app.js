/* Gather · prototipo interactivo
   Todo lo que ves es DEMO: no hay backend ni IA real. Las respuestas de Gather son guionadas.
   Funciona de verdad en el navegador: navegación, votos, asistencia, retos, ajustes, memoria, fotos locales. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- almacenamiento (con try/catch) ---------- */
const KEY = 'gather.proto.v2';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

/* ---------- mascota ---------- */
const POSES = ['celular','risas','sorpresa','cocina','futbol','cine','gaming','baile','foodie','aventura','recompensa','compu','pintor','triste','enojada','manos','corazon'];
/* Clips animados reales (cuando existan): { saludar:'assets/clips/saludar.webm', ... }. Ver ANIMACIONES.md */
const CLIPS = {};
const CAT = {
  comida:{pose:'foodie',emoji:'🍔',bg:'linear-gradient(135deg,#ff8a3d,#e11d3f)'},
  cocina:{pose:'cocina',emoji:'👨‍🍳',bg:'linear-gradient(135deg,#f59e0b,#b45309)'},
  cine:{pose:'cine',emoji:'🍿',bg:'linear-gradient(135deg,#6d28d9,#1e1b4b)'},
  juegos:{pose:'gaming',emoji:'🎳',bg:'linear-gradient(135deg,#2563eb,#0b1240)'},
  deporte:{pose:'futbol',emoji:'⚽',bg:'linear-gradient(135deg,#16a34a,#14532d)'},
  baile:{pose:'baile',emoji:'🕺',bg:'linear-gradient(135deg,#db2777,#6d28d9)'},
  aventura:{pose:'aventura',emoji:'🗺️',bg:'linear-gradient(135deg,#0d9488,#164e63)'}
};

function createMascot(host, pose = 'celular') {
  host.innerHTML = '<div class="mascot-shadow"></div><div class="confetti"></div>';
  let cur = null, curName = null;
  const api = {
    get pose() { return curName; },
    set(name, opts = {}) {
      if (!POSES.includes(name) && !CLIPS[name]) name = 'celular';
      if (name === curName && !opts.force) return;
      const old = cur;
      let el;
      if (CLIPS[name]) {
        el = document.createElement('video');
        Object.assign(el, { src: CLIPS[name], muted: true, playsInline: true, autoplay: !REDUCED, loop: false });
      } else {
        el = document.createElement('img');
        el.src = `assets/${name}.webp`;
        el.alt = '';
        el.decoding = 'async';
      }
      if (!REDUCED) el.classList.add('in');
      host.insertBefore(el, host.querySelector('.confetti'));
      if (old) {
        if (REDUCED) old.remove();
        else { old.classList.remove('in'); old.classList.add('out'); setTimeout(() => old.remove(), 230); }
      }
      cur = el; curName = name;
      if (opts.confetti || name === 'recompensa') api.confetti();
    },
    confetti() {
      if (REDUCED) return;
      const c = host.querySelector('.confetti'); if (!c) return;
      const cols = ['#c8f23a', '#ffc83d', '#fdf3e2', '#3fd3d0', '#ff6a85'];
      for (let i = 0; i < 18; i++) {
        const p = document.createElement('i');
        p.style.cssText = `left:${30 + Math.random() * 40}%;background:${cols[i % cols.length]};--dx:${(Math.random() - .5) * 220}px;--rot:${Math.random() * 540}deg;animation-delay:${Math.random() * .2}s`;
        c.appendChild(p); setTimeout(() => p.remove(), 1800);
      }
    }
  };
  api.set(pose);
  return api;
}

/* ---------- datos de demostración ---------- */
const MEMBERS = [
  { id: 'sofi', n: 'Sofi', c: '#e11d3f', photo: 'assets/ia/perfil-sofi.webp' }, { id: 'nico', n: 'Nico', c: '#2563eb', photo: 'assets/ia/perfil-nico.webp' }, { id: 'mati', n: 'Mati', c: '#16a34a', photo: 'assets/ia/perfil-mati.webp' },
  { id: 'lau', n: 'Lau', c: '#9333ea', photo: 'assets/ia/perfil-lau.webp' }, { id: 'caro', n: 'Caro', c: '#ea580c', photo: 'assets/ia/perfil-caro.webp' }, { id: 'yo', n: 'Vos', c: '#0891b2', photo: 'assets/ia/perfil-yo.webp' }
];
const M = id => MEMBERS.find(m => m.id === id);
/* Fotos de perfil SIMULADAS: ilustraciones generadas en código, no son fotos de personas reales */
const FACES = {
  sofi: { bg: '#f7a8b8', skin: '#f2c4a0', shirt: '#e11d3f', back: '<path d="M16 32c-2-18 10-23 16-23s18 5 16 23c0 8 2 14 3 19H13c1-5 3-11 3-19z" fill="#3b2314"/>', front: '<path d="M19 27c2-9 8-12 14-12s11 4 12 12c-5-3-9-6-13-8-3 4-8 7-13 8z" fill="#3b2314"/>' },
  nico: { bg: '#9db8ff', skin: '#e0a878', shirt: '#2563eb', back: '', front: '<path d="M18 28c-2-11 5-17 14-17s16 6 14 17c-3-4-6-6-9-7-4 3-10 3-14 1-2 1-4 3-5 6z" fill="#1a1a1a"/><circle cx="20" cy="19" r="4" fill="#1a1a1a"/><circle cx="44" cy="19" r="4" fill="#1a1a1a"/>' },
  mati: { bg: '#9be3b0', skin: '#c68642', shirt: '#16a34a', back: '', front: '<path d="M19 26c1-9 7-13 13-13s12 4 13 13c-4-3-8-5-13-5s-9 2-13 5z" fill="#2a1a10"/><g fill="none" stroke="#222" stroke-width="1.6"><circle cx="26.5" cy="31" r="4.6"/><circle cx="37.5" cy="31" r="4.6"/><path d="M31 31h2"/></g>' },
  lau: { bg: '#d6b3ff', skin: '#fbd5b5', shirt: '#9333ea', back: '<path d="M16 31c-1-15 8-20 16-20s17 5 16 20c0 5-1 9-3 11H19c-2-2-3-6-3-11z" fill="#d9a441"/>', front: '<path d="M19 26c4-8 12-10 20-6 3 2 5 4 6 8-6-1-11-5-16-7-3 3-6 5-10 5z" fill="#d9a441"/>' },
  caro: { bg: '#ffc59a', skin: '#8d5524', shirt: '#ea580c', back: '<circle cx="32" cy="24" r="18" fill="#1b120d"/>', front: '<path d="M20 27c2-7 7-9 12-9s10 2 12 9c-4-3-8-4-12-4s-8 1-12 4z" fill="#1b120d"/><circle cx="19" cy="35" r="1.8" fill="#ffc83d"/><circle cx="45" cy="35" r="1.8" fill="#ffc83d"/>' },
  yo: { bg: '#8fe0e8', skin: '#f0c8a0', shirt: '#0891b2', back: '', front: '<path d="M18 29c-2-11 5-17 14-17s16 6 14 17c-2-3-4-5-6-6-1 3-4 4-6 3-2 2-6 3-9 2-3 1-5 3-7 1z" fill="#5a3a22"/>' }
};
const faceSVG = id => { const f = FACES[id]; return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="${f.bg}"/>${f.back}<path d="M8 64c0-13 10-19 24-19s24 6 24 19z" fill="${f.shirt}"/><rect x="27" y="38" width="10" height="11" rx="4" fill="${f.skin}"/><ellipse cx="32" cy="31" rx="13" ry="15" fill="${f.skin}"/><ellipse cx="19.2" cy="33" rx="2.2" ry="3.2" fill="${f.skin}"/><ellipse cx="44.8" cy="33" rx="2.2" ry="3.2" fill="${f.skin}"/>${f.front}<circle cx="27" cy="31.5" r="1.7" fill="#2a1a1a"/><circle cx="37" cy="31.5" r="1.7" fill="#2a1a1a"/><path d="M27 38.5q5 4.2 10 0" fill="none" stroke="#7a2e22" stroke-width="1.8" stroke-linecap="round"/></svg>`; };
const av = (id, cls = '', extra = '') => { const m = M(id); return `<span class="av ${cls} ${id === 'yo' ? 'me' : ''}" style="background:${m.c}" role="img" aria-label="${m.n}" title="${m.n} (perfil simulado)">${m.photo ? `<img src="${m.photo}" alt="" loading="lazy">` : faceSVG(id)}${extra}</span>`; };

/* Comercios FICTICIOS de demostración (no hay conexión real con locales) */
const COMERCIOS = [
  { id: 'c1', n: 'Strike Bowling', cat: 'juegos', emoji: '🎳', addr: 'Av. Siempreviva 742', hrs: '18 a 01 h', cover: 'assets/ia/comercio-c1-bowling.webp', benefit: '2 pistas al precio de 1' },
  { id: 'c2', n: 'La Piccola Pizzería', cat: 'comida', emoji: '🍕', addr: 'Calle Falsa 123', hrs: '12 a 00 h', cover: 'assets/ia/comercio-c2-pizzeria.webp', benefit: 'Pizza grande gratis cada 6 personas' },
  { id: 'c3', n: 'Cine Aurora', cat: 'cine', emoji: '🍿', addr: 'Paseo del Sol 55', hrs: '14 a 02 h', cover: 'assets/ia/comercio-c3-cine.webp', benefit: 'Combo pochoclo + gaseosa 30% off' },
  { id: 'c4', n: 'Karaoke Eco', cat: 'baile', emoji: '🎤', addr: 'Mitre 890', hrs: '20 a 04 h', cover: 'assets/ia/comercio-c4-karaoke.webp', benefit: 'Sala privada 1 hora gratis' },
  { id: 'c5', n: 'Parrilla Don Pepe', cat: 'comida', emoji: '🥩', addr: 'Belgrano 300', hrs: '12 a 16 h y 20 a 00 h', cover: 'assets/ia/comercio-c5-parrilla.webp', benefit: 'Postre de regalo para el grupo' },
  { id: 'c6', n: 'Heladería Polo', cat: 'comida', emoji: '🍦', addr: 'Plaza Central', hrs: '14 a 23 h', cover: 'assets/ia/comercio-c6-heladeria.webp', benefit: '2x1 en cucuruchos' },
  { id: 'c7', n: 'Fútbol 5 La Doce', cat: 'deporte', emoji: '⚽', addr: 'Ruta 9 km 4', hrs: '16 a 00 h', cover: 'assets/ia/comercio-c7-futbol5.webp', benefit: 'Chalecos y pelota incluidos' },
  { id: 'c8', n: 'Escape Room Enigma', cat: 'aventura', emoji: '🗝️', addr: 'San Martín 1020', hrs: '15 a 23 h', cover: 'assets/ia/comercio-c8-escape.webp', benefit: '10% off para grupos de 5 o más' }
];
const C = id => COMERCIOS.find(c => c.id === id);

const defaults = () => ({
  tab: 'grupo',
  set: { freq: 'normal', muted: false, tone: 'juguetón', useChat: true, usePhotos: true, usePlans: true, excluded: [] },
  memory: [{ id: 1, t: 'A Nico le encanta la pizza con ananá (y lo niega)' }, { id: 2, t: 'Los viernes suelen salir a comer' }],
  chat: [
    { t: 'u', who: 'sofi', text: 'Mañana arranco el gym 💪', time: '2:10 p. m.', r: { '💪': 3 } },
    { t: 'u', who: 'nico', text: 'Eso dijiste el lunes 😂', time: '2:11 p. m.', r: { '😂': 2 } },
    { t: 'ai', text: 'Tu “mañana” ya tiene más temporadas que una serie 😏', card: { type: 'reto', id: 'gym' }, time: '2:11 p. m.' },
    { t: 'u', who: 'sofi', text: 'JAJA esta vez voy', time: '2:13 p. m.' },
    { t: 'u', who: 'lau', text: 'Yo te acompaño', time: '2:14 p. m.', r: { '❤️': 1 } },
    { t: 'u', who: 'mati', text: 'día 1 ✅ (vale el fútbol 5)', img: 'assets/ia/recuerdo-6-futbol.webp', time: '2:20 p. m.', r: { '🔥': 2 } }
  ],

  retos: [{ id: 'gym', title: '3 días de gym', goal: 3, status: 'activo', join: ['sofi', 'lau'], pass: [], done: { sofi: 1, lau: 1 }, sim: true }],
  plans: [
    { id: 'p1', title: 'Bowling con la banda', when: 'Hoy · 20:30', cat: 'juegos', emoji: '🎳', com: 'c1', status: 'propuesto', open: false,
      options: [{ l: '🎳 Strike Bowling · 20:30', v: ['sofi', 'nico', 'mati'] }, { l: '🍕 La Piccola · pizza y peli', v: ['lau'] }, { l: '🎤 Karaoke Eco', v: ['caro'] }], attend: { sofi: 'si', nico: 'si', mati: 'si', lau: 'quiza', caro: null, yo: null } },
    { id: 'p2', title: 'Asado del domingo', when: 'Dom · 14:00', cat: 'comida', emoji: '🥩', com: 'c5', status: 'confirmado', open: false,
      options: [{ l: 'Asado del domingo', v: ['sofi', 'nico', 'mati', 'lau', 'caro'] }], attend: { sofi: 'si', nico: 'si', mati: 'si', lau: 'si', caro: 'quiza', yo: 'si' } }
  ],
  game: { round: 0, picked: null, voted: false, wins: [] },
  daily: { streak: 11, done: ['sofi', 'nico', 'lau', 'caro'] },
  counter: 0
});
let S = Object.assign(defaults(), load() || {});
S.set = Object.assign(defaults().set, S.set || {});
if (!S.chatV2) { S.chat = defaults().chat; S.chatV2 = true; }
S.chat = S.chat.filter(m => !(m.img && String(m.img).startsWith('blob:')));
let UPLOADS = []; // fotos locales (no se guardan)
let typing = false;
let flashPose = null;
let heroMascot = null, groupMascot = null, chatMascot = null, landingTimer = null;

/* ---------- utilidades UI ---------- */
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }
function openModal(html) { $('#modal-body').innerHTML = `<div class="modal-in">${html}</div>`; const d = $('#modal'); if (!d.open) d.showModal(); }
function closeModal() { const d = $('#modal'); if (d.open) d.close(); }
$('#modal').addEventListener('click', e => { if (e.target === $('#modal')) closeModal(); });
/* Íconos propios de la barra (SVG, no emojis del sistema) */
const ICON = {
  grupo: '<img class="stk" src="assets/ia/icono-llama.webp" alt="">',
  chat: '<img class="stk" src="assets/ia/icono-corazon.webp" alt="">',
  planes: '<img class="stk" src="assets/ia/icono-calendario.webp" alt="">',
  jugar: '<img class="stk" src="assets/ia/icono-trivia.webp" alt="">',
  recuerdos: '<img class="stk" src="assets/ia/icono-camara.webp" alt="">'
};
const TABS = [['grupo', '', 'Hoy'], ['chat', '', 'Chat'], ['planes', '', 'Planes'], ['jugar', '', 'Jugar'], ['recuerdos', '', 'Media']];
const TITLES = { grupo: 'Hoy', chat: 'Chat', jugar: 'Jugar', planes: 'Planes', recuerdos: 'Media' };
const tone = o => o[S.set.tone] || o['juguetón'];

/* ---------- landing ---------- */
const SCENES = [
  ['celular', 'Mmm… ¿qué armamos hoy? 📱'], ['risas', 'JAJAJA “mañana arranco el gym”… ¿otra vez?'], ['sorpresa', '¡¿Ya votaron todos?!'],
  ['compu', 'Armando el plan… ya casi 💻'], ['triste', 'Si me silencian, me pongo triste 🥺'], ['enojada', '¡Dijeron que venían! 😤'], ['manos', 'Yo solo propongo… ustedes deciden 😏'], ['corazon', 'Los quiero, grupo ❤️'], ['aventura', 'Plan de finde: ¿se suman?'], ['recompensa', '¡Reto cumplido! +1 vida ⭐'], ['gaming', '¿Quién del grupo…? 🎮'],
  ['baile', '¡Sale baile esta noche! 🕺'], ['cine', 'Viernes de peli. Yo traigo pochoclo 🍿']
];
function startLanding() {
  const host = $('#hero-mascot'), speech = $('#hero-speech'), dots = $('#hero-dots');
  heroMascot = createMascot(host, SCENES[0][0]);
  dots.innerHTML = SCENES.map((_, i) => `<i data-i="${i}"></i>`).join('');
  let i = 0;
  const show = n => {
    i = (n + SCENES.length) % SCENES.length;
    heroMascot.set(SCENES[i][0]);
    speech.textContent = SCENES[i][1]; speech.classList.remove('pop'); void speech.offsetWidth; if (!REDUCED) speech.classList.add('pop');
    $$('i', dots).forEach((d, k) => d.classList.toggle('on', k === i));
  };
  show(0);
  const run = () => { clearInterval(landingTimer); if (REDUCED) return; landingTimer = setInterval(() => { if (!document.hidden) show(i + 1); }, 3200); };
  run();
  host.addEventListener('click', () => { show(i + 1); run(); });
  dots.style.pointerEvents = 'auto';
  dots.addEventListener('click', e => { const d = e.target.closest('i'); if (d) { show(+d.dataset.i); run(); } });
}
const enterApp = () => { clearInterval(landingTimer); $('#landing').hidden = true; $('#app').hidden = false; go(S.tab); window.scrollTo(0, 0); if (!S.seenGuide) { S.seenGuide = true; save(); setTimeout(guide, 500); } };
$$('[data-enter]').forEach(b => { b.onclick = enterApp; });

/* aparición suave al hacer scroll (sin movimiento si el usuario lo desactivó) */
if ('IntersectionObserver' in window && !REDUCED) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));
} else { $$('.reveal').forEach(el => el.classList.add('in')); }

/* sección "tu grupo, tu vibra": cada grupo cambia la pose y el título */
const VIBES = [
  ['risas', 'Los de siempre', 'Bowling hoy 20:30. Se suman 3.'],
  ['aventura', 'Finde en la costa', 'Faltan 9 días. ¿Quién lleva el mate?'],
  ['foodie', 'Noche de pizzas', 'Votación en curso: pizza o parrilla.'],
  ['futbol', 'Peña de fútbol 5', 'La cancha la reserva una persona, no yo 😉'],
  ['baile', 'Previa del sábado', 'Armé la playlist para el camino.']
];
if ($('#vibe-list')) {
  const vm = createMascot($('#vibe-mascot'), VIBES[0][0]);
  $('#vibe-list').innerHTML = VIBES.map((v, i) => `<button class="vibe-item ${i ? '' : 'on'}" data-i="${i}"><b>${v[1]}</b><span>Gather: ${v[2]}</span></button>`).join('');
  const setVibe = i => { vm.set(VIBES[i][0]); $('#vibe-title').textContent = VIBES[i][1]; $$('.vibe-item').forEach((b, k) => b.classList.toggle('on', k === i)); };
  $('#vibe-list').addEventListener('click', e => { const b = e.target.closest('.vibe-item'); if (b) setVibe(+b.dataset.i); });
}
const backToLanding = () => { $('#app').hidden = true; $('#landing').hidden = false; startLanding(); window.scrollTo(0, 0); };
$('#back-landing').onclick = $('#back-landing-2').onclick = backToLanding;
$('#open-settings').onclick = $('#open-settings-2').onclick = () => settings();

/* ---------- sugerencia diaria de Gather ---------- */
const SUGG = [
  { com: 'c6', t: 'Domingo de helado: 2x1 en cucuruchos y todos de acuerdo 🍦' },
  { com: 'c1', t: 'Arranquemos la semana con bowling. Hoy hay 2 pistas al precio de 1 🎳' },
  { com: 'c2', t: 'Martes de pizza. Si van 6, una grande sale gratis 🍕' },
  { com: 'c3', t: 'Mitad de semana, peli. El combo de pochoclo tiene 30% off 🍿' },
  { com: 'c8', t: '¿Y si salen del chat y se encierran a resolver un enigma? 🗝️' },
  { com: 'c4', t: 'Viernes de karaoke: sala privada 1 hora gratis 🎤' },
  { com: 'c7', t: 'Sábado de fútbol 5: chalecos y pelota incluidos ⚽' }
];
const todayKey = () => new Date().toISOString().slice(0, 10);
function suggestionHTML() {
  if (S.sugDismissed === todayKey()) return '';
  const sg = SUGG[new Date().getDay() % SUGG.length], c = C(sg.com);
  return `<section class="sugg" aria-label="Sugerencia de Gather">
    <img class="sg-m" src="assets/manos.webp" alt="">
    <div class="sg-body"><small>SUGERENCIA DE GATHER</small><p>${esc(sg.t)}</p>
      <span class="tag">⭐ ${esc(c.benefit)} · ${esc(c.n)} (ficticio)</span>
      <div class="actions"><button class="btn btn-red btn-sm" data-act="sug-make" data-com="${c.id}">Armar el plan</button><button class="btn btn-soft btn-sm" data-act="sug-hide">Ahora no</button></div></div>
  </section>`;
}

/* ---------- guía rápida ---------- */
function guide() {
  const it = [['llama', 'Hoy', 'Lo del día: tu reto, la foto del día y el plan.'], ['corazon', 'Chat', 'Hablá con tu grupo. Gather responde cuando lo nombran o cuando hay un plan.'], ['calendario', 'Planes', 'Elegí un comercio, votá y confirmá. Gather no reserva ni paga nada.'], ['trivia', 'Jugar', 'Votá quién del grupo… y mirá los resultados.'], ['camara', 'Media', 'Fotos y recaps del grupo.']];
  openModal(`<div class="modal-head"><h2>Cómo se usa</h2><button class="x" data-act="close" aria-label="Cerrar">✕</button></div>
   <div class="guide">${it.map(([i, t, d]) => `<div class="g-item"><img src="assets/ia/icono-${i}.webp" alt=""><div><b>${t}</b><span>${d}</span></div></div>`).join('')}</div>
   <p class="muted">Todo es una demostración: las personas, los comercios y las respuestas de Gather son ficticios.</p>
   <button class="btn btn-red" data-act="close">Entendido</button>`);
}
$('#open-guide').onclick = guide;

/* ---------- navegación ---------- */
function go(tab) {
  S.tab = tab; save();
  const btns = TABS.map(([k, , n]) => `<button data-act="go" data-tab="${k}" ${k === tab ? 'aria-current="page"' : ''}><span class="ic">${ICON[k]}</span><span class="lb">${n}</span></button>`).join('');
  $('#nav').innerHTML = btns; $('#tabbar').innerHTML = btns;
  $('#top-sub').textContent = TITLES[tab]; $('#top-stack').innerHTML = MEMBERS.slice(0, 3).map(m => av(m.id, 'sm')).join('') + `<span class="more">+${MEMBERS.length - 3}</span>`;
  $('#view').className = 'view tab-' + tab;
  pill(); render(); window.scrollTo(0, 0);
}
function pill() {
  const s = S.set; $('#status-pill').textContent = s.muted ? '🔇 Gather en silencio' : `Gather · ${{ callado: 'Callado', normal: 'Normal', charlatan: 'Charlatán' }[s.freq]} · ${s.tone}`;
  syncSide();
}
/* Gather "pícaro" asoma por un costado de la app (solo con el tono pícaro y sin silenciar) */
function syncSide() {
  let el = $('#side-mascot');
  const on = S.set.tone === 'pícaro' && !S.set.muted && !$('#app').hidden;
  if (on && !el) {
    el = document.createElement('button'); el.id = 'side-mascot'; el.className = 'side-mascot'; el.setAttribute('aria-label', 'Gather, versión pícara');
    el.innerHTML = '<img src="assets/picardia.webp" alt="">';
    el.onclick = () => { el.classList.add('out'); toast('😏 Ya sé lo que están pensando'); setTimeout(() => el.classList.remove('out'), 2200); };
    $('#app').appendChild(el);
  }
  if (el) el.hidden = !on;
}
function render() { ({ grupo: vGrupo, chat: vChat, jugar: vJugar, planes: vPlanes, recuerdos: vRecuerdos }[S.tab] || vGrupo)(); }

/* =========================== GRUPO + CHARLA =========================== */
function retoCard(id) {
  const r = S.retos.find(x => x.id === id); if (!r) return '';
  const joined = r.join.map(i => M(i).n).join(', ') || '—', passed = r.pass.map(i => M(i).n).join(', ');
  const mine = r.join.includes('yo') ? 'join' : r.pass.includes('yo') ? 'pass' : null;
  const act = r.status !== 'activo' ? `<span class="state st-${r.status}">${r.status}</span>` : mine ? `<span class="badge" style="background:rgba(255,255,255,.22);color:#fff">${mine === 'join' ? 'Te sumaste ✓' : 'Pasaste'}</span>` :
    `<button class="btn btn-lime btn-sm" data-act="reto-join" data-id="${r.id}" data-v="1">✓ Me sumo</button><button class="btn btn-ghost btn-sm" data-act="reto-join" data-id="${r.id}" data-v="0">Paso</button>`;
  return `<div class="actions" style="margin-top:10px;display:grid;gap:8px"><b>🏋️ Reto: ${esc(r.title)}</b><div class="actions" style="margin:0">${act}</div><div class="tally">Se suman: ${esc(joined)}${passed ? ` · Pasan: ${esc(passed)}` : ''}</div></div>`;
}
function ideasCard(m) {
  return `<div class="actions" style="display:grid;gap:8px;margin-top:10px">${m.options.map(o => `<span class="badge" style="background:rgba(255,255,255,.22);color:#fff;font-size:13px;padding:7px 12px">${esc(o)}</span>`).join('')}
  <div class="actions" style="margin:0">${m.done ? `<span class="badge" style="background:rgba(255,255,255,.22);color:#fff">Votación armada en Planes ✓</span>` : `<button class="btn btn-lime btn-sm" data-act="ideas-make" data-i="${m.idx}">Armar votación</button>`}</div></div>`;
}
const fakeTime = i => { const t = 14 * 60 + 8 + i * 4; const h = Math.floor(t / 60), mi = t % 60; return `${h > 12 ? h - 12 : h}:${String(mi).padStart(2, '0')} p. m.`; };
const nowTime = () => new Date().toLocaleTimeString('es-AR', { hour: 'numeric', minute: '2-digit' });
function reactBar(m, i) {
  const items = Object.entries(m.r || {}).map(([e, n]) => `<button class="rx ${m.mine && m.mine[e] ? 'on' : ''}" data-act="react" data-i="${i}" data-e="${e}">${e} ${n}</button>`).join('');
  return `<div class="rxs">${items}<button class="rx add" data-act="react" data-i="${i}" data-e="❤️" aria-label="Reaccionar">＋</button></div>`;
}
function msgHTML(m, i) {
  const time = m.time || fakeTime(i);
  if (m.t === 'u') {
    const me = m.who === 'yo';
    return `<div class="msg ${me ? 'me' : ''}"><span class="stkav">${av(m.who, 'sm')}</span><div class="bub">${me ? '' : `<b style="color:${M(m.who).c}">${M(m.who).n}</b>`}${m.img ? `<img class="mimg" src="${m.img}" alt="Foto enviada">` : ''}${m.text ? `<span class="mt">${esc(m.text)}</span>` : ''}<span class="mm">${esc(time)}${me ? ' ✓✓' : ''}</span>${reactBar(m, i)}</div></div>`;
  }
  const extra = m.card?.type === 'reto' ? retoCard(m.card.id) : m.card?.type === 'ideas' ? ideasCard({ ...m.card, idx: i }) : '';
  return `<div class="msg ai"><div class="ai-card"><div class="ai-head">✨ Gather <span class="badge">IA</span> <span class="badge">guionada · demo</span><span class="mm">${esc(time)}</span></div><p>${esc(m.text)}</p>${extra}<img class="ai-stk" src="assets/risas.webp" alt=""></div></div>`;
}
const FACE_TIMES = { sofi: '6:00 AM', nico: '11:12 a. m.', lau: '2:33 p. m.', caro: '4:05 p. m.', mati: '5:40 p. m.' };
function dayInfo() { const d = new Date(); return [d.toLocaleDateString('es-AR', { weekday: 'long' }).toUpperCase(), d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })]; }
function vGrupo() {
  const [dia, fecha] = dayInfo();
  const reto = S.retos.find(r => r.status === 'activo');
  const plan = S.plans.find(p => p.status !== 'archivado');
  const d = S.daily, all = d.done.length >= 6;
  const myVoted = plan && (plan.status === 'confirmado' || plan.options.some(o => o.v.includes('yo')));
  const steps = [
    { t: 'Subí tu foto del día', ok: S.daily.done.includes('yo'), btn: 'Subir foto', act: 'scroll-foto', data: '' },
    reto ? { t: `Sumate al reto “${reto.title}”`, ok: reto.join.includes('yo'), btn: 'Me sumo', act: 'reto-join', data: `data-id="${reto.id}" data-v="1"` } : { t: 'Pedile un reto a Gather en el chat', ok: false, btn: 'Ir al chat', act: 'go', data: 'data-tab="chat"' },
    plan ? { t: `Votá el plan: ${plan.title}`, ok: !!myVoted, btn: 'Ver plan', act: 'go', data: 'data-tab="planes"' } : { t: 'Armá un plan en un comercio', ok: false, btn: 'Armar plan', act: 'plan-new', data: '' }
  ];
  const nDone = steps.filter(x => x.ok).length;
  const todoHTML = `<section class="todo" aria-label="Tu día en 3 pasos"><div class="todo-head"><h3 class="cond">TU DÍA EN 3 PASOS</h3><span class="pill">${nDone} de 3</span></div>
    ${steps.map((x, i) => `<div class="step ${x.ok ? 'done' : ''}"><i>${x.ok ? '✓' : i + 1}</i><span>${esc(x.t)}</span>${x.ok ? '' : `<button class="btn btn-red btn-sm" data-act="${x.act}" ${x.data}>${x.btn}</button>`}</div>`).join('')}
    ${nDone === 3 ? '<p class="todo-ok">¡Listo! Completaste tu día 🎉</p>' : ''}</section>`;
  const fp = flashPose; flashPose = null;
  const bubble = fp ? fp.say : S.set.muted ? 'Estoy en silencio. Avisame si me necesitan 🤐' : tone({ tranquilo: 'Cuando quieran, yo ayudo.', juguetón: 'Dale, sorprendanme.', pícaro: 'Apuesto a que nadie decide nada… 😏' });

  let retoHTML;
  if (reto) {
    const tot = reto.join.length * reto.goal || 1, got = Object.entries(reto.done).filter(([k]) => reto.join.includes(k)).reduce((a, [, v]) => a + v, 0);
    const me = reto.join.includes('yo'), meDone = reto.done.yo || 0;
    retoHTML = `<section class="streak" aria-label="Reto activo">
      <div class="st-top"><div><h3 class="cond">${esc(reto.title)}</h3><span class="pill">${got}/${tot} check-ins${reto.sim ? ' · el resto simulado' : ''}</span></div>
      <div class="flame"><img class="ico" src="assets/ia/icono-llama.webp" alt=""><b>${d.streak}</b><small>RACHA DEL GRUPO</small></div></div>
      <div class="st-faces">${reto.join.map(id => `<div class="stf">${av(id, 'xl', (reto.done[id] || 0) > 0 ? '<i class="ck">✓</i>' : '')}<small>${M(id).n}</small></div>`).join('')}${me ? '' : '<div class="stf"><span class="av xl ghost">tú</span><small>vos</small></div>'}</div>
      <div class="bar"><i style="width:${Math.min(100, got / tot * 100)}%"></i></div>
      <div class="actions">${me ? `<button class="btn btn-lime" data-act="reto-check" data-id="${reto.id}" ${meDone >= reto.goal ? 'disabled' : ''}>✓ Hoy cumplí (${meDone}/${reto.goal})</button>` : `<button class="btn btn-lime" data-act="reto-join" data-id="${reto.id}" data-v="1">Me sumo</button>`}<button class="btn btn-ghost" data-act="reto-archive" data-id="${reto.id}">Archivar</button></div>
    </section>`;
  } else {
    retoHTML = `<section class="streak calm"><h3 class="cond">SIN RETOS ACTIVOS</h3><p>Escribí “mañana arranco el gym” en el chat y Gather arma uno.</p><button class="btn btn-lime" data-act="go" data-tab="chat">Ir al chat</button></section>`;
  }

  const tiles = MEMBERS.filter(m => m.id !== 'yo').map(m => {
    const ok = d.done.includes(m.id);
    return `<div class="dtile ${ok ? '' : 'wait'}" style="background-image:url(${m.photo})"><em>${ok ? FACE_TIMES[m.id] : '· · ·'}</em><s>${m.n}${ok ? '' : ' · falta'}</s></div>`;
  }).join('');
  const you = UPLOADS[0]
    ? `<div class="dtile" style="background-image:url(${UPLOADS[0]})"><em>${new Date().toLocaleTimeString('es-AR', { hour: 'numeric', minute: '2-digit' })}</em><s>vos</s></div>`
    : `<label class="dtile you"><input id="photo" type="file" accept="image/*" hidden><img class="cam" src="assets/ia/icono-camara.webp" alt=""><b>SUBÍ LA TUYA</b><small>se queda en tu navegador</small></label>`;

  const co = plan && C(plan.com), cat = plan && (CAT[plan.cat] || CAT.comida);
  const planHTML = plan ? `<section class="pcard" style="background-image:linear-gradient(transparent 28%,rgba(0,0,0,.72)),${co && co.cover ? `url(${co.cover})` : 'linear-gradient(135deg,#ff8a3d,#e11d3f)'}">
      ${co ? `<span class="tag">⭐ ${esc(co.benefit)}</span>` : ''}
      <h3 class="cond">${esc(plan.title)}</h3><small>${esc(plan.when)} · ${Object.values(plan.attend).filter(a => a === 'si').length} se suman${co ? ' · comercio ficticio' : ''}</small>
      <button class="btn btn-lime btn-sm" data-act="go" data-tab="planes">Ver plan</button></section>` : '';

  $('#view').innerHTML = `
    <div class="v-title"><b>HOY · ${dia}</b><small>${fecha}</small></div>
    <p class="v-sub">Lo que pasa hoy en el grupo. Empezá por los 3 pasos.</p>
    ${todoHTML}
    ${suggestionHTML()}
    <section class="gstrip" aria-label="Gather">
      <div class="mascot-wrap" id="grp-mascot" data-size="md"></div>
      <div class="gs-text"><h2 class="cond">¿QUÉ ARMAMOS HOY?</h2><div class="bubble" id="grp-say">${esc(bubble)}</div>
        <div class="gs-actions"><button class="btn btn-lime" data-act="go" data-tab="jugar">Jugar ahora</button><button class="btn btn-soft" data-act="plan-new">Armar un plan</button></div></div>
    </section>
    ${retoHTML}
    <div class="v-title"><b>LA FOTO DEL DÍA</b><small>${all ? '¡todos cumplieron!' : `${d.done.length} de 6`}</small><span class="pill dark"><img class="ico-s" src="assets/ia/icono-llama.webp" alt="">racha ${d.streak}</span></div>
    <div class="dfeed">${you}${tiles}</div>
    <p class="note">Las fotos de los demás son simuladas. La tuya se queda en este navegador: no se sube a ningún servidor.</p>
    ${planHTML ? `<div class="v-title"><b>EL PLAN</b><small>de hoy</small></div>${planHTML}` : ''}`;
  groupMascot = createMascot($('#grp-mascot'), fp ? fp.p : (S.set.muted ? 'triste' : (all ? 'recompensa' : 'risas')));
  const ph = $('#photo');
  if (ph) ph.onchange = () => {
    const f = ph.files[0]; if (!f) return;
    UPLOADS.unshift(URL.createObjectURL(f)); S.daily.done.push('yo'); save(); vGrupo(); toast('Foto guardada acá, en tu navegador 📸');
    setTimeout(() => { if (!S.daily.done.includes('mati')) S.daily.done.push('mati'); if (S.daily.done.length >= 6) { S.daily.streak++; toast('¡Todos cumplieron! Racha +1 ⭐'); } save(); if (S.tab === 'grupo') vGrupo(); }, 1400);
  };
}
function vChat() {
  const reto = S.retos.find(r => r.status === 'activo');
  const pin = reto ? (() => { const tot = reto.join.length * reto.goal || 1, got = Object.entries(reto.done).filter(([k]) => reto.join.includes(k)).reduce((a, [, v]) => a + v, 0); return `<div class="pin-streak"><img src="assets/ia/icono-llama.webp" alt=""><div><b>${esc(reto.title)}</b><small>${got}/${tot} check-ins · racha ${S.daily.streak}</small></div><button data-act="go" data-tab="grupo">Ver</button></div>`; })() : '';
  $('#view').innerHTML = `<section class="chatv" aria-label="Chat del grupo">
    <div class="chat-head"><div class="mascot-wrap" id="chat-mascot" data-size="sm"></div><div><b>Gather</b><small>Responde cuando lo nombran</small></div><span class="badge ai">IA</span></div>
    ${pin}
    <div class="day-chip">HOY</div>
    <div class="chat-log" id="chat-log" role="log" aria-live="polite">${S.chat.map(msgHTML).join('')}</div>
    <div class="chat-quick">${['Mañana arranco el gym', '¿Qué hacemos hoy?', '@gather contame algo'].map(q => `<button class="chip" data-act="quick" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <form class="chat-form" id="chat-form">
      <label class="cambtn" aria-label="Enviar una foto"><input id="chat-photo" type="file" accept="image/*" hidden><img src="assets/ia/icono-camara.webp" alt=""></label>
      <div class="pillin"><input id="chat-in" type="text" autocomplete="off" placeholder="Escribile al grupo… probá: gym" aria-label="Mensaje"><span class="plus" aria-hidden="true">＋</span></div>
      <button class="send" type="submit" aria-label="Enviar">➤</button>
    </form>
  </section>`;
  chatMascot = createMascot($('#chat-mascot'), S.set.muted ? 'triste' : 'risas');
  const log = $('#chat-log'); log.scrollTop = log.scrollHeight;
  $('#chat-form').onsubmit = e => { e.preventDefault(); const v = $('#chat-in').value.trim(); if (v) { $('#chat-in').value = ''; say('yo', v); } };
  $('#chat-photo').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    S.chat.push({ time: nowTime(), t: 'u', who: 'yo', text: '', img: URL.createObjectURL(f) }); append(S.chat.length - 1);
    toast('Foto enviada al chat (queda en tu navegador)'); e.target.value = '';
  };
}
function retoRow(r) {
  const tot = r.join.length * r.goal || 1, got = Object.entries(r.done).filter(([k]) => r.join.includes(k)).reduce((a, [, v]) => a + v, 0);
  const meDone = r.done.yo || 0, mine = r.join.includes('yo');
  return `<div class="row" style="grid-template-columns:1fr"><div style="display:grid;gap:8px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><div class="t">🏋️ ${esc(r.title)}</div><span class="state st-activo">activo</span></div>
  <div class="bar"><i style="width:${Math.min(100, got / tot * 100)}%"></i></div>
  <div class="s">${r.join.map(i => M(i).n).join(', ') || 'Nadie se sumó todavía'} · ${got}/${tot} check-ins ${r.sim ? '(los demás: simulado)' : ''}</div>
  <div class="tag-row">${mine ? `<button class="btn btn-red btn-sm" data-act="reto-check" data-id="${r.id}" ${meDone >= r.goal ? 'disabled' : ''}>✓ Hoy cumplí (${meDone}/${r.goal})</button>` : `<button class="btn btn-red btn-sm" data-act="reto-join" data-id="${r.id}" data-v="1">Me sumo</button>`}<button class="btn btn-soft btn-sm" data-act="reto-archive" data-id="${r.id}">Archivar</button></div></div></div>`;
}
function setPose(p, say) { if (S.tab === 'grupo' && groupMascot) { groupMascot.set(p); if (say) { const b = $('#grp-say'); if (b) b.textContent = say; } } if (S.tab === 'chat' && chatMascot) chatMascot.set(p); }

/* motor de respuestas guionadas de Gather */
const QUIPS = {
  tranquilo: ['Anotado 🙂', 'Todo bien por acá.', 'Si necesitan algo, avisen.'],
  juguetón: ['Jajaja los quiero 😄', 'Eso va directo a los lore del grupo.', 'Sigan, que esto se pone bueno.'],
  pícaro: ['Ajá… eso lo guardo para después 😏', 'Qué casualidad que nadie confirmó nada 👀', 'Yo solo digo: hay testigos.']
};
async function say(who, text) {
  S.chat.push({ time: nowTime(), t: 'u', who, text }); append(S.chat.length - 1);
  await gather(text);
}
function append(i) {
  if (S.tab !== 'chat') return;
  const log = $('#chat-log'); if (!log) return;
  log.insertAdjacentHTML('beforeend', msgHTML(S.chat[i], i)); log.scrollTop = log.scrollHeight;
}
function remember(t) {
  if (!S.set.useChat || S.memory.some(m => m.t === t)) return;
  S.memory.push({ id: Date.now(), t });
}
async function gather(text) {
  const low = norm(text), s = S.set;
  if (s.muted) return;
  if (s.excluded.some(w => w.trim() && low.includes(norm(w)))) return;
  const mention = /gather/.test(low);
  if (!s.useChat && !mention) return;
  const isGym = /gym|entren|correr|dieta/.test(low), isPlan = /que hacemos|salir|hoy|plan|tengo ganas/.test(low);
  S.counter++;
  let reply = null;
  if (isGym && s.freq !== 'callado' || (isGym && mention)) {
    const ex = S.retos.find(r => r.status === 'activo' && /gym/i.test(r.title));
    if (!ex) S.retos.push({ id: 'r' + Date.now(), title: '3 días de gym', goal: 3, status: 'activo', join: [], pass: [], done: {}, sim: true });
    const id = (ex || S.retos[S.retos.length - 1]).id;
    reply = { text: tone({ tranquilo: 'Buen plan. ¿Lo hacemos reto de 3 días entre todos?', juguetón: 'Tu “mañana” ya tiene más temporadas que una serie 😏 ¿Lo hacemos reto?', pícaro: 'Ajá, el lunes también arrancabas… 😈 ¿Reto de 3 días y vemos quién aguanta?' }), card: { type: 'reto', id }, pose: 'manos', bubble: 'Ya sé que van a decir “mañana”…' };
    remember('Alguien del grupo quiere empezar el gym');
  } else if ((isPlan && s.freq !== 'callado') || (isPlan && mention)) {
    reply = { text: tone({ tranquilo: 'Puedo proponer tres opciones y que voten, si quieren.', juguetón: '¡Yo tengo ideas! Tres opciones, voten y listo 🎉', pícaro: 'Ya sé que van a debatir 40 minutos. Les armo tres opciones 😏' }), card: { type: 'ideas', coms: ['c1', 'c2', 'c4'], options: ['c1', 'c2', 'c4'].map(id => `${C(id).emoji} ${C(id).n} · ${C(id).benefit}`), done: false }, pose: 'foodie', bubble: 'Opciones, opciones…' };
  } else if (mention) {
    reply = { text: tone({ tranquilo: 'Acá estoy. Propongo, ustedes deciden.', juguetón: '¡Acá estoy! Yo propongo, ustedes mandan 😎', pícaro: 'Me nombraron… ¿qué hicieron? 👀' }), pose: 'sorpresa' };
  } else if (s.freq === 'charlatan' || (s.freq === 'normal' && S.counter % 4 === 0)) {
    const q = QUIPS[s.tone] || QUIPS['juguetón']; reply = { text: q[S.counter % q.length], pose: 'risas' };
  }
  if (!reply) return;
  typing = true; const log = $('#chat-log');
  if (log && S.tab === 'chat') { log.insertAdjacentHTML('beforeend', '<div class="msg ai" id="typing"><div class="ai-card" style="padding:8px 14px"><div class="typing"><i></i><i></i><i></i></div></div></div>'); log.scrollTop = log.scrollHeight; }
  setPose('compu'); await sleep(REDUCED ? 100 : 900);
  $('#typing')?.remove(); typing = false;
  S.chat.push({ time: nowTime(), t: 'ai', text: reply.text, card: reply.card }); save(); append(S.chat.length - 1); setPose(reply.pose, reply.bubble);
}

/* =========================== JUGAR =========================== */
const QS = ['… dice “ya salgo” y sigue en casa?', '… llega siempre 20 minutos tarde?', '… lloraría primero viendo una peli?', '… sobreviviría una semana sin celular?', '… pagaría la cuenta y diría “tranqui”?'];
function fakeVotes(round, mine) { // determinista: mismos "votos" cada vez que se juega esa ronda (simulado)
  const v = {}; MEMBERS.forEach(m => v[m.id] = 0); v[mine]++;
  ['sofi', 'nico', 'mati', 'lau', 'caro'].forEach((id, k) => { const pick = MEMBERS[(round * 3 + k * 2 + (k % 2)) % 6].id; v[pick]++; });
  return v;
}
function vJugar() {
  const g = S.game, i = g.round;
  if (i >= QS.length) return vFin();
  const res = g.voted ? fakeVotes(i, g.picked) : null;
  let body;
  if (!res) {
    body = `<div class="cands">${MEMBERS.map(m => `<button class="cand" data-act="g-pick" data-id="${m.id}" aria-pressed="${g.picked === m.id}">${av(m.id)}${m.n}</button>`).join('')}</div>
    <div class="muted" style="color:#ffd6dc">4 de 6 votaron (los demás: simulado)</div>
    <button class="btn btn-lime" data-act="g-vote" ${g.picked ? '' : 'disabled'}>Votar</button>`;
  } else {
    const max = Math.max(...Object.values(res)), win = MEMBERS.filter(m => res[m.id] === max).map(m => m.n).join(' y ');
    body = `<div style="display:grid;gap:8px;width:100%;justify-items:center">${[...MEMBERS].sort((a, b) => res[b.id] - res[a.id]).map(m => `<div class="res-row"><span>${m.n}</span><div class="bar"><i style="width:${res[m.id] / 6 * 100}%"></i></div><b>${res[m.id]}</b></div>`).join('')}</div>
    <div class="win">🏆 ${esc(win)}</div><div class="muted" style="color:#ffd6dc">Tu voto es real; los otros cinco son simulados.</div>
    <button class="btn btn-lime" data-act="g-next">${i === QS.length - 1 ? 'Ver resumen' : 'Siguiente ronda →'}</button>`;
  }
  $('#view').innerHTML = `<p class="v-sub">Votá a la persona a la que mejor le queda la frase. Después ves los resultados.</p><section class="card red game"><div class="round">Ronda ${i + 1} de ${QS.length}</div>
    <div class="progress-dots">${QS.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>
    <div class="mascot-wrap" id="game-mascot" data-size="md"></div>
    <h2 class="q">¿Quién del grupo${esc(QS[i])}</h2>${body}</section>`;
  const gm = createMascot($('#game-mascot'), g.voted ? 'sorpresa' : 'gaming');
  if (g.voted) { const max = Math.max(...Object.values(res)); setTimeout(() => gm.set('recompensa'), 700); }
}
function vFin() {
  const wins = {}; S.game.wins.forEach(w => w.split(' y ').forEach(n => wins[n] = (wins[n] || 0) + 1));
  const top = Object.entries(wins).sort((a, b) => b[1] - a[1]);
  $('#view').innerHTML = `<section class="card red game"><div class="round">¡Terminaron las 5 rondas!</div><div class="mascot-wrap" id="game-mascot" data-size="lg"></div>
  <h2 class="q">${top.length ? `El/la más votado/a: ${esc(top[0][0])}` : 'Fin del juego'}</h2>
  <div style="display:grid;gap:8px;width:100%;max-width:520px">${top.map(([n, c]) => `<div class="res-row"><span>${esc(n)}</span><div class="bar"><i style="width:${c / 5 * 100}%"></i></div><b>${c}</b></div>`).join('')}</div>
  <div class="muted" style="color:#ffd6dc">Resultado con votos de los demás simulados.</div>
  <div class="hg-actions"><button class="btn btn-lime" data-act="g-restart">Jugar de nuevo</button><button class="btn btn-soft" data-act="go" data-tab="planes">Armar un plan</button></div></section>`;
  createMascot($('#game-mascot'), 'recompensa');
}

/* =========================== PLANES =========================== */
const ATT = { si: 'Me sumo', quiza: 'Quizás', no: 'No puedo' };
function splitHTML(p, n) {
  n = Math.max(1, n); const t = p.total || 0;
  return `<details class="more split"><summary><img class="ico-s" src="assets/ia/icono-alcancia.webp" alt=""> Dividir la cuenta</summary>
   <label class="sp-l">Total de la cuenta ($)<input class="sp-in" type="number" inputmode="numeric" min="0" step="100" placeholder="Ej: 24000" value="${t || ''}" data-split="${p.id}"></label>
   <div class="sp-res" id="sp-${p.id}">${t ? `Cada uno: <b>$${Math.ceil(t / n).toLocaleString('es-AR')}</b> · ${n} personas` : `Se reparte entre ${n} personas que dijeron que van.`}</div>
   <button class="btn btn-soft btn-sm" data-act="split-copy" data-id="${p.id}">Copiar mensaje para el grupo</button>
   <span class="muted">Solo hace la cuenta: Gather no cobra ni transfiere dinero.</span></details>`;
}
function planCard(p) {
  const c = CAT[p.cat] || CAT.comida, co = C(p.com), going =Object.entries(p.attend).filter(([, a]) => a === 'si').map(([k]) => k);
  const myA = p.attend.yo, tot = p.options.reduce((a, o) => a + o.v.length, 0) || 1;
  return `<article class="card plan" id="${p.id}">
    <div class="plan-img" style="background:${co && co.cover ? `linear-gradient(transparent 40%,rgba(0,0,0,.5)),center/cover url(${co.cover})` : c.bg}"><span>${co && co.cover ? '' : p.emoji}</span>${co ? `<span class="benefit">⭐ ${esc(co.benefit)}</span>` : ''}</div>
    ${co ? `<div class="com-box"><b>${esc(co.n)}</b><span class="muted"><img class="ico-s" src="assets/ia/icono-pin.webp" alt="">${esc(co.addr)} · ${esc(co.hrs)}</span><span class="badge demo">Comercio y beneficio ficticios · demo</span></div>` : `<div class="com-box"><b>Comercio por definir</b><span class="muted">Al confirmar, queda el comercio de la opción más votada.</span></div>`}
    <div class="sec-title"><div><h3 style="margin:0">${esc(p.title)}</h3><div class="muted">${esc(p.when)}</div></div><span class="state st-${p.status}">${p.status}</span></div>
    ${p.options.length > 1 ? `<div><b>¿Cuál prefieren?</b><div class="opts" style="margin-top:8px">${p.options.map((o, k) => `<button class="opt" data-act="plan-vote" data-id="${p.id}" data-k="${k}" aria-pressed="${o.v.includes('yo')}" ${p.status === 'archivado' ? 'disabled' : ''}><span class="dot"></span><span>${esc(o.l)}</span><span class="badge">${o.v.length} · ${Math.round(o.v.length / tot * 100)}%</span></button>`).join('')}</div></div>` : ''}
    <div><b>Asistencia</b> <span class="muted">(el resto del grupo: simulado)</span>
      <div class="avatars" style="margin:8px 0">${MEMBERS.map(m => av(m.id, p.attend[m.id] === 'si' ? '' : '', p.attend[m.id] === 'si' ? '' : '')).map((h, k) => { const id = MEMBERS[k].id, a = p.attend[id]; return h.replace('style="', `style="opacity:${a === 'si' ? 1 : a === 'quiza' ? .65 : .3};`); }).join('')}</div>
      <div class="muted">${going.length} se suman · ${Object.values(p.attend).filter(a => a === 'quiza').length} quizás</div>
      <div class="seg" role="group" aria-label="Tu asistencia" style="margin-top:8px">${Object.entries(ATT).map(([k, l]) => `<button data-act="plan-att" data-id="${p.id}" data-a="${k}" aria-pressed="${myA === k}">${l}</button>`).join('')}</div></div>
    <details class="more"><summary>Más opciones</summary><div class="switch"><div class="tx"><b>Abrir a gente nueva</b><span class="muted">${p.open ? 'Abierto: cualquiera con el link puede pedir sumarse (vos aprobás). 0 solicitudes · simulado' : 'Desactivado. Solo el grupo ve este plan.'}</span></div><button class="tgl" role="switch" aria-checked="${p.open}" aria-label="Abrir a gente nueva" data-act="plan-open" data-id="${p.id}"></button></div></details>
    ${p.status === 'confirmado' ? splitHTML(p, going.length) : ''}
    <div class="tag-row">${p.status === 'propuesto' ? `<button class="btn btn-red" data-act="plan-confirm" data-id="${p.id}">Confirmar plan</button>` : ''}${p.status !== 'archivado' ? `<button class="btn btn-soft" data-act="plan-archive" data-id="${p.id}">Archivar</button>` : `<button class="btn btn-soft" data-act="plan-restore" data-id="${p.id}">Restaurar</button>`}</div>
    <p class="muted">Gather propone; nada se reserva ni se paga hasta que una persona lo confirme.</p></article>`;
}
function vPlanes() {
  const act = S.plans.filter(p => p.status !== 'archivado'), arc = S.plans.filter(p => p.status === 'archivado');
  $('#view').innerHTML = `<div class="v-title"><b>PLANES</b><small>en comercios</small><button class="btn btn-red btn-sm" data-act="plan-new">+ Nuevo plan</button></div>
  <p class="v-sub">Elegí un lugar, votá y confirmá. Gather propone, pero no reserva ni paga nada.</p>
  ${comStrip()}
  ${act.length ? `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">${act.map(planCard).join('')}</div>` : `<div class="card empty"><div class="mascot-wrap" id="pl-mascot" data-size="md"></div><h3>No hay planes activos</h3><div>Armá uno o pedile ideas a Gather.</div><button class="btn btn-red" data-act="plan-new">Armar un plan</button></div>`}
  ${arc.length ? `<details class="arch" style="margin-top:14px"><summary>Archivo (${arc.length})</summary><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">${arc.map(planCard).join('')}</div></details>` : ''}`;
  if ($('#pl-mascot')) createMascot($('#pl-mascot'), 'aventura');
}
function comStrip() {
  return `<section class="card" style="margin:14px 0"><div class="sec-title"><h3 class="cond">COMERCIOS CON BENEFICIO</h3><span class="badge demo">ficticios · demo</span></div>
  <div class="com-strip">${COMERCIOS.map(c => `<div class="com-card"><div class="com-ic" style="background:${c.cover ? `center/cover url(${c.cover})` : CAT[c.cat].bg}">${c.cover ? '' : c.emoji}</div><b>${esc(c.n)}</b><span class="muted"><img class="ico-s" src="assets/ia/icono-pin.webp" alt="">${esc(c.addr)}</span><span class="benefit-tag">⭐ ${esc(c.benefit)}</span><button class="btn btn-red btn-sm" data-act="plan-new" data-com="${c.id}">Armar plan acá</button></div>`).join('')}</div></section>`;
}
function planModal(pre) {
  openModal(`<div class="modal-head"><h2>Nuevo plan</h2><button class="x" data-act="close" aria-label="Cerrar">✕</button></div>
  <form id="plan-form" class="grid"><div class="field"><label for="pf-c">¿En qué comercio?</label><select id="pf-c">${COMERCIOS.map(c => `<option value="${c.id}" ${c.id === pre ? 'selected' : ''}>${c.emoji} ${esc(c.n)} · ${esc(c.benefit)}</option>`).join('')}<option value="">Otro lugar (sin comercio)</option></select><span class="muted">Comercios y beneficios ficticios de demostración.</span></div>
  <div class="field"><label for="pf-t">Nombre del plan</label><input id="pf-t" type="text" required maxlength="60"></div>
  <div class="field"><label for="pf-w">¿Cuándo?</label><input id="pf-w" type="text" required placeholder="Ej: Sábado · 21:00" maxlength="40"></div>
  <button type="button" class="btn btn-soft" data-act="plan-ideas">✨ Pedirle ideas a Gather (guionado)</button>
  <div class="tag-row" id="pf-ideas"></div>
  <button class="btn btn-red" type="submit">Proponer al grupo</button><p class="muted">Se crea como “propuesto”. Nadie queda comprometido ni se reserva nada hasta que una persona confirme.</p></form>`);
  const sel = $('#pf-c'), t = $('#pf-t');
  const fill = () => { const c = C(sel.value); if (c && (!t.value || t.dataset.auto)) { t.value = 'Plan en ' + c.n; t.dataset.auto = '1'; } };
  t.addEventListener('input', () => delete t.dataset.auto);
  sel.addEventListener('change', fill); fill();
  $('#plan-form').onsubmit = e => {
    e.preventDefault(); const co = C(sel.value), title = t.value.trim();
    S.plans.unshift({ id: 'p' + Date.now(), title, when: $('#pf-w').value.trim(), cat: co ? co.cat : 'comida', emoji: co ? co.emoji : '📍', com: co ? co.id : '', status: 'propuesto', open: false, options: [{ l: title, v: ['yo'] }], attend: { sofi: null, nico: null, mati: null, lau: null, caro: null, yo: 'si' } });
    save(); closeModal(); go('planes'); toast('Plan propuesto. Esperando a que el grupo responda.');
  };
}

/* =========================== RECUERDOS =========================== */
const DEMO_MEM = [['🎂', 'Cumple de Lau', 'linear-gradient(135deg,#f472b6,#9333ea)', 'assets/ia/recuerdo-1-cumple.webp'], ['🎳', 'Bowling', 'linear-gradient(135deg,#2563eb,#0b1240)', 'assets/ia/recuerdo-2-bowling.webp'], ['🍕', 'Pizzas en lo de Mati', 'linear-gradient(135deg,#ff8a3d,#e11d3f)', 'assets/ia/recuerdo-3-pizzas.webp'], ['🏖️', 'Finde en la costa', 'linear-gradient(135deg,#0d9488,#164e63)', 'assets/ia/recuerdo-4-costa.webp'], ['🎤', 'Karaoke épico', 'linear-gradient(135deg,#db2777,#6d28d9)', 'assets/ia/recuerdo-5-karaoke.webp'], ['⚽', 'Fútbol 5', 'linear-gradient(135deg,#16a34a,#14532d)', 'assets/ia/recuerdo-6-futbol.webp']];
function vRecuerdos() {
  const mes = new Date().toLocaleDateString('es-AR', { month: 'long' }).toUpperCase();
  const yoMsgs = S.chat.filter(m => m.t === 'u' && m.who === 'yo');
  const stats = [
    ['camara', S.daily.done.includes('yo') ? 1 + UPLOADS.length : UPLOADS.length, 'fotos tuyas'],
    ['corazon', yoMsgs.reduce((a, m) => a + Object.values(m.r || {}).reduce((x, y) => x + y, 0), 0), 'reacciones a tus mensajes'],
    ['calendario', S.plans.filter(p => p.status === 'confirmado').length, 'planes confirmados'],
    ['llama', S.daily.streak, 'días de racha del grupo']
  ];
  const photos = [...UPLOADS.map(u => ['', 'Tu foto de hoy', '', u]), ...DEMO_MEM];
  const recaps = [['SU SEMANA', '0:32', 'assets/ia/recuerdo-3-pizzas.webp'], ['OCTUBRE', '0:48', 'assets/ia/recuerdo-1-cumple.webp'], ['FINDE EN LA COSTA', '0:40', 'assets/ia/recuerdo-4-costa.webp'], ['FÚTBOL 5', '0:25', 'assets/ia/recuerdo-6-futbol.webp']];
  $('#view').innerHTML = `
    <div class="v-title"><b>MEDIA</b><small>fotos y momentos</small><span class="pill dark demo">datos de demostración</span></div>
    <p class="v-sub">Fotos y momentos del grupo. Gather arma los recaps.</p>
    <div class="v-title sub"><b>TU SEMANA EN GATHER</b><small>con tus números reales</small></div>
    <div class="wstats">${stats.map(([ic, n, l]) => `<div class="wst"><img src="assets/ia/icono-${ic}.webp" alt=""><b>${n}</b><small>${l}</small></div>`).join('')}</div>
    <div class="v-title sub"><b>RECAPS</b><small>los arma Gather solo (simulado)</small></div>
    <div class="recaps">${recaps.map(([t, du, im]) => `<div class="recap" style="background-image:linear-gradient(transparent 45%,rgba(0,0,0,.7)),url(${im})"><i class="play">▶</i><b>${t}</b><small>${du} · Gather</small></div>`).join('')}</div>
    <div class="v-title sub"><b>${mes}</b><div class="stack">${MEMBERS.map(m => av(m.id, 'sm')).join('')}</div><small>${photos.length}</small></div>
    <div class="collage">${photos.map(([e, t, bg, ph], k) => `<figure class="cell c${k % 6}" style="background:${ph ? 'center/cover url(' + ph + ')' : bg}">${ph ? '' : '<span class="em">' + e + '</span>'}<figcaption>${esc(t)}</figcaption><span class="stk">${av(MEMBERS[k % 5].id, 'sm')}</span></figure>`).join('')}</div>
    <div class="mpet"><div class="mascot-wrap" id="rec-mascot" data-size="md"></div><p>Yo guardo los recuerdos. Ustedes los hacen.</p></div>`;
  createMascot($('#rec-mascot'), 'pintor');
}

/* =========================== AJUSTES =========================== */
const B = k => k === 'real' ? '<span class="badge real">Funciona</span>' : '<span class="badge sim">Simulado</span>';
function settings() {
  const s = S.set;
  openModal(`<div class="modal-head"><div><h2>Ajustes de Gather</h2><div class="legend">${B('real')} cambia el comportamiento del prototipo · ${B('sim')} solo muestra cómo se vería</div></div><button class="x" data-act="close" aria-label="Cerrar">✕</button></div>
  <div class="field"><label>Con qué frecuencia habla ${B('real')}</label><div class="seg">${[['callado', 'Callado'], ['normal', 'Normal'], ['charlatan', 'Charlatán']].map(([k, l]) => `<button data-act="set-freq" data-v="${k}" aria-pressed="${s.freq === k}">${l}</button>`).join('')}</div><span class="muted">Callado: solo responde si lo nombran con @gather.</span></div>
  <div class="switch"><div class="tx"><b>Silenciar a Gather ${B('real')}</b><span class="muted">No responde nada hasta que lo reactives.</span></div><button class="tgl" role="switch" aria-checked="${s.muted}" aria-label="Silenciar" data-act="set-mute"></button></div>
  <div class="field"><label>Tono ${B('real')}</label><div class="seg">${['tranquilo', 'juguetón', 'pícaro'].map(k => `<button data-act="set-tone" data-v="${k}" aria-pressed="${s.tone === k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div></div>
  <hr style="border:0;border-top:1px solid #f0d9c6">
  <div><b>Qué puede usar la IA</b>
   <div class="grid" style="margin-top:8px">
    <div class="switch"><div class="tx"><b>Mensajes de la charla ${B('real')}</b><span class="muted">Si lo apagás, solo responde cuando lo nombran y no guarda memoria.</span></div><button class="tgl" role="switch" aria-checked="${s.useChat}" aria-label="Mensajes" data-act="set-src" data-k="useChat"></button></div>
    <div class="switch"><div class="tx"><b>Fotos del grupo ${B('sim')}</b></div><button class="tgl" role="switch" aria-checked="${s.usePhotos}" aria-label="Fotos" data-act="set-src" data-k="usePhotos"></button></div>
    <div class="switch"><div class="tx"><b>Planes anteriores ${B('sim')}</b></div><button class="tgl" role="switch" aria-checked="${s.usePlans}" aria-label="Planes" data-act="set-src" data-k="usePlans"></button></div>
   </div></div>
  <div class="field"><label for="ex-in">Excluir temas o palabras ${B('real')}</label><form id="ex-form" style="display:flex;gap:8px"><input id="ex-in" type="text" placeholder="Ej: trabajo, ex" style="flex:1"><button class="btn btn-soft btn-sm">Agregar</button></form>
   <div class="tag-row">${s.excluded.map((w, i) => `<span class="chip">${esc(w)} <button data-act="ex-del" data-i="${i}" aria-label="Quitar ${esc(w)}">✕</button></span>`).join('') || '<span class="muted">Nada excluido. Si el mensaje contiene una palabra de esta lista, Gather lo ignora.</span>'}</div></div>
  <div><b>Lo que Gather recuerda ${B('real')}</b><div class="grid" style="margin-top:8px">${S.memory.map(m => `<div class="mem-item"><span>${esc(m.t)}</span><button class="btn btn-soft btn-sm" data-act="mem-del" data-id="${m.id}">Borrar</button></div>`).join('') || '<span class="muted">Memoria vacía.</span>'}</div>
   ${S.memory.length ? '<button class="btn btn-soft btn-sm" data-act="mem-clear" style="margin-top:8px">Borrar toda la memoria</button>' : ''}</div>
  <hr style="border:0;border-top:1px solid #f0d9c6">
  <button class="btn btn-ghost" style="color:var(--ink);border-color:#d8b9a5" data-act="reset">Reiniciar la demo</button>`);
  const f = $('#ex-form'); f.onsubmit = e => { e.preventDefault(); const v = $('#ex-in').value.trim(); if (v) { S.set.excluded.push(v); save(); settings(); } };
}

/* =========================== EVENTOS =========================== */
const A = {
  go: d => go(d.tab),
  'sug-hide': () => { S.sugDismissed = todayKey(); save(); render(); },
  'sug-make': d => { const c = C(d.com); S.sugDismissed = todayKey(); S.plans.unshift({ id: 'p' + Date.now(), title: 'Plan en ' + c.n, when: 'A definir', cat: c.cat, emoji: c.emoji, com: c.id, status: 'propuesto', open: false, options: [{ l: 'Plan en ' + c.n, v: ['yo'] }], attend: { sofi: null, nico: null, mati: null, lau: null, caro: null, yo: 'si' } }); save(); go('planes'); toast('Armé la propuesta. Falta que el grupo diga si va.'); },
  'split-copy': d => { const p = S.plans.find(x => x.id === d.id); const n = Math.max(1, Object.values(p.attend).filter(a => a === 'si').length); const t = p.total || 0; const txt = t ? `Cuenta de «${p.title}»: $${t.toLocaleString('es-AR')} entre ${n} → $${Math.ceil(t / n).toLocaleString('es-AR')} cada uno. (Gather solo calcula, no cobra.)` : `Falta cargar el total de «${p.title}».`; (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Mensaje copiado. Pegalo en el chat.')).catch(() => toast(txt)); },
  react: d => { const m = S.chat[+d.i]; if (!m) return; m.r = m.r || {}; m.mine = m.mine || {}; if (m.mine[d.e]) { m.r[d.e]--; delete m.mine[d.e]; if (!m.r[d.e]) delete m.r[d.e]; } else { m.r[d.e] = (m.r[d.e] || 0) + 1; m.mine[d.e] = true; } save(); if (S.tab === 'chat') { const log = $('#chat-log'), y = log.scrollTop; vChat(); $('#chat-log').scrollTop = y; } },
  'scroll-foto': () => { const t = $('.dtile.you') || $('.dfeed'); if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); t.classList.add('pulse'); setTimeout(() => t.classList.remove('pulse'), 1800); } },
  close: () => closeModal(),
  quick: d => { say('yo', d.q); },
  'reto-join': d => { const r = S.retos.find(x => x.id === d.id); r.join = r.join.filter(i => i !== 'yo'); r.pass = r.pass.filter(i => i !== 'yo'); (d.v === '1' ? r.join : r.pass).push('yo'); save(); render(); toast(d.v === '1' ? '¡Te sumaste al reto!' : 'Listo, pasás esta vez.'); if (d.v !== '1') setPose('enojada', '¿Pasás? Mmm… 🤨'); },
  'reto-check': d => { const r = S.retos.find(x => x.id === d.id); r.done.yo = (r.done.yo || 0) + 1; if (r.done.yo >= r.goal) { r.status = 'completado'; r.join.forEach(i => r.done[i] = r.goal); toast('¡Reto completado! (el resto: simulado) ⭐'); save(); render(); setPose('recompensa', '¡Reto cumplido! 🎉'); return; } save(); render(); toast('Check-in anotado 💪'); },
  'reto-archive': d => { const r = S.retos.find(x => x.id === d.id); r.status = 'archivado'; save(); render(); toast('Reto archivado. Lo encontrás en el archivo.'); setPose('enojada', 'Ah, ¿lo archivan? Me ofendo 😤'); },
  'ideas-make': d => { const m = S.chat[+d.i]; m.card.done = true; S.plans.unshift({ id: 'p' + Date.now(), title: '¿Qué hacemos hoy?', when: 'Hoy · a definir', cat: 'comida', emoji: '🗳️', com: '', status: 'propuesto', open: false, options: m.card.coms.map(id => ({ l: `${C(id).emoji} ${C(id).n} · ${C(id).benefit}`, v: [], com: id })), attend: { sofi: null, nico: null, mati: null, lau: null, caro: null, yo: null } }); save(); render(); toast('Armé la votación en Planes ✓'); setPose('recompensa', '¡A votar!'); },
  'plan-new': d => planModal(d.com),
  'plan-ideas': () => { $('#pf-ideas').innerHTML = ['c1', 'c2', 'c3', 'c6'].map(id => `<button type="button" class="chip" data-act="plan-pick" data-id="${id}">${C(id).emoji} ${esc(C(id).n)}</button>`).join(''); },
  'plan-pick': d => { const s = $('#pf-c'); s.value = d.id; const t = $('#pf-t'); t.value = 'Plan en ' + C(d.id).n; t.dataset.auto = '1'; },
  'plan-vote': d => { const p = S.plans.find(x => x.id === d.id); p.options.forEach((o, k) => { o.v = o.v.filter(i => i !== 'yo'); if (k === +d.k) o.v.push('yo'); }); save(); render(); },
  'plan-att': d => { const p = S.plans.find(x => x.id === d.id); p.attend.yo = d.a; save(); render(); },
  'plan-confirm': d => { const p = S.plans.find(x => x.id === d.id); const going = Object.entries(p.attend).filter(([, a]) => a === 'si').map(([k]) => M(k).n);
    openModal(`<div class="modal-head"><h2>¿Confirmás el plan?</h2><button class="x" data-act="close" aria-label="Cerrar">✕</button></div><p><b>${esc(p.title)}</b> · ${esc(p.when)}</p><p>Se suman hasta ahora: ${esc(going.join(', ') || 'nadie todavía')}.</p><p class="muted">Gather no reserva ni paga nada, y el beneficio del comercio es de demostración (no hay conexión real con locales). Al confirmar, avisás al grupo que el plan va.${p.com ? '' : ' Se queda con el comercio de la opción más votada.'}</p><div class="tag-row"><button class="btn btn-red" data-act="plan-confirm-yes" data-id="${p.id}">Sí, confirmar</button><button class="btn btn-soft" data-act="close">Todavía no</button></div>`); },
  'plan-confirm-yes': d => { const p = S.plans.find(x => x.id === d.id);
    if (!p.com && p.options.some(o => o.com)) { const best = [...p.options].sort((a, b) => b.v.length - a.v.length)[0]; if (best.com) { const c = C(best.com); Object.assign(p, { com: c.id, title: 'Plan en ' + c.n, cat: c.cat, emoji: c.emoji, options: [{ l: 'Plan en ' + c.n, v: best.v }] }); } }
    p.status = 'confirmado'; if (!p.attend.yo) p.attend.yo = 'si'; S.chat.push({ time: nowTime(), t: 'u', who: 'yo', text: `Confirmé «${p.title}» (${p.when}) ✅` }); S.chat.push({ time: nowTime(), t: 'ai', text: tone({ tranquilo: 'Anotado. Reservar lo hace una persona del grupo.', juguetón: '¡Plan confirmado! Yo no reservo nada, eso es cosa de humanos 😉', pícaro: 'Confirmado. Ahora a ver quién realmente aparece 😏' }) }); save(); closeModal(); render(); toast('Plan confirmado. Avisado al grupo ✓'); flashPose = { p: 'corazon', say: '¡Plan confirmado! Los quiero ❤️' }; setPose('corazon', '¡Plan confirmado! Los quiero ❤️'); },
  'plan-archive': d => { S.plans.find(x => x.id === d.id).status = 'archivado'; save(); render(); toast('Plan archivado'); },
  'plan-restore': d => { S.plans.find(x => x.id === d.id).status = 'propuesto'; save(); render(); },
  'plan-open': d => { const p = S.plans.find(x => x.id === d.id);
    if (p.open) { p.open = false; save(); render(); return; }
    openModal(`<div class="modal-head"><h2>¿Abrir a gente nueva?</h2><button class="x" data-act="close" aria-label="Cerrar">✕</button></div><p>Cualquier persona con el link podrá pedir sumarse a <b>${esc(p.title)}</b>. Vos aprobás cada solicitud.</p><p class="muted">Simulado: en este prototipo no se genera ningún link real.</p><div class="tag-row"><button class="btn btn-red" data-act="plan-open-yes" data-id="${p.id}">Sí, abrir</button><button class="btn btn-soft" data-act="close">Mejor no</button></div>`); },
  'plan-open-yes': d => { S.plans.find(x => x.id === d.id).open = true; save(); closeModal(); render(); },
  'g-pick': d => { S.game.picked = d.id; save(); render(); },
  'g-vote': () => { const g = S.game; if (!g.picked) return; g.voted = true; const r = fakeVotes(g.round, g.picked), max = Math.max(...Object.values(r)); g.wins.push(MEMBERS.filter(m => r[m.id] === max).map(m => m.n).join(' y ')); save(); render(); },
  'g-next': () => { S.game.round++; S.game.picked = null; S.game.voted = false; save(); render(); },
  'g-restart': () => { S.game = { round: 0, picked: null, voted: false, wins: [] }; save(); render(); },
  'set-freq': d => { S.set.freq = d.v; save(); pill(); settings(); },
  'set-mute': () => { S.set.muted = !S.set.muted; save(); pill(); settings(); },
  'set-tone': d => { S.set.tone = d.v; save(); pill(); settings(); },
  'set-src': d => { S.set[d.k] = !S.set[d.k]; save(); settings(); },
  'ex-del': d => { S.set.excluded.splice(+d.i, 1); save(); settings(); },
  'mem-del': d => { S.memory = S.memory.filter(m => String(m.id) !== d.id); save(); settings(); },
  'mem-clear': () => { S.memory = []; save(); settings(); toast('Memoria borrada'); },
  reset: () => { try { localStorage.removeItem(KEY); } catch (e) {} S = defaults(); UPLOADS = []; closeModal(); pill(); go('grupo'); toast('Demo reiniciada'); }
};
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || !A[b.dataset.act]) return; try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(8); } catch (err) { /* sin vibración */ } A[b.dataset.act](b.dataset, b, e); });
document.addEventListener('input', e => {
  const el = e.target.closest ? e.target.closest('[data-split]') : null; if (!el) return;
  const p = S.plans.find(x => x.id === el.dataset.split); if (!p) return;
  p.total = Math.max(0, +el.value || 0); save();
  const n = Math.max(1, Object.values(p.attend).filter(a => a === 'si').length), out = document.getElementById('sp-' + p.id);
  if (out) out.innerHTML = p.total ? `Cada uno: <b>$${Math.ceil(p.total / n).toLocaleString('es-AR')}</b> · ${n} personas` : `Se reparte entre ${n} personas que dijeron que van.`;
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

startLanding();
/* ancho de la columna de celular para capturas: ?phone=390 */
{ const pw = new URLSearchParams(location.search).get('phone'); if (pw && +pw > 0) document.documentElement.style.setProperty('--appw', (+pw) + 'px'); }
/* enlace directo a una pantalla: ?tab=grupo|chat|planes|jugar|recuerdos */
{ const qt = new URLSearchParams(location.search).get('tab'); if (qt && TITLES[qt]) { S.tab = qt; S.seenGuide = true; enterApp(); } }
})();
