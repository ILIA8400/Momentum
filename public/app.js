/* global Jalali */
(() => {
  const J = Jalali;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const main = $('#main');

  // ---------- آیکون‌ها (Lucide) ----------
  const ICONS = {
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    week: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
    chart: '<path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/>',
    settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    tests: '<path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    sigma: '<path d="M18 7V4H6l6 8-6 8h12v-3"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    timer: '<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
    graduation: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    note: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
    compare: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
    sheet: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
  };
  const ic = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

  // ---------- جمله‌های انگیزشی ----------
  const QUOTES = [
    'فقط شروع کن. ادامه‌ش خودش میاد.',
    'آینده‌ت داره از امروزت ساخته میشه.',
    'رتبه خوب خودش درس نمی‌خونه، داداش.',
    'قهوه هست. جزوه هست. پس بهانه چیه؟',
    'یه روز دیگه، یه عالمه تست دیگه.',
    'هدف: قبولی. وضعیت فعلی: در حال رنج کشیدن.',
    'هر ساعت مطالعه = یک قدم کمتر تا رتبه‌ای که می‌خوای.',
    'کم‌کم؛ ولی هر روز.',
    'بزن بریم؛ قبل از اینکه مغزت یه بهونه جدید پیدا کنه.',
    'هیچ رتبه‌ای با برنامه قشنگ ساخته نشد؛ با اجرای برنامه ساخته شد.',
    'زبان بخون؛ حداقل یه زبانی بلدی غر بزنی.',
    'یه کم دیگه.',
    'فقط اجرا.',
    'برنامه‌ریزی تموم شد؛ وقت خراب کردن برنامه‌ست.',
  ];
  // هر روز یک جمله (بر اساس تاریخ)؛ با دکمه می‌شود جملهٔ بعدی را دید
  let quoteOffset = 0;
  function quoteOfDay() {
    const t = J.todayJalali();
    const seed = J.diffDays('1400-01-01', t);
    return QUOTES[(seed + quoteOffset) % QUOTES.length];
  }

  // سلام بر اساس ساعت روز
  function greeting(name) {
    const h = new Date().getHours();
    const g = h < 5 ? 'شب بخیر' : h < 12 ? 'صبح بخیر' : h < 15 ? 'ظهر بخیر' : h < 19 ? 'عصر بخیر' : 'شب بخیر';
    return name ? `${g}، ${name}` : g;
  }

  // ---------- state ----------
  const state = {
    view: localStorage.getItem('view') || 'dash',
    date: J.todayJalali(),
    subjects: [],
    settings: null,
    editing: null,
  };

  // ---------- helpers ----------
  const FA = '۰۱۲۳۴۵۶۷۸۹';
  const fa = (n) => String(n).replace(/\d/g, (d) => FA[d]);
  const en = (s) => String(s).replace(/[۰-۹]/g, (d) => FA.indexOf(d));
  const hm = (min) => {
    min = min | 0;
    const h = Math.floor(min / 60), m = min % 60;
    if (!h) return `${fa(m)} دقیقه`;
    if (!m) return `${fa(h)} ساعت`;
    return `${fa(h)}:${fa(String(m).padStart(2, '0'))}`;
  };
  const hmc = (min) => { min = min | 0; return fa(Math.floor(min / 60)) + ':' + fa(String(min % 60).padStart(2, '0')); };
  const hours = (min) => fa((min / 60).toFixed(1).replace(/\.0$/, ''));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = (s) => { const j = J.parse(s); return `${fa(j.jd)} ${J.MONTHS[j.jm - 1]} ${fa(j.jy)}`; };
  const fmtShort = (s) => { const j = J.parse(s); return `${fa(j.jd)} ${J.MONTHS[j.jm - 1]}`; };
  const fmtFull = (s) => `${J.WEEKDAYS[J.weekday(s)]}، ${fmtDate(s)}`;
  const monthKey = (s) => s.slice(0, 7);
  const monthRange = (s) => { const j = J.parse(s); const mk = monthKey(s); return [`${mk}-01`, `${mk}-${String(J.jalaliMonthLength(j.jy, j.jm)).padStart(2, '0')}`]; };
  const today = () => J.todayJalali();
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  // درصد کنکوری با نمره منفی
  const pctOf = (c, w, t) => (!t || c + w === 0 ? null : Math.round(((3 * c - w) / (3 * t)) * 1000) / 10);
  const pctTag = (p, cls = '') => p == null ? '' : `<span class="tag pct ${p >= 50 ? 'good' : p < 20 ? 'bad' : ''} ${cls}">${fa(p)}٪</span>`;
  const timeFa = (t) => (t ? fa(t) : '');

  let toastTimer;
  function toast(msg, err = false) {
    const t = $('#toast');
    t.innerHTML = ic(err ? 'x' : 'check') + esc(msg);
    t.className = 'toast show' + (err ? ' err' : '');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.className = 'toast'), 2400);
  }

  async function api(method, url, body) {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { toast(data.error || 'خطا', true); throw new Error(data.error); }
    return data;
  }

  const activeSubjects = () => state.subjects.filter((s) => !s.archived);
  const subjectOptions = (selected) => activeSubjects().map((s) => `<option value="${s.id}" ${s.id == selected ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
  const subjName = (s) => `<span class="subj-name"><span class="dot" style="background:${s.color}"></span>${esc(s.name)}</span>`;

  // ---------- تم ----------
  const THEMES = [['system', 'monitor', 'خودکار (سیستم)'], ['light', 'sun', 'روشن'], ['dark', 'moon', 'تاریک']];
  function getTheme() { try { return localStorage.getItem('theme') || 'system'; } catch { return 'system'; } }
  function applyTheme(t) {
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
    try { localStorage.setItem('theme', t); } catch {}
    const b = $('#themeBtn'); if (b) { const cur = THEMES.find((x) => x[0] === t); b.innerHTML = ic(cur[1]); b.title = `تم: ${cur[2]}`; }
  }
  function cycleTheme() { const i = THEMES.findIndex((x) => x[0] === getTheme()); const next = THEMES[(i + 1) % THEMES.length]; applyTheme(next[0]); toast(`تم ${next[2]}`); }

  // ---------- header ----------
  const TABS = [['dash', 'home', 'داشبورد'], ['day', 'sun', 'روزانه'], ['week', 'week', 'هفتگی'], ['month', 'calendar', 'ماهانه'], ['stats', 'chart', 'آمار'], ['import', 'sheet', 'ورود از اکسل'], ['settings', 'settings', 'تنظیمات و بکاپ']];
  function renderHeader() {
    $('#topbar').innerHTML = `
      <div class="brand"><span class="logo">${ic('zap')}</span><span>Momentum<small>برنامه‌ریز مطالعه</small></span></div>
      <nav class="tabs" id="tabs">${TABS.map(([v, i, l]) => `<button data-view="${v}" class="${state.view === v ? 'active' : ''}">${ic(i)}<span>${l}</span></button>`).join('')}</nav>
      <div class="header-right">
        <div class="today-chip">${ic('calendar', 'sm')} امروز <b>${fmtFull(today())}</b></div>
        <button class="theme-btn" id="themeBtn" title="تغییر تم"></button>
        <a class="theme-btn" href="/guide.html" target="_blank" title="راهنما">${ic('help')}</a>
      </div>`;
    $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-view]'); if (b) setView(b.dataset.view); });
    $('#themeBtn').addEventListener('click', cycleTheme);
    applyTheme(getTheme());
  }
  function setView(v) {
    state.view = v; localStorage.setItem('view', v); state.editing = null;
    $$('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
    render();
  }

  // ---------- date nav + picker ----------
  function dateNav(title, sub, step) {
    const isToday = step !== 'month' && state.date === today();
    return `<div class="datenav">
      <div class="nav">
        <button data-nav="${step === 'month' ? -1 : -step}" title="قبلی">${ic('right')}</button>
        <button data-nav="0">امروز</button>
        <button data-nav="${step === 'month' ? 1 : step}" title="بعدی">${ic('left')}</button>
      </div>
      <button class="btn ghost pick" id="pickDate" title="انتخاب تاریخ">${ic('calendar')}</button>
      <span class="title">${sub ? `<span class="wd">${sub}</span>` : ''}${title}</span>
      ${isToday ? '<span class="badge-today">امروز</span>' : ''}
    </div>`;
  }
  function bindNav(step) {
    $$('[data-nav]', main).forEach((b) => b.addEventListener('click', () => {
      const n = +b.dataset.nav;
      if (n === 0) state.date = today();
      else if (step === 'month') { const j = J.parse(state.date); let m = j.jm + n, y = j.jy; if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; } state.date = `${y}-${String(m).padStart(2, '0')}-01`; }
      else state.date = J.addDays(state.date, n);
      render();
    }));
    $('#pickDate')?.addEventListener('click', (e) => openPicker(e.currentTarget, state.date, (d) => { state.date = d; render(); }));
  }

  let pickerEl = null;
  function closePicker() { pickerEl?.remove(); pickerEl = null; document.removeEventListener('mousedown', onDocClick); }
  function onDocClick(e) { if (pickerEl && !pickerEl.contains(e.target)) closePicker(); }
  async function openPicker(anchor, value, onPick) {
    closePicker();
    const cur = J.parse(value) || J.parse(today());
    pickerEl = document.createElement('div'); pickerEl.className = 'dp';
    document.body.appendChild(pickerEl);
    const r = anchor.getBoundingClientRect();
    pickerEl.style.top = `${r.bottom + window.scrollY + 6}px`;
    pickerEl.style.left = `${Math.max(8, Math.min(r.left + window.scrollX, window.innerWidth - 310))}px`;
    setTimeout(() => document.addEventListener('mousedown', onDocClick));
    const draw = async () => {
      const mk = `${cur.jy}-${String(cur.jm).padStart(2, '0')}`;
      const len = J.jalaliMonthLength(cur.jy, cur.jm);
      const marked = new Set((await api('GET', `/api/stats?from=${mk}-01&to=${mk}-${len}`)).byDay.map((d) => d.date));
      const off = J.weekday(`${mk}-01`);
      let cells = J.WEEKDAYS.map((w) => `<div class="w">${w[0]}</div>`).join('');
      for (let i = 0; i < off; i++) cells += '<div></div>';
      for (let d = 1; d <= len; d++) {
        const ds = `${mk}-${String(d).padStart(2, '0')}`;
        cells += `<button data-d="${ds}" class="${ds === value ? 'sel' : ''} ${ds === today() ? 'tdy' : ''} ${marked.has(ds) ? 'has' : ''}">${fa(d)}</button>`;
      }
      pickerEl.innerHTML = `<div class="dp-head">
          <button class="btn icon" data-m="-1">${ic('right')}</button>
          <b>${J.MONTHS[cur.jm - 1]} ${fa(cur.jy)}</b>
          <button class="btn icon" data-m="1">${ic('left')}</button>
        </div>
        <div class="dp-grid">${cells}</div>
        <div class="dp-foot"><button class="btn sm ghost" data-today>برو به امروز</button><button class="btn sm ghost" data-close>بستن</button></div>`;
      $$('[data-m]', pickerEl).forEach((b) => b.addEventListener('click', () => { cur.jm += +b.dataset.m; if (cur.jm > 12) { cur.jm = 1; cur.jy++; } if (cur.jm < 1) { cur.jm = 12; cur.jy--; } draw(); }));
      $$('[data-d]', pickerEl).forEach((b) => b.addEventListener('click', () => { closePicker(); onPick(b.dataset.d); }));
      $('[data-today]', pickerEl).addEventListener('click', () => { closePicker(); onPick(today()); });
      $('[data-close]', pickerEl).addEventListener('click', closePicker);
    };
    draw();
  }

  // ---------- render ----------
  async function render() {
    closePicker();
    if (!state.subjects.length) state.subjects = await api('GET', '/api/subjects');
    if (!state.settings) state.settings = await api('GET', '/api/settings');
    try {
      await ({ dash: renderDash, day: renderDay, week: renderWeek, month: renderMonth, stats: renderStats, import: renderImport, settings: renderSettings })[state.view]();
    } catch (e) { main.innerHTML = `<div class="card">خطا: ${esc(e.message)}</div>`; console.error(e); }
  }

  // ===== داشبورد =====
  async function renderDash() {
    const t = today(), y = J.addDays(t, -1);
    const ws = J.weekStart(t), we = J.addDays(ws, 6);
    const [entries, yst, last7, weekSt, goals, rec, note] = await Promise.all([
      api('GET', `/api/entries?from=${t}&to=${t}`),
      api('GET', `/api/stats?from=${y}&to=${y}`),
      api('GET', `/api/stats?from=${J.addDays(t, -7)}&to=${y}`),
      api('GET', `/api/stats?from=${ws}&to=${we}`),
      api('GET', `/api/goals?period=week&key=${ws}`),
      api('GET', '/api/records'),
      api('GET', `/api/notes/${t}`),
    ]);
    const S = state.settings;
    const sum = (k) => entries.reduce((s, e) => s + (e[k] || 0), 0);
    const total = sum('minutes'), tests = sum('tests');
    const scored = entries.filter((e) => e.correct + e.wrong > 0);
    const percent = pctOf(scored.reduce((s, e) => s + e.correct, 0), scored.reduce((s, e) => s + e.wrong, 0), scored.reduce((s, e) => s + e.tests, 0));
    const avg7 = { minutes: last7.total / 7, tests: last7.tests / 7 };
    const done = entries.filter((e) => e.done), pending = entries.filter((e) => !e.done);

    // شمارش معکوس کنکور
    const examDays = J.diffDays(t, S.exam_date);
    const first = rec.firstDay || t;
    const span = Math.max(1, J.diffDays(first, S.exam_date));
    const elapsed = Math.min(span, Math.max(0, J.diffDays(first, t)));

    const delta = (cur, prev, fmt) => {
      if (!prev && !cur) return '';
      const d = Math.round((cur - prev) * 10) / 10;
      const cls = d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
      return `<span class="delta ${cls}">${d > 0 ? '▲' : d < 0 ? '▼' : '='} ${fmt(Math.abs(d))}</span>`;
    };
    const weekGoal = goals.find((g) => g.subject_id === 0)?.minutes || 0;
    const bestSub = weekSt.bySubject[0];

    main.innerHTML = `
      <div class="quote card">
        <span class="q-ic">${ic('zap')}</span>
        <span class="q-text">${S.user_name ? `<span class="greet">${esc(greeting(S.user_name.trim()))} 👋</span>` : ''}<span id="quoteText">${esc(quoteOfDay())}</span></span>
        <button class="btn icon" id="nextQuote" title="جملهٔ بعدی">${ic('right')}</button>
      </div>
      <div class="dash-grid">
        <div>
          <div class="card countdown">
            <div class="t">${ic('graduation')} ${esc(S.exam_title)}</div>
            <div class="big">${examDays >= 0 ? fa(examDays) : fa(Math.abs(examDays))}<small>${examDays > 0 ? 'روز مانده' : examDays === 0 ? 'امروز روز کنکوره!' : 'روز گذشته'}</small></div>
            <div class="d">${ic('calendar', 'sm')} ${fmtFull(S.exam_date)} <button id="examDate">تغییر تاریخ</button></div>
            ${examDays > 0 ? `<div class="weeks"><span><b>${fa(Math.floor(examDays / 7))}</b> هفته و <b>${fa(examDays % 7)}</b> روز</span><span>از شروع ثبت: <b>${fa(elapsed)}</b> روز گذشته</span><span>مطالعه‌شده تا حالا: <b>${fa(rec.totalDays)}</b> روز</span></div>
            <div class="progress"><div style="width:${pct(elapsed, span)}%"></div></div>` : ''}
          </div>

          <div class="card">
            <div class="today-head">
              <span class="date">${ic('sun')} ${fmtFull(t)}</span>
              <span class="spacer"></span>
              <button class="btn primary sm" id="goAdd">${ic('plus', 'sm')} افزودن مطالعه</button>
            </div>
            <div class="mini-stats">
              <div class="ms"><div class="l">${ic('clock')} مطالعه</div><div class="v">${hours(total)}<small>ساعت</small>${delta(total, yst.total, (v) => hours(v) + ' س')}</div></div>
              <div class="ms"><div class="l">${ic('tests')} تست</div><div class="v">${fa(tests)}${delta(tests, yst.tests, fa)}</div></div>
              <div class="ms"><div class="l">${ic('target')} درصد امروز</div><div class="v">${percent == null ? '<span class="muted">—</span>' : fa(percent) + '٪'}${percent != null && yst.percent != null ? delta(percent, yst.percent, (v) => fa(v) + '٪') : ''}</div></div>
            </div>
            ${entries.length ? daybar(entries, total) : ''}

            <div class="section-title">${ic('activity')} تایم‌لاین امروز</div>
            ${entries.length ? `<div class="timeline">${entries.map(timelineItem).join('')}</div>` : `<div class="empty">${ic('inbox')}امروز هنوز مطالعه‌ای ثبت نکردی</div>`}
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card-head"><h2>${ic('list')} برنامهٔ امروز</h2><span class="spacer"></span><span class="muted">${fa(done.length)} از ${fa(entries.length)} انجام شده</span></div>
            ${entries.length ? `<div class="progress" style="margin-bottom:10px"><div class="${done.length === entries.length ? 'over' : ''}" style="width:${pct(done.length, entries.length)}%"></div></div>` : ''}
            ${pending.length ? `<div class="section-title">${ic('timer')} مانده (${fa(pending.length)})</div><div class="todo-list">${pending.map(todoItem).join('')}</div>` : ''}
            ${done.length ? `<div class="section-title">${ic('check')} انجام‌شده (${fa(done.length)})</div><div class="todo-list">${done.map(todoItem).join('')}</div>` : ''}
            ${!entries.length ? '<div class="empty muted">چیزی نیست</div>' : ''}
          </div>

          <div class="card">
            <div class="card-head"><h2>${ic('note')} یادداشت امروز</h2></div>
            <textarea class="input" id="dayNote" placeholder="هر چیزی که می‌خوای برای امروز یادت بمونه… (خودکار ذخیره می‌شه)">${esc(note.text)}</textarea>
            <div class="note-status" id="noteStatus"></div>
          </div>

          <div class="card">
            <div class="card-head"><h2>${ic('compare')} مقایسه</h2></div>
            <div class="compare">
              <div class="cmp"><div class="l">دیروز</div><div class="v">${hours(yst.total)} س</div><div class="s">${fa(yst.tests)} تست${yst.percent != null ? ` • ${fa(yst.percent)}٪` : ''}</div></div>
              <div class="cmp"><div class="l">میانگین ۷ روز اخیر</div><div class="v">${hours(avg7.minutes)} س ${delta(total, avg7.minutes, (v) => hours(v) + ' س')}</div><div class="s">${fa(Math.round(avg7.tests))} تست در روز</div></div>
              <div class="cmp"><div class="l">رکورد یک روز</div><div class="v">${rec.bestDay ? hm(rec.bestDay.minutes) : '—'}</div><div class="s">${rec.bestDay ? (total >= rec.bestDay.minutes && total ? '🎉 امروز رکورد زدی!' : `${hours(Math.max(0, rec.bestDay.minutes - total))} ساعت تا رکورد`) : ''}</div></div>
              <div class="cmp"><div class="l">زنجیره</div><div class="v">${ic('flame')} ${fa(rec.currentStreak)} روز</div><div class="s">بهترین: ${fa(rec.longestStreak)} روز</div></div>
            </div>
          </div>

          <div class="card">
            <div class="card-head"><h2>${ic('week')} این هفته</h2><span class="spacer"></span><span class="muted">${fmtShort(ws)} تا ${fmtShort(we)}</span></div>
            <div class="mini-stats">
              <div class="ms"><div class="l">${ic('clock')} مطالعه</div><div class="v">${hours(weekSt.total)}<small>ساعت</small></div></div>
              <div class="ms"><div class="l">${ic('tests')} تست</div><div class="v">${fa(weekSt.tests)}</div></div>
              <div class="ms"><div class="l">${ic('sun')} روز</div><div class="v">${fa(weekSt.byDay.length)}<small>از ۷</small></div></div>
            </div>
            ${weekGoal ? `<div class="sub" style="display:flex;justify-content:space-between"><span>هدف هفته: ${hours(weekGoal)} ساعت</span><b>${fa(pct(weekSt.total, weekGoal))}٪</b></div><div class="progress"><div class="${weekSt.total >= weekGoal ? 'over' : ''}" style="width:${Math.min(100, pct(weekSt.total, weekGoal))}%"></div></div>` : `<div class="muted">هدف هفتگی تعیین نشده — از تب هفتگی تنظیم کن</div>`}
            ${bestSub ? `<div class="sub" style="margin-top:8px">بیشترین مطالعهٔ هفته: ${subjName(bestSub)} <b>${hm(bestSub.minutes)}</b></div>` : ''}
            <div class="quick-actions" style="margin-top:12px">
              <a class="btn primary" href="/allplan.html" target="_blank">${ic('print')} خروجی All Plan (جدول هفتگی)</a>
              <a class="btn" href="/report.html?date=${t}" target="_blank">${ic('list')} گزارش تفصیلی هفته</a>
              <a class="btn" href="/summary.html?date=${t}" target="_blank">${ic('sheet')} جدول خلاصه</a>
              <a class="btn" href="/api/backup" download="plan-backup-${t}.json">${ic('download')} بکاپ کامل</a>
            </div>
          </div>
          <div class="card import-cta">
            <div class="row">
              <span class="ico">${ic('sheet')}</span>
              <div class="grow"><b>برنامه‌های قبلی داری که وارد نکردی؟</b><div class="sub">قالب اکسل رو بگیر، پرش کن، برگردون — بعد از بررسی یک‌جا اضافه می‌شن.</div></div>
              <button class="btn primary" data-view-go="import">${ic('upload')} ورود از اکسل</button>
            </div>
          </div>
        </div>
      </div>`;

    $('#goAdd').addEventListener('click', () => { state.date = t; setView('day'); });
    $$('[data-view-go]', main).forEach((b) => b.addEventListener('click', () => setView(b.dataset.viewGo)));
    $('#nextQuote').addEventListener('click', () => { quoteOffset++; $('#quoteText').textContent = quoteOfDay(); });
    $('#examDate').addEventListener('click', (e) => openPicker(e.currentTarget, S.exam_date, async (d) => { state.settings = await api('PUT', '/api/settings', { exam_date: d }); toast('تاریخ کنکور ذخیره شد'); render(); }));
    $$('.todo input', main).forEach((chk) => chk.addEventListener('change', async () => {
      const e = entries.find((x) => x.id === +chk.closest('.todo').dataset.id);
      await api('PUT', `/api/entries/${e.id}`, { ...e, done: chk.checked }); render();
    }));
    // یادداشت روز: ذخیره خودکار
    const ta = $('#dayNote'), st = $('#noteStatus');
    let timer, last = note.text;
    const save = async () => { if (ta.value === last) return; st.textContent = 'در حال ذخیره…'; await api('PUT', `/api/notes/${t}`, { text: ta.value }); last = ta.value; st.textContent = 'ذخیره شد ✓'; setTimeout(() => (st.textContent = ''), 1500); };
    ta.addEventListener('input', () => { clearTimeout(timer); st.textContent = '…'; timer = setTimeout(save, 700); });
    ta.addEventListener('blur', () => { clearTimeout(timer); save(); });
  }

  function daybar(entries, total) {
    const per = {};
    for (const e of entries) { (per[e.subject_id] ||= { name: e.subject, color: e.color, min: 0 }); per[e.subject_id].min += e.minutes; }
    const list = Object.values(per).sort((a, b) => b.min - a.min);
    return `<div class="daybar">${list.map((s) => `<span style="flex:${s.min};background:${s.color}" title="${esc(s.name)}: ${hm(s.min)}">${s.min / total > 0.12 ? esc(s.name) : ''}</span>`).join('')}</div>
      <div class="daybar-legend">${list.map((s) => `<span><span class="dot" style="background:${s.color}"></span>${esc(s.name)} <b>${hmc(s.min)}</b></span>`).join('')}</div>`;
  }
  function timelineItem(e) {
    const time = e.start_time ? `${timeFa(e.start_time)}${e.end_time ? `<br>${timeFa(e.end_time)}` : ''}` : '<span class="muted">—</span>';
    const chips = [
      e.study_min ? `<span class="tag study">خواندن ${hmc(e.study_min)}</span>` : '',
      e.review_min ? `<span class="tag review">مرور ${hmc(e.review_min)}</span>` : '',
      e.test_min ? `<span class="tag test">تست ${hmc(e.test_min)}</span>` : '',
      e.tests ? `<span class="tag test">${ic('tests', 'sm')}${fa(e.tests)} تست${e.correct + e.wrong ? ` (${fa(e.correct)}✓ ${fa(e.wrong)}✗)` : ''}</span>` : '',
      pctTag(e.percent),
    ].filter(Boolean).join('');
    return `<div class="tl ${e.done ? 'done' : ''}">
      <div class="time">${time}</div>
      <div class="rail"><span class="pin" style="background:${e.color}"></span></div>
      <div class="body" style="--c:${e.color}">
        <div class="top"><b>${esc(e.subject)}</b>${e.done ? '<span class="tag done">انجام شد</span>' : '<span class="tag pending">مانده</span>'}<span class="tag time dur">${ic('clock', 'sm')}${hm(e.minutes)}</span></div>
        ${e.note ? `<div class="note">${esc(e.note)}</div>` : ''}
        ${chips ? `<div class="chips">${chips}</div>` : ''}
      </div>
    </div>`;
  }
  function todoItem(e) {
    return `<label class="todo ${e.done ? 'done' : ''}" data-id="${e.id}">
      <input type="checkbox" ${e.done ? 'checked' : ''}>
      <span class="n"><span class="dot" style="background:${e.color};width:8px;height:8px;border-radius:50%"></span>${esc(e.subject)}</span>
      <span class="note">${esc(e.note)}</span>
      <span class="tag time">${hmc(e.minutes)}</span>
    </label>`;
  }

  // ===== روزانه =====
  async function renderDay() {
    const d = state.date;
    const entries = await api('GET', `/api/entries?from=${d}&to=${d}`);
    const total = entries.reduce((s, e) => s + e.minutes, 0);
    const tests = entries.reduce((s, e) => s + e.tests, 0);
    const ed = state.editing ? entries.find((e) => e.id === state.editing) : null;
    if (state.editing && !ed) state.editing = null;

    main.innerHTML = dateNav(fmtDate(d), J.WEEKDAYS[J.weekday(d)] + '،', 1) + `
      <div class="card">
        <div class="card-head"><h2>${ic(ed ? 'pencil' : 'plus')} ${ed ? 'ویرایش آیتم' : 'افزودن مطالعه'}</h2><span class="spacer"></span><span class="muted">فقط درس و مدت اجباری‌اند</span></div>
        ${entryForm(ed)}
      </div>
      <div class="card">
        <div class="card-head"><h2>${ic('list')} برنامهٔ روز</h2><span class="spacer"></span><span class="muted">${fa(entries.length)} مورد</span></div>
        <div class="entries">${entries.length ? entries.map(entryRow).join('') : `<div class="empty">${ic('inbox')}هنوز چیزی برای این روز ثبت نشده</div>`}</div>
        ${entries.length ? `<div class="summary">
          <span class="stat">${ic('clock')} مطالعه <b>${hm(total)}</b></span>
          <span class="stat">${ic('tests')} تست <b>${fa(tests)}</b></span>
          <span class="stat">${ic('check')} انجام‌شده <b>${fa(entries.filter((e) => e.done).length)}/${fa(entries.length)}</b></span>
        </div>` : ''}
      </div>`;
    bindNav(1);
    bindEntryForm(d, ed);
    bindEntryActions(entries);
  }

  function entryForm(ed) {
    const v = (k) => (ed && ed[k] ? ed[k] : '');
    return `<form id="entryForm" class="eform">
      <div class="row2">
        <label class="field"><span>درس *</span><select name="subject_id" class="input" required>${subjectOptions(ed?.subject_id)}</select></label>
        <div class="fs">
          <div class="lg">${ic('timer')} بازهٔ زمانی <span class="muted" style="font-weight:400">(اختیاری — مدت خودکار حساب می‌شود)</span></div>
          <div class="grid g2">
            <label class="field"><span>ساعت شروع</span><input class="input" type="time" name="start_time" value="${v('start_time')}"></label>
            <label class="field"><span>ساعت پایان</span><input class="input" type="time" name="end_time" value="${v('end_time')}"></label>
          </div>
        </div>
      </div>
      <div class="row2">
        <div class="fs">
          <div class="lg">${ic('clock')} مدت زمان (دقیقه)</div>
          <div class="grid g3">
            <label class="field"><span>خواندن</span><input class="input num" type="number" name="study_min" min="0" step="5" placeholder="۰" value="${v('study_min')}"></label>
            <label class="field"><span>مرور</span><input class="input num" type="number" name="review_min" min="0" step="5" placeholder="۰" value="${v('review_min')}"></label>
            <label class="field"><span>تست زدن</span><input class="input num" type="number" name="test_min" min="0" step="5" placeholder="۰" value="${v('test_min')}"></label>
          </div>
          <div class="total" style="margin-top:10px">
            <span>مدت کل *</span>
            <input class="input num" type="number" name="minutes" min="1" step="5" style="width:90px" value="${ed ? ed.minutes : ''}" placeholder="دقیقه">
            <span id="totalHint" class="muted"></span>
          </div>
          <div class="hint">اگه جزئیات یا بازه رو وارد کنی، مدت کل خودش پر می‌شه. می‌تونی فقط همین یکی رو هم بنویسی.</div>
        </div>
        <div class="fs">
          <div class="lg">${ic('tests')} تست</div>
          <div class="grid g3">
            <label class="field"><span>تعداد کل</span><input class="input num" type="number" name="tests" min="0" placeholder="۰" value="${v('tests')}"></label>
            <label class="field"><span>درست</span><input class="input num" type="number" name="correct" min="0" placeholder="۰" value="${v('correct')}"></label>
            <label class="field"><span>غلط</span><input class="input num" type="number" name="wrong" min="0" placeholder="۰" value="${v('wrong')}"></label>
          </div>
          <div class="total" style="margin-top:10px"><span>درصد (با نمرهٔ منفی):</span><b id="pctHint">—</b></div>
          <div class="hint">درصد = (۳×درست − غلط) ÷ (۳×کل)</div>
        </div>
      </div>
      <label class="field"><span>شرح</span><input class="input" type="text" name="note" placeholder="مثلاً: فیلم جلسه ۱۲ — فصل ۳ تا صفحه ۴۰" value="${esc(v('note'))}"></label>
      <div class="foot">
        <label class="check"><input type="checkbox" name="done" ${ed?.done ? 'checked' : ''}> انجام شد</label>
        <span class="spacer"></span>
        ${ed ? '<button class="btn" type="button" id="cancelEdit">انصراف</button>' : ''}
        <button class="btn primary" type="submit">${ic(ed ? 'save' : 'plus')} ${ed ? 'ذخیره تغییرات' : 'افزودن'}</button>
      </div>
    </form>`;
  }
  function bindEntryForm(d, ed) {
    const form = $('#entryForm');
    const f = (n) => form.elements[n];
    const num = (n) => +en(f(n).value) || 0;
    let manualTotal = !!ed; // اگر کاربر دستی مدت کل را عوض کند، دیگر خودکار پر نمی‌کنیم
    const diff = (a, b) => { const m = (t) => +t.slice(0, 2) * 60 + +t.slice(3); let x = m(b) - m(a); if (x < 0) x += 1440; return x; };
    const recalc = () => {
      const parts = num('study_min') + num('review_min') + num('test_min');
      const s = f('start_time').value, e = f('end_time').value;
      const range = s && e ? diff(s, e) : 0;
      if (!manualTotal) { if (parts) f('minutes').value = parts; else if (range) f('minutes').value = range; }
      const hint = [];
      if (parts) hint.push(`جزئیات: ${hm(parts)}`);
      if (range) hint.push(`بازه: ${hm(range)}`);
      const tot = num('minutes');
      if (tot) hint.unshift(`= ${hm(tot)}`);
      $('#totalHint').textContent = hint.join(' • ');
      const p = pctOf(num('correct'), num('wrong'), num('tests'));
      $('#pctHint').textContent = p == null ? '—' : `${fa(p)}٪`;
      $('#pctHint').style.color = p == null ? '' : p >= 50 ? 'var(--ok)' : p < 20 ? 'var(--danger)' : '';
    };
    ['study_min', 'review_min', 'test_min', 'start_time', 'end_time', 'tests', 'correct', 'wrong'].forEach((n) => f(n).addEventListener('input', recalc));
    f('minutes').addEventListener('input', () => { manualTotal = !!f('minutes').value; recalc(); });
    recalc();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = { date: d, subject_id: +f('subject_id').value, minutes: num('minutes'), start_time: f('start_time').value, end_time: f('end_time').value,
        study_min: num('study_min'), review_min: num('review_min'), test_min: num('test_min'), tests: num('tests'), correct: num('correct'), wrong: num('wrong'),
        note: f('note').value.trim(), done: f('done').checked };
      if (!body.minutes) return toast('مدت مطالعه را وارد کن', true);
      if (body.correct + body.wrong > body.tests) return toast('درست + غلط از تعداد کل بیشتره', true);
      if (ed) await api('PUT', `/api/entries/${ed.id}`, body); else await api('POST', '/api/entries', body);
      state.editing = null; toast(ed ? 'ذخیره شد' : 'اضافه شد'); render();
    });
    $('#cancelEdit')?.addEventListener('click', () => { state.editing = null; render(); });
    if (!ed) f('subject_id').focus();
  }

  function entryRow(e) {
    const details = [
      e.study_min ? `<span class="tag study">خواندن ${hmc(e.study_min)}</span>` : '',
      e.review_min ? `<span class="tag review">مرور ${hmc(e.review_min)}</span>` : '',
      e.test_min ? `<span class="tag test">تست ${hmc(e.test_min)}</span>` : '',
      e.correct + e.wrong ? `<span class="tag">${fa(e.correct)} درست • ${fa(e.wrong)} غلط</span>` : '',
    ].filter(Boolean).join('');
    return `<div class="entry ${e.done ? 'done' : ''}" data-id="${e.id}">
      <input type="checkbox" class="chk" data-act="toggle" ${e.done ? 'checked' : ''} title="انجام شد">
      <span class="subj"><span class="dot" style="background:${e.color}"></span>${esc(e.subject)}${e.start_time ? `<span class="times">${timeFa(e.start_time)}${e.end_time ? '–' + timeFa(e.end_time) : ''}</span>` : ''}</span>
      <span class="note" title="${esc(e.note)}">${esc(e.note)}</span>
      <span class="meta">
        <span class="tag time">${ic('clock', 'sm')}${hm(e.minutes)}</span>
        ${e.tests ? `<span class="tag test">${ic('tests', 'sm')}${fa(e.tests)} تست</span>` : ''}
        ${pctTag(e.percent)}
      </span>
      <span class="actions">
        <button class="btn icon" data-act="edit" title="ویرایش">${ic('pencil', 'sm')}</button>
        <button class="btn icon danger" data-act="del" title="حذف">${ic('trash', 'sm')}</button>
      </span>
      ${details ? `<span class="entry-sub" style="grid-column:2/-1;display:flex;gap:6px;flex-wrap:wrap">${details}</span>` : ''}
    </div>`;
  }
  function bindEntryActions(entries) {
    $$('[data-act]', main).forEach((el) => el.addEventListener(el.dataset.act === 'toggle' ? 'change' : 'click', async () => {
      const id = +el.closest('.entry').dataset.id;
      const e = entries.find((x) => x.id === id);
      if (el.dataset.act === 'toggle') { await api('PUT', `/api/entries/${id}`, { ...e, done: el.checked }); render(); }
      else if (el.dataset.act === 'edit') { state.editing = id; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      else if (el.dataset.act === 'del') { if (confirm(`حذف «${e.subject} — ${e.note || hm(e.minutes)}»؟`)) { await api('DELETE', `/api/entries/${id}`); toast('حذف شد'); render(); } }
    }));
  }

  // ===== هفتگی =====
  async function renderWeek() {
    const start = J.weekStart(state.date), end = J.addDays(start, 6);
    const [entries, goals] = await Promise.all([api('GET', `/api/entries?from=${start}&to=${end}`), api('GET', `/api/goals?period=week&key=${start}`)]);
    const days = Array.from({ length: 7 }, (_, i) => J.addDays(start, i));
    const t = today();
    const total = entries.reduce((s, e) => s + e.minutes, 0);
    const tests = entries.reduce((s, e) => s + e.tests, 0);
    const studied = new Set(entries.map((e) => e.date)).size;

    main.innerHTML = dateNav(`${fmtShort(start)} تا ${fmtDate(end)}`, 'هفتهٔ', 7) + `
      <div class="kpis">
        <div class="kpi accent"><span class="l">${ic('clock')} مطالعهٔ هفته</span><span class="v">${hours(total)}<small>ساعت</small></span></div>
        <div class="kpi"><span class="l">${ic('tests')} تست هفته</span><span class="v">${fa(tests)}</span></div>
        <div class="kpi"><span class="l">${ic('sun')} روز مطالعه</span><span class="v">${fa(studied)}<small>از ۷</small></span></div>
        <div class="kpi"><span class="l">${ic('sigma')} میانگین روزانه</span><span class="v">${hours(studied ? total / studied : 0)}<small>ساعت</small></span></div>
      </div>
      <div class="week">${days.map((d) => {
        const list = entries.filter((e) => e.date === d);
        const sum = list.reduce((s, e) => s + e.minutes, 0);
        const ts = list.reduce((s, e) => s + e.tests, 0);
        return `<div class="daycol ${d === t ? 'today' : ''}" data-date="${d}">
          <div class="head"><b>${J.WEEKDAYS[J.weekday(d)]}</b><small>${fmtShort(d)}</small></div>
          ${list.map((e) => `<div class="mini ${e.done ? 'done' : ''}" title="${esc(e.note)}"><span class="dot" style="background:${e.color}"></span><span class="n">${esc(e.subject)}</span><span class="t">${hmc(e.minutes)}</span></div>`).join('') || '<div class="muted" style="font-size:12px">—</div>'}
          ${sum || ts ? `<div class="foot">${sum ? `<span class="tag time">${hmc(sum)}</span>` : ''}${ts ? `<span class="tag test">${fa(ts)} تست</span>` : ''}</div>` : ''}
        </div>`; }).join('')}
      </div>
      <div class="card goals">${goalsPanel('week', start, entries, goals)}</div>
      <div class="card"><div class="row"><span class="sub">خروجی‌ها برای چاپ یا ذخیره به PDF:</span><span class="spacer"></span><a class="btn primary" href="/allplan.html" target="_blank">${ic('print')} All Plan (جدول هفتگی)</a><a class="btn" href="/report.html?date=${start}" target="_blank">${ic('list')} گزارش تفصیلی این هفته</a><a class="btn" href="/summary.html?date=${start}" target="_blank">${ic('sheet')} جدول خلاصه</a></div></div>`;
    bindNav(7);
    bindDayClicks();
    bindGoals('week', start);
  }

  function bindDayClicks() {
    $$('[data-date]', main).forEach((el) => el.addEventListener('click', () => { state.date = el.dataset.date; setView('day'); }));
  }

  // ===== ماهانه =====
  async function renderMonth() {
    const j = J.parse(state.date);
    const mk = monthKey(state.date);
    const [first, last] = monthRange(state.date);
    const len = J.jalaliMonthLength(j.jy, j.jm);
    const [entries, goals] = await Promise.all([api('GET', `/api/entries?from=${first}&to=${last}`), api('GET', `/api/goals?period=month&key=${mk}`)]);
    const byDay = {};
    for (const e of entries) { (byDay[e.date] ||= { min: 0, tests: 0, n: 0 }); byDay[e.date].min += e.minutes; byDay[e.date].tests += e.tests; byDay[e.date].n++; }
    const max = Math.max(60, ...Object.values(byDay).map((x) => x.min));
    const total = entries.reduce((s, e) => s + e.minutes, 0);
    const tests = entries.reduce((s, e) => s + e.tests, 0);
    const t = today();
    const offset = J.weekday(first);
    let cells = '';
    for (let i = 0; i < offset; i++) cells += '<div class="cell empty"></div>';
    for (let d = 1; d <= len; d++) {
      const ds = `${mk}-${String(d).padStart(2, '0')}`;
      const x = byDay[ds];
      const lvl = x ? Math.min(4, Math.ceil((x.min / max) * 4)) : 0;
      cells += `<div class="cell ${ds === t ? 'today' : ''} ${lvl ? 'l' + lvl : ''}" data-date="${ds}">
        <span class="n">${fa(d)}</span>
        ${x ? `<span class="h">${ic('clock')}${hmc(x.min)}</span>${x.tests ? `<span class="c">${fa(x.tests)} تست</span>` : ''}` : ''}
      </div>`;
    }
    main.innerHTML = dateNav(`${J.MONTHS[j.jm - 1]} ${fa(j.jy)}`, '', 'month') + `
      <div class="kpis">
        <div class="kpi accent"><span class="l">${ic('clock')} مطالعهٔ ماه</span><span class="v">${hours(total)}<small>ساعت</small></span></div>
        <div class="kpi"><span class="l">${ic('tests')} تست ماه</span><span class="v">${fa(tests)}</span></div>
        <div class="kpi"><span class="l">${ic('sun')} روز مطالعه</span><span class="v">${fa(Object.keys(byDay).length)}<small>از ${fa(len)}</small></span></div>
      </div>
      <div class="card">
        <div class="month">${J.WEEKDAYS.map((w) => `<div class="wd">${w}</div>`).join('')}${cells}</div>
      </div>
      <div class="card goals">${goalsPanel('month', mk, entries, goals)}</div>`;
    bindNav('month');
    bindDayClicks();
    bindGoals('month', mk);
  }

  // ===== هدف‌ها =====
  function goalsPanel(period, key, entries, goals) {
    const label = period === 'week' ? 'هفته' : 'ماه';
    const total = entries.reduce((s, e) => s + e.minutes, 0);
    const overall = goals.find((g) => g.subject_id === 0)?.minutes || 0;
    const perSub = {};
    for (const e of entries) perSub[e.subject_id] = (perSub[e.subject_id] || 0) + e.minutes;
    const bar = (done, goal) => goal ? `<div class="progress"><div class="${done >= goal ? 'over' : ''}" style="width:${Math.min(100, (done / goal) * 100)}%"></div></div>` : '';
    return `<div class="card-head"><h2>${ic('target')} هدف ${label}</h2></div>
      <div class="goal-main">
        <label class="field"><span>هدف کلی (ساعت)</span><input class="input num" type="number" min="0" step="0.5" data-goal="0" value="${overall ? overall / 60 : ''}" placeholder="مثلاً ۳۰"></label>
        <div>
          <div class="txt">${overall
            ? `<span><b>${hours(total)}</b> از ${hours(overall)} ساعت</span><span class="${total >= overall ? '' : 'muted'}"><b>${fa(pct(total, overall))}٪</b>${total >= overall ? ' 🎉' : ''}</span>`
            : `<span class="muted">هدفی برای این ${label} تعیین نشده — تا حالا <b>${hours(total)}</b> ساعت مطالعه کردی</span>`}</div>
          ${bar(total, overall)}
        </div>
      </div>
      <details style="margin-top:12px"><summary>${ic('right', 'sm')} هدف به تفکیک درس</summary>
      <table><tr><th>درس</th><th>مطالعه‌شده</th><th>هدف (ساعت)</th><th class="bar">پیشرفت</th></tr>
      ${activeSubjects().map((s) => { const g = goals.find((x) => x.subject_id === s.id)?.minutes || 0; const d = perSub[s.id] || 0; return `<tr>
        <td>${subjName(s)}</td>
        <td class="num">${d ? hm(d) : '<span class="muted">—</span>'}</td>
        <td><input class="input num" type="number" min="0" step="0.5" data-goal="${s.id}" value="${g ? g / 60 : ''}"></td>
        <td class="bar">${bar(d, g)}${g ? `<span class="muted">${fa(pct(d, g))}٪</span>` : ''}</td></tr>`; }).join('')}
      </table></details>`;
  }
  function bindGoals(period, key) {
    $$('[data-goal]', main).forEach((inp) => inp.addEventListener('change', async () => {
      await api('PUT', '/api/goals', { period, key, subject_id: +inp.dataset.goal, minutes: Math.round((+en(inp.value) || 0) * 60) });
      toast('هدف ذخیره شد'); render();
    }));
  }

  // ===== آمار =====
  let statsRange = { kind: 'month', from: '', to: '' };
  function rangeFor(kind) {
    const t = today();
    if (kind === 'week') return [J.weekStart(t), J.addDays(J.weekStart(t), 6)];
    if (kind === 'month') return monthRange(t);
    if (kind === '30') return [J.addDays(t, -29), t];
    if (kind === 'all') return ['1300-01-01', '1500-12-29'];
    return [statsRange.from || t, statsRange.to || t];
  }
  async function renderStats() {
    const [from, to] = rangeFor(statsRange.kind);
    const [st, rec] = await Promise.all([api('GET', `/api/stats?from=${from}&to=${to}`), api('GET', '/api/records')]);
    const studiedDays = st.byDay.length;
    const avg = studiedDays ? st.total / studiedDays : 0;
    const maxSub = Math.max(1, ...st.bySubject.map((s) => s.minutes));
    const kinds = [['week', 'این هفته'], ['month', 'این ماه'], ['30', '۳۰ روز اخیر'], ['all', 'همه'], ['custom', 'بازهٔ دلخواه']];
    const isAll = statsRange.kind === 'all';

    main.innerHTML = `
      <div class="card">
        <div class="range">
          ${kinds.map(([k, l]) => `<button class="btn pill ${statsRange.kind === k ? 'active' : ''}" data-kind="${k}">${l}</button>`).join('')}
          <span class="spacer"></span>
          ${isAll ? '<span class="sub">کل تاریخچه</span>' : `<span class="sub">${fmtShort(from)} تا ${fmtDate(to)}</span>`}
        </div>
        ${statsRange.kind === 'custom' ? `<div class="row" style="margin-top:12px">
          <span class="sub">از</span><button class="btn" id="rf">${ic('calendar', 'sm')} ${fmtDate(from)}</button>
          <span class="sub">تا</span><button class="btn" id="rt">${ic('calendar', 'sm')} ${fmtDate(to)}</button></div>` : ''}
      </div>
      <div class="kpis">
        <div class="kpi accent"><span class="l">${ic('clock')} ساعت مطالعه</span><span class="v">${hours(st.total)}<small>ساعت</small></span></div>
        <div class="kpi"><span class="l">${ic('tests')} تعداد تست</span><span class="v">${fa(st.tests)}</span></div>
        <div class="kpi"><span class="l">${ic('target')} درصد میانگین</span><span class="v">${st.percent == null ? '—' : fa(st.percent) + '٪'}</span></div>
        <div class="kpi"><span class="l">${ic('sun')} روز مطالعه</span><span class="v">${fa(studiedDays)}</span></div>
        <div class="kpi"><span class="l">${ic('sigma')} میانگین در روز مطالعه</span><span class="v">${hours(avg)}<small>ساعت</small></span></div>
        <div class="kpi"><span class="l">${ic('check')} انجام‌شده</span><span class="v">${st.count ? fa(pct(st.done, st.count)) + '٪' : '—'}<small>${fa(st.done)}/${fa(st.count)}</small></span></div>
      </div>

      <div class="card">
        <div class="card-head"><h2>${ic('trophy')} بهترین رکوردها</h2><span class="spacer"></span><span class="muted">روی کل تاریخچه</span></div>
        <div class="records">
          ${recCard('gold', 'clock', 'بیشترین مطالعه در یک روز', rec.bestDay ? hm(rec.bestDay.minutes) : '—', rec.bestDay ? fmtFull(rec.bestDay.date) : 'هنوز رکوردی نداری')}
          ${recCard('blue', 'tests', 'بیشترین تست در یک روز', rec.bestTestDay?.tests ? fa(rec.bestTestDay.tests) + ' تست' : '—', rec.bestTestDay?.tests ? fmtFull(rec.bestTestDay.date) : 'هنوز تستی ثبت نشده')}
          ${recCard('gold', 'star', 'بهترین هفته (مطالعه)', rec.bestWeek ? hours(rec.bestWeek.minutes) + ' ساعت' : '—', rec.bestWeek ? 'هفتهٔ ' + fmtShort(rec.bestWeek.key) : '')}
          ${recCard('blue', 'star', 'بهترین هفته (تست)', rec.bestTestWeek?.tests ? fa(rec.bestTestWeek.tests) + ' تست' : '—', rec.bestTestWeek?.tests ? 'هفتهٔ ' + fmtShort(rec.bestTestWeek.key) : '')}
          ${recCard('red', 'flame', 'زنجیرهٔ فعلی', fa(rec.currentStreak) + ' روز', rec.currentStreak ? 'روزهای متوالی با مطالعه' : 'امروز شروع کن!')}
          ${recCard('green', 'flame', 'طولانی‌ترین زنجیره', fa(rec.longestStreak) + ' روز', `مجموع ${fa(rec.totalDays)} روز مطالعه`)}
        </div>
      </div>

      <div class="card bars">
        <div class="card-head"><h2>${ic('book')} به تفکیک درس</h2></div>
        ${st.bySubject.length ? st.bySubject.map((s) => `<div class="b">
          <span class="subj-name"><span class="dot" style="background:${s.color}"></span>${esc(s.name)}</span>
          <div class="track"><div class="fill" style="width:${(s.minutes / maxSub) * 100}%;background:${s.color}"></div></div>
          <span class="val"><b>${hours(s.minutes)} س</b><span class="muted">(${fa(pct(s.minutes, st.total))}٪)</span>${s.tests ? `<span class="tag test">${fa(s.tests)} تست</span>` : ''}${pctTag(s.percent)}</span>
        </div>`).join('') : `<div class="empty">${ic('inbox')}در این بازه داده‌ای نیست</div>`}
      </div>
      <div class="card"><div class="card-head"><h2>${ic('chart')} روند روزانه</h2><span class="spacer"></span><span class="muted">ساعت مطالعه در هر روز</span></div>${trendChart(st.byDay, from, to)}</div>`;

    $$('[data-kind]', main).forEach((b) => b.addEventListener('click', () => { statsRange.kind = b.dataset.kind; if (b.dataset.kind === 'custom') { statsRange.from = from; statsRange.to = to; } render(); }));
    $('#rf')?.addEventListener('click', (e) => openPicker(e.currentTarget, from, (d) => { statsRange.from = d; if (d > statsRange.to) statsRange.to = d; render(); }));
    $('#rt')?.addEventListener('click', (e) => openPicker(e.currentTarget, to, (d) => { statsRange.to = d; if (d < statsRange.from) statsRange.from = d; render(); }));
  }
  const recCard = (color, icon, title, value, desc) => `<div class="rec"><span class="ico ${color}">${ic(icon)}</span><div><div class="t">${title}</div><div class="v">${value}</div><div class="d">${desc}</div></div></div>`;

  function trendChart(byDay, from, to) {
    const map = Object.fromEntries(byDay.map((x) => [x.date, x.minutes]));
    const days = [];
    if (from < '1301-01-01') {
      if (!byDay.length) return `<div class="empty">${ic('inbox')}داده‌ای نیست</div>`;
      from = byDay[0].date; to = today() > byDay[byDay.length - 1].date ? today() : byDay[byDay.length - 1].date;
    }
    for (let d = from; d <= to && days.length < 400; d = J.addDays(d, 1)) days.push(d);
    const shown = days.slice(-90);
    const W = 900, H = 220, padL = 36, padB = 26, padT = 10;
    const max = Math.max(60, ...shown.map((d) => map[d] || 0));
    const bw = (W - padL) / shown.length;
    const y = (m) => padT + (H - padT - padB) * (1 - m / max);
    const grid = [0, 0.5, 1].map((f) => `<line x1="${padL}" x2="${W}" y1="${y(max * f)}" y2="${y(max * f)}"/><text x="${padL - 6}" y="${y(max * f) + 4}" text-anchor="end">${hours(max * f)}</text>`).join('');
    const bars = shown.map((d, i) => { const m = map[d] || 0; return m ? `<rect class="bar" x="${padL + i * bw + 1}" y="${y(m)}" width="${Math.max(2, bw - 2)}" height="${H - padB - y(m)}" rx="2"><title>${fmtFull(d)}: ${hm(m)}</title></rect>` : ''; }).join('');
    const step = Math.ceil(shown.length / 12);
    const labels = shown.map((d, i) => (i % step === 0 ? `<text x="${padL + i * bw + bw / 2}" y="${H - 8}" text-anchor="middle">${fmtShort(d)}</text>` : '')).join('');
    return `<svg class="trend" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" direction="ltr">${grid}${bars}${labels}</svg>`;
  }

  // ===== ورود از اکسل =====
  let importState = { result: null, fileName: '', selected: new Set() };
  async function renderImport() {
    const r = importState.result;
    main.innerHTML = `
      <div class="card">
        <div class="card-head"><h2>${ic('sheet')} ورود دسته‌ای از اکسل</h2></div>
        <div class="steps">
          <div class="step"><span class="num">۱</span><div><b>قالب رو دانلود کن</b><div class="sub">فایل اکسل با سرستون‌های درست و لیست درس‌ها. شیت «راهنما» داخلش توضیح هر ستون و نمونه داره.</div>
            <div class="row" style="margin-top:8px"><a class="btn primary sm" href="/api/import/template.xlsx" download="momentum-template.xlsx">${ic('download', 'sm')} دانلود قالب خالی</a>
            <a class="btn sm" href="/api/import/sample.xlsx" download="momentum-sample.xlsx">${ic('sheet', 'sm')} دانلود نمونهٔ پرشده (۴ ردیف)</a></div></div></div>
          <div class="step"><span class="num">۲</span><div><b>برنامه‌های قبلی‌ت رو توش بریز</b><div class="sub">فقط <b>تاریخ</b>، <b>درس</b> و <b>مدت</b> اجباری‌اند. مدت به دقیقه (۱۸۰) یا ساعت:دقیقه (3:00). تاریخ شمسی مثل ۱۴۰۵/۰۶/۲۷. اسم درس باید دقیقاً مثل داخل اپ باشه (لیست داخل قالب هست).</div></div></div>
          <div class="step"><span class="num">۳</span><div><b>فایل رو برگردون</b><div class="sub">بررسی می‌کنم؛ اگه قالب یا ردیفی مشکل داشته باشه می‌گم. چیزی اضافه نمی‌شه تا خودت تأیید کنی.</div>
            <label class="btn sm" style="margin-top:8px">${ic('upload', 'sm')} انتخاب فایل (xlsx یا csv) <input type="file" id="impFile" accept=".xlsx,.csv" hidden></label>
            <span class="muted" id="impName">${esc(importState.fileName)}</span></div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>${ic('help')} هر ستون چی باید باشه؟</h2><span class="spacer"></span><span class="muted">فقط ۳ ستون اول با * اجباری‌اند؛ بقیه رو خالی بذار</span></div>
        <div class="imp-table-wrap"><table class="imp-table cols-guide">
          <tr><th>ستون</th><th>اجباری؟</th><th>چی بنویسم</th><th>مثال درست</th><th>اشتباه رایج</th></tr>
          <tr><td><b>تاریخ</b></td><td class="req">بله *</td><td>تاریخ شمسی: سال/ماه/روز. اعداد فارسی یا انگلیسی، با / یا -</td><td class="ex">1405/06/27<br>۱۴۰۵/۰۶/۲۷<br>1405-6-7</td><td class="no">27/06/1405 (روز اول نه)<br>۲۷ شهریور (اسم ماه نه)</td></tr>
          <tr><td><b>درس</b></td><td class="req">بله *</td><td>دقیقاً یکی از درس‌های اپ (توی قالب لیست کشویی داره). درس جدید می‌خوای؟ اول توی تنظیمات بساز</td><td class="ex">گسسته<br>ساختمان داده<br>هوش</td><td class="no">ساختمان (ناقص)<br>هوش مصنوعی (اسم اپ «هوش» است)<br>امار (باید «آمار»)</td></tr>
          <tr><td><b>مدت کل</b></td><td class="req">بله * <span class="muted">(مگر ستون‌های زمانی دیگه پر باشن)</span></td><td><b>دقیقه</b> یا <b>ساعت:دقیقه</b>. اکسل اگه 1:45 رو به ساعت تبدیل کرد اشکالی نداره</td><td class="ex">180 (= ۳ ساعت)<br>3:00<br>1:45<br>۲ ساعت</td><td class="no">3 (یعنی ۳ دقیقه، نه ۳ ساعت!)<br>1.5 (یعنی ۱ دقیقه)</td></tr>
          <tr><td>ساعت شروع / پایان</td><td>نه</td><td>ساعت ۲۴ساعته. اگه هر دو پر باشن و «مدت کل» خالی، مدت خودش حساب می‌شه</td><td class="ex">08:30 و 10:00<br>23:30 و 00:15 (عبور از نیمه‌شب اوکیه)</td><td class="no">8.30<br>۸ صبح</td></tr>
          <tr><td>خواندن / مرور / تست زدن</td><td>نه</td><td><b>دقیقه</b>. اگه «مدت کل» خالی باشه، جمع این سه می‌شه مدت کل</td><td class="ex">خواندن 90، مرور 30 ← مدت کل ۱۲۰</td><td class="no">1:30 (این ستون‌ها فقط دقیقه)</td></tr>
          <tr><td>تعداد تست / درست / غلط</td><td>نه</td><td>عدد صحیح. درست + غلط نباید از تعداد کل بیشتر بشه (بقیه = نزده)</td><td class="ex">60 / 42 / 9<br>فقط 30 (بدون درست/غلط)</td><td class="no">تعداد 20 ولی درست 15 + غلط 8 = 23</td></tr>
          <tr><td>شرح</td><td>نه</td><td>هر متنی. برای فیلم‌ها شماره جلسه بنویس</td><td class="ex">فیلم جلسه ۱۲<br>فصل ۳ تا صفحه ۴۰</td><td></td></tr>
          <tr><td>انجام شد</td><td>نه</td><td>بله یا خیر. خالی = بله</td><td class="ex">بله<br>خیر</td><td class="no">ok / done / تیک ✓</td></tr>
        </table></div>
        <div class="warn-box" style="margin-top:10px">${ic('info', 'sm')} <span>سرستون ردیف اول رو دست نزن و ستون‌ها رو جابه‌جا نکن. ردیف‌های خالی نادیده گرفته می‌شن. چند ردیف با یک تاریخ و درس (چند جلسه در روز) مشکلی نداره. اگه مطمئن نیستی، «نمونهٔ پرشده» رو دانلود کن و مثل اون بنویس.</span></div>
      </div>
      <div id="impResult">${r ? importPreview(r) : ''}</div>`;

    $('#impFile').addEventListener('change', async (e) => {
      const file = e.target.files[0]; if (!file) return;
      $('#impResult').innerHTML = '<div class="card"><div class="empty">در حال بررسی فایل…</div></div>';
      try {
        const data = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result.split(',')[1]); fr.onerror = rej; fr.readAsDataURL(file); });
        const result = await api('POST', '/api/import/analyze', { name: file.name, data });
        importState = { result, fileName: file.name, selected: new Set(result.rows.filter((x) => x.ok && !x.warnings.some((w) => w.includes('تکراری'))).map((x) => x.row)) };
        render();
      } catch (err) { importState = { result: null, fileName: file.name, selected: new Set() }; $('#impResult').innerHTML = `<div class="card danger-zone"><div class="card-head"><h2>${ic('alert')} فایل قابل استفاده نیست</h2></div><p>${esc(err.message)}</p><p class="sub">مطمئن شو از قالب دانلودشده استفاده کردی و ردیف اول سرستون‌هاست.</p></div>`; }
    });
    if (r) bindImportPreview(r);
  }
  function importPreview(r) {
    const sel = importState.selected;
    const dup = r.rows.filter((x) => x.ok && x.warnings.some((w) => w.includes('تکراری'))).length;
    return `<div class="card">
      <div class="card-head"><h2>${ic('list')} پیش‌نمایش</h2><span class="spacer"></span>
        <span class="tag done">${fa(r.ok)} معتبر</span>${r.bad ? `<span class="tag pct bad">${fa(r.bad)} خطا</span>` : ''}${dup ? `<span class="tag pending">${fa(dup)} احتمالاً تکراری</span>` : ''}</div>
      ${r.bad ? `<div class="warn-box">${ic('alert', 'sm')} ردیف‌های قرمز اضافه نمی‌شن. توی اکسل درستشون کن و دوباره فایل رو بده، یا فقط ردیف‌های معتبر رو اضافه کن.</div>` : ''}
      ${dup ? `<div class="warn-box">${ic('info', 'sm')} ردیف‌های زرد قبلاً با همین تاریخ/درس/مدت/شرح توی اپ هستن؛ پیش‌فرض تیک ندارن. اگه واقعاً جدا هستن تیک بزن.</div>` : ''}
      <div class="imp-table-wrap"><table class="imp-table">
        <tr><th><input type="checkbox" id="impAll" title="همه"></th><th>#</th><th>تاریخ</th><th>درس</th><th>بازه</th><th>مدت</th><th>خ/م/ت</th><th>تست</th><th>درصد</th><th>شرح</th><th>وضعیت</th><th>نتیجهٔ بررسی</th></tr>
        ${r.rows.map((x) => `<tr class="${x.ok ? (x.warnings.length ? 'warn' : 'ok') : 'bad'}" data-row="${x.row}">
          <td>${x.ok ? `<input type="checkbox" data-sel="${x.row}" ${sel.has(x.row) ? 'checked' : ''}>` : ''}</td>
          <td class="num muted">${fa(x.row)}</td>
          <td class="num">${x.date ? fmtShort(x.date) + ' ' + fa(J.parse(x.date).jy) : '<span class="muted">؟</span>'}</td>
          <td>${x.subject_id ? `<span class="subj-name"><span class="dot" style="background:${x.color}"></span>${esc(x.subject_name)}</span>` : `<span style="color:var(--danger)">${esc(x.subject_name || '—')}</span>`}</td>
          <td class="num">${x.start_time ? fa(x.start_time) + (x.end_time ? '–' + fa(x.end_time) : '') : '—'}</td>
          <td class="num"><b>${x.minutes ? hm(x.minutes) : '—'}</b></td>
          <td class="num">${x.study_min || x.review_min || x.test_min ? `${fa(x.study_min)}/${fa(x.review_min)}/${fa(x.test_min)}` : '—'}</td>
          <td class="num">${x.tests ? fa(x.tests) + (x.correct + x.wrong ? ` (${fa(x.correct)}✓ ${fa(x.wrong)}✗)` : '') : '—'}</td>
          <td class="num">${x.tests && x.correct + x.wrong ? pctTag(pctOf(x.correct, x.wrong, x.tests)) : '—'}</td>
          <td class="note">${esc(x.note) || '<span class="muted">—</span>'}</td>
          <td>${x.done ? '<span class="tag done">انجام شد</span>' : '<span class="tag pending">مانده</span>'}</td>
          <td class="msgs">${x.errors.map((m) => `<div class="err">✗ ${esc(m)}</div>`).join('')}${x.warnings.map((m) => `<div class="wrn">! ${esc(m)}</div>`).join('')}${!x.errors.length && !x.warnings.length ? '<span class="okm">✓ معتبر</span>' : ''}</td>
        </tr>`).join('')}
      </table></div>
      <div class="row" style="margin-top:14px">
        <span class="sub">قبل از افزودن، یک بکاپ خودکار گرفته می‌شود.</span>
        <span class="spacer"></span>
        <button class="btn" id="impCancel">انصراف</button>
        <button class="btn primary" id="impCommit" ${sel.size ? '' : 'disabled'}>${ic('check')} افزودن <span id="impCount">${fa(sel.size)}</span> ردیف به برنامه</button>
      </div>
    </div>`;
  }
  function bindImportPreview(r) {
    const sel = importState.selected;
    const refresh = () => { $('#impCount').textContent = fa(sel.size); $('#impCommit').disabled = !sel.size; };
    $$('[data-sel]', main).forEach((c) => c.addEventListener('change', () => { c.checked ? sel.add(+c.dataset.sel) : sel.delete(+c.dataset.sel); refresh(); }));
    $('#impAll').addEventListener('change', (e) => { $$('[data-sel]', main).forEach((c) => { c.checked = e.target.checked; c.checked ? sel.add(+c.dataset.sel) : sel.delete(+c.dataset.sel); }); refresh(); });
    $('#impCancel').addEventListener('click', () => { importState = { result: null, fileName: '', selected: new Set() }; render(); });
    $('#impCommit').addEventListener('click', async () => {
      const rows = r.rows.filter((x) => x.ok && sel.has(x.row)).map((x) => ({ date: x.date, subject_id: x.subject_id, minutes: x.minutes, start_time: x.start_time, end_time: x.end_time, study_min: x.study_min, review_min: x.review_min, test_min: x.test_min, tests: x.tests, correct: x.correct, wrong: x.wrong, note: x.note, done: x.done }));
      if (!confirm(`${rows.length} ردیف به برنامه اضافه بشه؟`)) return;
      const res = await api('POST', '/api/import/commit', { rows });
      importState = { result: null, fileName: '', selected: new Set() };
      toast(`${fa(res.added)} ردیف اضافه شد`);
      setView('dash');
    });
  }

  // ===== تنظیمات و بکاپ =====
  async function renderSettings() {
    const info = await api('GET', '/api/backups');
    const S = state.settings;
    main.innerHTML = `
      <div class="card">
        <div class="card-head"><h2>${ic('graduation')} پروفایل و کنکور</h2></div>
        <div class="row">
          <label class="field" style="min-width:180px"><span>اسم تو (برای سلام توی داشبورد)</span><input class="input" id="userName" placeholder="مثلاً محمد" value="${esc(S.user_name)}"></label>
          <label class="field" style="flex:1;min-width:200px"><span>عنوان</span><input class="input" id="examTitle" value="${esc(S.exam_title)}"></label>
          <label class="field"><span>تاریخ کنکور</span><button class="btn" id="examDate2">${ic('calendar', 'sm')} ${fmtFull(S.exam_date)}</button></label>
          <label class="field"><span>تم</span><select class="input" id="themeSel">${THEMES.map(([k, , l]) => `<option value="${k}" ${getTheme() === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        </div>
      </div>
      <div class="card subjects-list">
        <div class="card-head"><h2>${ic('book')} درس‌ها</h2><span class="spacer"></span><span class="muted">${fa(activeSubjects().length)} درس فعال</span></div>
        ${state.subjects.map((s) => `<div class="s ${s.archived ? 'archived' : ''}" data-id="${s.id}">
          <input type="color" value="${s.color}" data-f="color" title="رنگ">
          <input type="text" class="input" value="${esc(s.name)}" data-f="name">
          <label class="check"><input type="checkbox" data-f="archived" ${s.archived ? 'checked' : ''}> بایگانی</label>
          <button class="btn sm" data-save>${ic('save', 'sm')} ذخیره</button>
          <button class="btn sm danger" data-del>${ic('trash', 'sm')}</button>
        </div>`).join('')}
        <form id="addSubject">
          <input type="color" name="color" value="#2563eb" title="رنگ">
          <input type="text" class="input" name="name" placeholder="نام درس جدید…" required>
          <button class="btn primary">${ic('plus')} افزودن درس</button>
        </form>
      </div>
      <div class="card">
        <div class="card-head"><h2>${ic('database')} بکاپ و بازیابی</h2></div>
        <div class="info-line">${ic('database', 'sm')} دیتابیس اصلی: <code>${esc(info.dbFile)}</code></div>
        <div class="info-line">${ic('folder', 'sm')} بکاپ خودکار (هر اجرا، هر ۶ ساعت، هنگام خروج — ${fa(30)} فایل آخر): <code>${esc(info.dir)}</code></div>
        <div class="backup-actions">
          <a class="btn primary" href="/api/backup" download="plan-backup-${today()}.json">${ic('download')} بکاپ کامل JSON</a>
          <a class="btn" href="/api/backup.csv" download="plan-${today()}.csv">${ic('sheet')} خروجی اکسل (CSV)</a>
          <button class="btn" id="snap">${ic('camera')} ساخت بکاپ فوری (.db)</button>
          <label class="btn">${ic('upload')} بازیابی از JSON <input type="file" id="restore" accept=".json" hidden></label>
        </div>
        <p class="sub">بکاپ JSON شامل <b>همه چیز</b> از روز اول است: درس‌ها، همهٔ آیتم‌های مطالعه با جزئیات، هدف‌ها، یادداشت‌های روزانه و تنظیمات. هر چند وقت یک‌بار یکی بگیر و جای امن (مثلاً Google Drive یا تلگرام) نگه دار.</p>
        <details><summary>${ic('right', 'sm')} فایل‌های بکاپ (${fa(info.files.length)})</summary>
          <ul class="file-list">${info.files.map((f) => `<li>${ic('database', 'sm')}<code>${esc(f.name)}</code><span class="muted">${fa(Math.round(f.size / 1024))} KB</span></li>`).join('') || '<li class="muted">هنوز بکاپی نیست</li>'}</ul>
        </details>
      </div>
      <div class="card danger-zone">
        <div class="card-head"><h2>${ic('alert')} منطقهٔ خطر</h2></div>
        <p class="sub">پاک کردن <b>کل تاریخچه</b> (همهٔ آیتم‌های مطالعه، هدف‌ها و یادداشت‌های روزانه). درس‌ها و تنظیمات می‌مانند. قبل از پاک شدن، یک بکاپ خودکار (.db و .json) در پوشهٔ بکاپ ذخیره می‌شود — ولی بهتره خودت هم یه بکاپ JSON بگیری.</p>
        <div class="row">
          <a class="btn" href="/api/backup" download="plan-backup-${today()}.json">${ic('download')} اول بکاپ بگیر</a>
          <button class="btn danger" id="wipe">${ic('trash')} پاک کردن کل تاریخچه…</button>
        </div>
      </div>
      <div class="card"><div class="row"><span class="sub">راهنمای استفاده، نصب و اشتراک‌گذاری با دوستان:</span><span class="spacer"></span><a class="btn" href="/guide.html" target="_blank">${ic('help')} راهنما</a><button class="btn" id="quitApp" title="سرور خاموش می‌شود؛ دفعهٔ بعد با میان‌بر یا start.bat اجرا کن">${ic('x')} خاموش کردن Momentum</button></div></div>
      <div class="credit"><span class="logo">${ic('zap')}</span><div><b>Momentum</b> — برنامه‌ریز مطالعه<br><span class="muted">ساخته شده توسط <b>سینیور ایلیا</b></span></div></div>`;

    $('#userName').addEventListener('change', async (e) => { state.settings = await api('PUT', '/api/settings', { user_name: e.target.value.trim() }); toast(e.target.value.trim() ? `سلام ${e.target.value.trim()}! ذخیره شد` : 'ذخیره شد'); });
    $('#examTitle').addEventListener('change', async (e) => { state.settings = await api('PUT', '/api/settings', { exam_title: e.target.value }); toast('ذخیره شد'); });
    $('#examDate2').addEventListener('click', (e) => openPicker(e.currentTarget, S.exam_date, async (d) => { state.settings = await api('PUT', '/api/settings', { exam_date: d }); toast('تاریخ کنکور ذخیره شد'); render(); }));
    $('#themeSel').addEventListener('change', (e) => applyTheme(e.target.value));
    $$('.s', main).forEach((row) => {
      const id = +row.dataset.id;
      const val = (f) => row.querySelector(`[data-f=${f}]`);
      row.querySelector('[data-save]').addEventListener('click', async () => {
        await api('PUT', `/api/subjects/${id}`, { name: val('name').value, color: val('color').value, archived: val('archived').checked ? 1 : 0 });
        state.subjects = []; toast('ذخیره شد'); render();
      });
      row.querySelector('[data-del]').addEventListener('click', async () => {
        if (!confirm('حذف این درس؟ (فقط اگر آیتمی نداشته باشد)')) return;
        await api('DELETE', `/api/subjects/${id}`); state.subjects = []; toast('حذف شد'); render();
      });
    });
    $('#addSubject').addEventListener('submit', async (e) => {
      e.preventDefault(); const f = new FormData(e.target);
      await api('POST', '/api/subjects', { name: f.get('name'), color: f.get('color') });
      state.subjects = []; toast('درس اضافه شد'); render();
    });
    $('#quitApp').addEventListener('click', async () => { if (!confirm('Momentum خاموش شود؟ (بکاپ خودکار گرفته می‌شود؛ دفعهٔ بعد با میان‌بر یا start.bat اجرا کن)')) return; await api('POST', '/api/quit'); main.innerHTML = '<div class="card"><div class="empty">Momentum خاموش شد. می‌تونی این تب رو ببندی. 👋</div></div>'; });
    $('#snap').addEventListener('click', async () => { await api('POST', '/api/backups'); toast('بکاپ ساخته شد'); render(); });
    $('#wipe').addEventListener('click', async () => {
      if (!confirm('⚠️ مرحلهٔ ۱ از ۲\n\nهمهٔ آیتم‌های مطالعه، هدف‌ها و یادداشت‌ها پاک می‌شوند. این کار برگشت‌ناپذیر است (فقط از بکاپ می‌شود برگرداند).\n\nادامه می‌دهی؟')) return;
      const word = prompt('مرحلهٔ ۲ از ۲\n\nبرای تأیید نهایی، دقیقاً عبارت «پاک کن» را بنویس:');
      if (word === null) return;
      if (word.trim() !== 'پاک کن') return toast('عبارت تأیید درست نبود؛ چیزی پاک نشد', true);
      const r = await api('POST', '/api/wipe', { confirm: 'پاک کن' });
      state.settings = null; toast('تاریخچه پاک شد — بکاپ قبل از پاک شدن ذخیره شد'); render();
      alert('تاریخچه پاک شد.\n\nیک بکاپ از قبل پاک شدن اینجا ذخیره شده:\n' + r.backup + '\n\nاگر پشیمان شدی، از «بازیابی از JSON» همین فایل را برگردان.');
    });
    $('#restore').addEventListener('change', async (e) => {
      const file = e.target.files[0]; if (!file) return;
      if (!confirm('همهٔ داده‌های فعلی با محتوای این فایل جایگزین می‌شود (قبلش یک بکاپ خودکار گرفته می‌شود). ادامه؟')) return;
      try {
        const data = JSON.parse(await file.text());
        await api('POST', '/api/restore', data);
        state.subjects = []; state.settings = null; toast('بازیابی شد'); render();
      } catch (err) { toast('فایل نامعتبر: ' + err.message, true); }
    });
  }

  // ---------- init ----------
  renderHeader();
  render();
})();
