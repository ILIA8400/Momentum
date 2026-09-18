/* global Jalali */
(async () => {
  const J = Jalali;
  const FA = '۰۱۲۳۴۵۶۷۸۹';
  const fa = (n) => String(n).replace(/\d/g, (d) => FA[d]);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hmc = (min) => { min = min | 0; return fa(Math.floor(min / 60)) + ':' + fa(String(min % 60).padStart(2, '0')); };
  const hours = (min) => fa((min / 60).toFixed(1).replace(/\.0$/, ''));
  const fmtDate = (s) => { const j = J.parse(s); return `${fa(j.jd)} ${J.MONTHS[j.jm - 1]} ${fa(j.jy)}`; };
  const fmtShort = (s) => { const j = J.parse(s); return `${fa(j.jd)} ${J.MONTHS[j.jm - 1]}`; };
  const pctCls = (p) => (p == null ? '' : p >= 50 ? 'good' : p < 20 ? 'bad' : '');

  const params = new URLSearchParams(location.search);
  const date = params.get('date') || J.todayJalali();
  const w = await (await fetch(`/api/week?date=${date}`)).json();
  const { start, end, entries, notes, goals, stats, settings } = w;
  document.title = `All Plan — هفتهٔ ${fmtShort(start)} تا ${fmtShort(end)}`;
  document.getElementById('prev').href = `/report.html?date=${J.addDays(start, -7)}`;
  document.getElementById('next').href = `/report.html?date=${J.addDays(start, 7)}`;

  const days = Array.from({ length: 7 }, (_, i) => J.addDays(start, i));
  const noteMap = Object.fromEntries(notes.map((n) => [n.date, n.text]));
  const goal = goals.find((g) => g.subject_id === 0)?.minutes || 0;
  const doneCount = entries.filter((e) => e.done).length;
  const examDays = J.diffDays(J.todayJalali(), settings.exam_date);
  const maxSub = Math.max(1, ...stats.bySubject.map((s) => s.minutes));

  const dayBlock = (d) => {
    const list = entries.filter((e) => e.date === d);
    const sum = list.reduce((s, e) => s + e.minutes, 0);
    const tests = list.reduce((s, e) => s + e.tests, 0);
    const dn = list.filter((e) => e.done).length;
    return `<div class="day">
      <div class="dh"><span>${J.WEEKDAYS[J.weekday(d)]}</span><span style="font-weight:500;color:var(--ink-2)">${fmtDate(d)}</span>
        <span class="sum">${list.length ? `<span>⏱ ${hmc(sum)}</span><span>✎ ${fa(tests)} تست</span><span>✓ ${fa(dn)}/${fa(list.length)}</span>` : ''}</span></div>
      ${list.length ? `<table>
        <thead><tr><th style="width:18%">درس</th><th class="n" style="width:12%">بازه</th><th class="n" style="width:8%">مدت</th><th class="n" style="width:14%">خواندن/مرور/تست</th><th class="n" style="width:12%">تست (✓/✗)</th><th class="n" style="width:7%">درصد</th><th>شرح</th><th class="n" style="width:6%">وضعیت</th></tr></thead>
        <tbody>${list.map((e) => `<tr>
          <td><span class="dot" style="background:${e.color}"></span>${esc(e.subject)}</td>
          <td class="n">${e.start_time ? `${fa(e.start_time)}${e.end_time ? '–' + fa(e.end_time) : ''}` : '—'}</td>
          <td class="n"><b>${hmc(e.minutes)}</b></td>
          <td class="n">${e.study_min || e.review_min || e.test_min ? `${fa(e.study_min)}/${fa(e.review_min)}/${fa(e.test_min)}` : '—'}</td>
          <td class="n">${e.tests ? `${fa(e.tests)}${e.correct + e.wrong ? ` (${fa(e.correct)}/${fa(e.wrong)})` : ''}` : '—'}</td>
          <td class="n pct ${pctCls(e.percent)}">${e.percent == null ? '—' : fa(e.percent) + '٪'}</td>
          <td class="note">${esc(e.note)}</td>
          <td class="n">${e.done ? '<span class="ok">✓</span>' : '<span class="no">○</span>'}</td>
        </tr>`).join('')}</tbody></table>` : '<div class="empty">مطالعه‌ای ثبت نشده</div>'}
      ${noteMap[d] ? `<div class="daynote">📝 ${esc(noteMap[d])}</div>` : ''}
    </div>`;
  };

  document.getElementById('page').innerHTML = `
    <div class="head">
      <div>
        <div class="brand">ALL PLAN · گزارش هفتگی</div>
        <h1>هفتهٔ ${fmtShort(start)} تا ${fmtDate(end)}</h1>
        <div style="color:var(--ink-2);font-size:12px">${esc(settings.exam_title)}: ${examDays > 0 ? `<b>${fa(examDays)}</b> روز مانده` : '—'} · ${fmtDate(settings.exam_date)}</div>
      </div>
      <div class="meta">تاریخ گزارش: ${fmtDate(J.todayJalali())}<br><span class="ltr">${start} → ${end}</span></div>
    </div>
    <div class="kpis">
      <div class="kpi"><div class="l">مطالعهٔ هفته</div><div class="v">${hours(stats.total)}<small>ساعت</small></div></div>
      <div class="kpi"><div class="l">تعداد تست</div><div class="v">${fa(stats.tests)}</div></div>
      <div class="kpi"><div class="l">درصد میانگین</div><div class="v">${stats.percent == null ? '—' : fa(stats.percent) + '٪'}</div></div>
      <div class="kpi"><div class="l">روز مطالعه</div><div class="v">${fa(stats.byDay.length)}<small>از ۷</small></div></div>
      <div class="kpi"><div class="l">انجام‌شده</div><div class="v">${fa(doneCount)}<small>از ${fa(entries.length)}</small></div></div>
    </div>
    ${goal ? `<div class="goal"><span>هدف هفته: <b>${hours(goal)}</b> ساعت</span><div class="bar"><div style="width:${Math.min(100, Math.round((stats.total / goal) * 100))}%"></div></div><b>${fa(Math.round((stats.total / goal) * 100))}٪</b></div>` : ''}

    <h2>خلاصه به تفکیک درس</h2>
    ${stats.bySubject.length ? `<table class="subs"><thead><tr><th>درس</th><th style="width:35%">سهم</th><th class="n">مدت</th><th class="n">خواندن</th><th class="n">مرور</th><th class="n">تست (دقیقه)</th><th class="n">تعداد تست</th><th class="n">درصد</th></tr></thead>
      <tbody>${stats.bySubject.map((s) => `<tr>
        <td><span class="dot" style="background:${s.color}"></span>${esc(s.name)}</td>
        <td><div class="bar"><div style="width:${(s.minutes / maxSub) * 100}%;background:${s.color}"></div></div></td>
        <td class="n"><b>${hmc(s.minutes)}</b></td><td class="n">${fa(s.study_min)}</td><td class="n">${fa(s.review_min)}</td><td class="n">${fa(s.test_min)}</td>
        <td class="n">${fa(s.tests)}</td><td class="n pct ${pctCls(s.percent)}">${s.percent == null ? '—' : fa(s.percent) + '٪'}</td>
      </tr>`).join('')}</tbody></table>` : '<div class="empty">این هفته چیزی ثبت نشده</div>'}

    <h2>برنامهٔ روزانه</h2>
    ${days.map(dayBlock).join('')}
    <div class="foot"><span>Momentum — All Plan</span><span>${fa(entries.length)} آیتم · ${hours(stats.total)} ساعت · ${fa(stats.tests)} تست</span></div>`;
})();
