(() => {
  'use strict';
  const { copy: C, students, lessons, today, initialRecords, version } = window.DEMO_CONTENT;
  const root = document.getElementById('app');
  const reviewEnabled = new URLSearchParams(location.search).get('review') === '1';
  const state = { student: 's1', records: structuredClone(initialRecords), selectedDate: today, calendarMode: 'week', drafts: {}, pending: new Set(), mode: 'normal', failNext: false, textScale: '100' };
  // Includes safe-area padding and recalculates when text size or viewport changes.
  const navObserver = new ResizeObserver(entries => {
    const nav = entries[0]?.target;
    if (nav?.isConnected) measureNav(nav);
  });
  function measureNav(nav) {
    document.documentElement.style.setProperty('--nav-height', `${Math.ceil(nav.getBoundingClientRect().height)}px`);
  }
  const paths = {
    gear: '<path d="m9 3-.5 2-2 1-2-.5L2 10l1.5 1.5v2L2 15l2.5 4.5 2-.5 2 1 .5 2h6l.5-2 2-1 2 .5L22 15l-1.5-1.5v-2L22 10l-2.5-4.5-2 .5-2-1L15 3Z"/><circle cx="12" cy="12" r="3"/>',
    book: '<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v14"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    pin: '<path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
    arrow: '<path d="m9 5 7 7-7 7"/>', back: '<path d="m14 5-7 7 7 7"/>',
    check: '<path d="m5 12 5 5L20 7"/>', file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8m-8 4h5"/>'
    , switch: '<path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4"/>',
    expand: '<path d="m6 9 6 6 6-6"/>', today: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>'
  };
  const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const student = () => students.find(s => s.id === state.student);
  const draft = id => state.drafts[id] ||= { reason: '', note: '', attachment: '', error: '', failed: false };
  const record = id => state.records.find(r => r.lesson === id);
  const dateValue = iso => new Date(`${iso}T00:00:00Z`);
  const dateText = (iso, options = { year: 'numeric', month: 'long', day: 'numeric' }) => new Intl.DateTimeFormat('zh-HK', { timeZone: 'Asia/Hong_Kong', ...options }).format(dateValue(iso));
  const lessonDate = l => dateText(l.dateISO);
  const lessonDay = l => dateText(l.dateISO, { weekday: 'long' });
  const shiftDate = (iso, days) => { const d = dateValue(iso); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };
  function shiftMonth(iso, count) {
    const d = dateValue(iso), day = d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + count);
    const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    d.setUTCDate(Math.min(day, last)); return d.toISOString().slice(0, 10);
  }
  const weekStart = iso => shiftDate(iso, -((dateValue(iso).getUTCDay() + 6) % 7));
  const recordTime = r => new Intl.DateTimeFormat('zh-HK', { timeZone: 'Asia/Hong_Kong', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(r.submittedAt));
  const statusNote = r => r?.status === 'approved' ? C.approvedDisclaimer : C.disclaimer;
  function route() {
    const [page = 'lessons', id] = location.hash.slice(1).split('/');
    const lesson = lessons.find(l => l.id === id);
    if (['detail', 'leave', 'success'].includes(page) && lesson) {
      state.student = lesson.student; state.selectedDate = lesson.dateISO;
      if (page === 'success' && !record(id)) return { page: 'lessons' };
      return { page, lesson };
    }
    return { page: ['records', 'settings'].includes(page) ? page : 'lessons' };
  }
  const link = (hash, text, cls = 'primary') => `<a class="${cls}" href="#${hash}">${text}</a>`;
  const statusBadge = r => r ? `<span class="leave-status ${r.status}" data-status="${r.status}">${icon(r.status === 'approved' ? 'check' : 'clock')}<span>${C.statuses[r.status]}${r.status === 'requested' ? '<small>待處理</small>' : ''}</span></span>` : '';
  function summary(l) {
    return `<div class="card class-summary"><div class="eyebrow">本次申請學生：${esc(student().name)} · ${student().level}</div><h2>${esc(l.title)}</h2><p class="class-date">${lessonDate(l)}（${lessonDay(l)}）</p><strong>${l.time}</strong></div>`;
  }
  function lessonCard(l) {
    const [start, end] = l.time.split(' – '), request = record(l.id);
    return `<a href="#detail/${l.id}" class="card lesson ${request ? 'has-leave' : ''}" aria-label="查看詳情：${esc(l.title)}，${lessonDate(l)}，${l.time}${request ? '，' + C.statuses[request.status] : ''}"><div class="lesson-top"><div class="lesson-schedule"><span class="time">${start}–${end}</span></div>${statusBadge(request)}</div><div class="lesson-content"><div class="course-title"><span class="badge">${l.tag}</span><h2>${esc(l.title)}</h2></div><p class="subtitle">${esc(l.subtitle)}</p><div class="lesson-footer"><p>${icon('person')}${esc(l.tutor)}</p><p>${icon('pin')}${esc(l.venue)}</p></div><span class="lesson-cta">查看詳情${icon('arrow')}</span></div></a>`;
  }
  function empty(isRecords) {
    return `<section class="card empty">${icon(isRecords ? 'file' : 'calendar')}<h2>${isRecords ? C.emptyRecords : C.emptyLessons}</h2><p class="muted">${isRecords ? '提交申請後，可在這裡查看。' : '可切換另一位學生，繼續查看課堂。'}</p>${isRecords ? link('lessons', '查看課堂', 'secondary') : ''}</section>`;
  }
  function previewState(isRecords) {
    if (state.mode === 'loading') return `<div class="card" role="status" aria-busy="true"><p>正在載入${isRecords ? '請假紀錄' : '課堂'}…</p><div class="skeleton"></div><div class="skeleton short"></div><div class="skeleton"></div></div>`;
    if (state.mode === 'empty') return empty(isRecords);
    if (state.mode === 'error') return `<section class="card empty" role="alert">${icon('file')}<h2>暫時未能載入</h2><p>請稍後重試。</p><button class="secondary" data-action="retry">重新載入</button></section>`;
    return '';
  }
  function calendar() {
    const selected = state.selectedDate, isMonth = state.calendarMode === 'month';
    const first = selected.slice(0, 7) + '-01', start = weekStart(isMonth ? first : selected);
    const daysInMonth = new Date(Date.UTC(dateValue(selected).getUTCFullYear(), dateValue(selected).getUTCMonth() + 1, 0)).getUTCDate();
    const count = isMonth ? Math.ceil((((dateValue(first).getUTCDay() + 6) % 7) + daysInMonth) / 7) * 7 : 7;
    const cells = Array.from({ length: count }, (_, i) => {
      const iso = shiftDate(start, i), mine = lessons.filter(l => l.student === state.student && l.dateISO === iso);
      const statuses = [...new Set(mine.map(l => record(l.id)?.status).filter(Boolean))];
      const label = `${dateText(iso)}，${dateText(iso, { weekday: 'long' })}，${mine.length}堂課${statuses.length ? '，' + statuses.map(v => C.statuses[v]).join('，') : ''}${iso === today ? '，今日' : ''}`;
      return `<button type="button" class="calendar-day ${iso.slice(0, 7) !== selected.slice(0, 7) ? 'outside-month' : ''}" data-action="calendar-date" data-date="${iso}" tabindex="${iso === selected ? '0' : '-1'}" aria-label="${label}" aria-pressed="${iso === selected}" ${iso === today ? 'aria-current="date"' : ''}><span class="date-number">${dateValue(iso).getUTCDate()}</span><span class="date-markers" aria-hidden="true">${mine.length ? '<span class="class-dot"></span>' : ''}${statuses.map(v => `<span class="date-mark ${v}">${icon(v === 'approved' ? 'check' : 'clock')}</span>`).join('')}</span></button>`;
    }).join('');
    return `<section class="calendar" aria-label="課堂日曆"><div class="calendar-toolbar"><h2>${dateText(selected, { year: 'numeric', month: 'long' })}</h2><div class="row"><button type="button" class="icon-button" data-action="calendar-prev" aria-label="上一${isMonth ? '月' : '週'}">${icon('back')}</button><button type="button" class="icon-button" data-action="calendar-next" aria-label="下一${isMonth ? '月' : '週'}">${icon('arrow')}</button><button type="button" class="icon-button calendar-toggle" data-action="calendar-toggle" aria-label="${isMonth ? '收起月曆' : '展開月曆'}" title="${isMonth ? '收起月曆' : '展開月曆'}" aria-expanded="${isMonth}" aria-controls="calendar-dates">${icon('expand')}</button></div></div><div class="calendar-weekdays" aria-hidden="true">${['一', '二', '三', '四', '五', '六', '日'].map(d => `<span>${d}</span>`).join('')}</div><div class="calendar-dates" id="calendar-dates">${cells}</div><div class="calendar-footer"><div class="calendar-legend"><span><i class="class-dot" aria-hidden="true"></i>有課</span><span class="requested">${icon('clock')}申請</span><span class="approved">${icon('check')}已獲準</span></div><button type="button" class="icon-button calendar-today" data-action="calendar-today" aria-label="返回今日" title="返回今日">${icon('today')}</button></div></section>`;
  }
  function list() {
    const mine = lessons.filter(l => l.student === state.student && l.dateISO === state.selectedDate).sort((a, b) => a.time.localeCompare(b.time));
    return `<section class="intro list-intro"><h1>${C.listTitle}</h1></section>${calendar()}<div class="section-heading day-heading" aria-live="polite"><div><span class="hint">${state.selectedDate === today ? '今日' : '所選日期'}</span><h2>${dateText(state.selectedDate, { month: 'long', day: 'numeric' })}</h2></div><span class="class-date">${dateText(state.selectedDate, { weekday: 'long' })} · ${mine.length}堂</span></div>${previewState(false) || (!mine.length ? `<section class="card empty"><h2>這天沒有課堂</h2><p class="muted">可選擇有標記的日期，或切換另一位學生。</p></section>` : mine.map(lessonCard).join(''))}`;
  }
  function detail(l) {
    const line = (symbol, label, value) => `<div class="detail-line">${icon(symbol)}<div><span class="hint">${label}</span><strong>${esc(value)}</strong></div></div>`;
    return `<div class="intro"><h1>課堂詳情</h1></div><section class="card details-card"><div class="details-title"><span class="badge">${l.tag}</span><h2>${esc(l.title)}</h2><p class="muted">${esc(l.subtitle)}</p>${statusBadge(record(l.id))}</div><div class="detail-info">${line('calendar', `上課日期 · ${lessonDay(l)}`, lessonDate(l))}${line('clock', '課堂時間 · 香港時間', l.time)}${line('person', '導師', l.tutor)}${line('pin', '地點', l.venue)}</div></section><div class="actions">${record(l.id) ? `<div class="note">${statusNote(record(l.id))}</div>${link('records', '查看請假紀錄')}` : link(`leave/${l.id}`, '申請請假 ' + icon('arrow'))}</div>`;
  }
  function leave(l) {
    if (record(l.id)) return `<h1>${C.statuses[record(l.id).status]}</h1>${summary(l)}${statusBadge(record(l.id))}<div class="note">${statusNote(record(l.id))}</div>${link('records', '查看請假紀錄')}`;
    const d = draft(l.id), busy = state.pending.has(l.id);
    return `<div class="intro"><h1>為這堂課請假</h1><p class="muted">請核對學生及課堂，再填寫資料。</p></div>${summary(l)}<form id="leave-form" novalidate autocomplete="off"><fieldset ${busy ? 'disabled' : ''}><div class="field"><label class="form-label" for="reason">請假原因 <span class="optional">必填</span></label><select id="reason" name="reason" aria-required="true" aria-invalid="${!!d.error}" aria-describedby="reason-error"><option value="">請選擇原因</option>${C.reasons.map(r => `<option ${d.reason === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select><p class="error" id="reason-error" role="alert">${d.error}</p></div><div class="field"><label class="form-label" for="note">備註 <span class="optional">選填</span></label><textarea id="note" name="note" placeholder="如有其他補充，可在這裡填寫。">${esc(d.note)}</textarea></div><div class="field"><label class="form-label" for="attachment">附件 <span class="optional">選填</span></label><select id="attachment" name="attachment"><option value="">不加入附件</option>${C.attachments.map(a => `<option ${d.attachment === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select>${d.attachment ? `<div class="attachment row between"><span>${icon('file')} ${esc(d.attachment)}</span><button type="button" class="text-button" data-action="remove">移除</button></div>` : ''}</div></fieldset><div class="note">${C.disclaimer}</div>${d.failed ? `<div role="alert" class="error-panel error">${C.failed}</div>` : ''}<button class="primary" type="submit" ${busy ? 'disabled' : ''}>${busy ? '<span class="spinner" aria-hidden="true"></span>' + C.submitting : '提交申請 ' + icon('arrow')}</button><p class="hint" role="status">${busy ? '提交中，請勿重複操作。' : ''}</p></form>`;
  }
  function success(l) {
    const r = record(l.id);
    return `<section class="success-heading"><div class="success-icon">${icon('file')}</div><h1 tabindex="-1">${C.received}</h1><p class="muted">可在請假紀錄查看這次申請。</p></section>${summary(l)}${statusBadge(r)}<p class="hint">申請編號 · ${r.id}</p><div class="note">${statusNote(r)}</div>${link('records', '查看請假紀錄')}${link('lessons', '返回課堂', 'secondary')}`;
  }
  function records() {
    const mine = state.records.filter(r => r.student === state.student);
    return `<div class="intro"><h1>請假紀錄</h1></div>${previewState(true) || (!mine.length ? empty(true) : mine.map(r => {
      const l = lessons.find(l => l.id === r.lesson);
      return `<article class="card record"><div class="row between"><span class="hint">${r.id}</span></div><h2>${esc(l.title)}</h2>${statusBadge(r)}<div class="record-class"><p class="class-date">${lessonDate(l)}（${lessonDay(l)}）</p><strong class="record-time">${l.time}</strong></div><dl><dt>請假原因</dt><dd>${esc(r.reason)}</dd><dt>備註</dt><dd>${esc(r.note || '未填寫')}</dd><dt>附件</dt><dd>${esc(r.attachment || '沒有附件')}</dd><dt>申請時間 · 香港時間</dt><dd>${esc(recordTime(r))}</dd></dl><div class="note">${statusNote(r)}</div>${link(`detail/${l.id}`, '查看課堂詳情', 'secondary')}</article>`;
    }).join(''))}`;
  }
  function settings() {
    return `<div class="intro"><h1>設定</h1></div><section class="settings-group" aria-labelledby="display-title"><h2 id="display-title">顯示</h2><div class="settings-row"><label for="settings-text-scale">文字大小</label><select id="settings-text-scale" name="settings-text-scale">${[['100', '100%'], ['150', '150%'], ['200', '200%']].map(([value, label]) => `<option value="${value}" ${state.textScale === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div></section><section class="settings-group" aria-labelledby="students-title"><h2 id="students-title">學生資料</h2><details class="settings-students"><summary><span class="settings-label">${icon('person')}查看學生資料</span>${icon('expand')}</summary><ul class="settings-student-list">${students.map(s => `<li><strong>${esc(s.name)}</strong><span class="hint">${esc(s.english)} · ${esc(s.level)}</span></li>`).join('')}</ul></details></section><section class="settings-group" aria-labelledby="about-title"><h2 id="about-title">關於與支援</h2><div class="settings-row"><span>App版本</span><span class="hint">${esc(version)}</span></div><a class="settings-row settings-link" href="https://www.i-learner.edu.hk/zh/" target="_blank" rel="noopener noreferrer" aria-label="公司網站（另開分頁）"><span>公司網站</span>${icon('arrow')}</a></section>`;
  }
  function studentCard(s, page, locked) {
    const identity = `<span class="avatar" aria-hidden="true">${s.initial}</span><span class="student-fields"><span class="student-name"><strong>${esc(s.name)}</strong></span></span>`;
    return locked ? `<section class="student row" aria-label="學生資料">${identity}</section>` : `<button type="button" id="student" class="student row student-trigger" data-action="students" aria-haspopup="dialog" aria-expanded="false" aria-controls="student-dialog" aria-label="切換學生，目前${esc(s.name)}">${identity}<span class="student-switch" aria-hidden="true">${icon('switch')}</span></button><dialog id="student-dialog" aria-labelledby="student-dialog-title"><div class="row between"><h2 id="student-dialog-title">選擇學生</h2><button type="button" class="icon-button" data-action="close-students" aria-label="關閉學生選擇">✕</button></div><div class="student-options">${students.map(v => `<button type="button" class="student-option row" data-action="choose-student" data-student="${v.id}" aria-pressed="${v.id === s.id}"><span class="avatar" aria-hidden="true">${v.initial}</span><span class="student-fields"><span class="student-name"><strong>${esc(v.name)}</strong><span class="hint">${v.level}</span></span><span class="hint student-english">${esc(v.english)}</span></span>${v.id === s.id ? `<span class="selected-label">目前${icon('check')}</span>` : ''}</button>`).join('')}</div></dialog>`;
  }
  // Review controls are opt-in; explanatory notes live in the handoff documents.
  function reviewControls(page) {
    if (page === 'settings') return '';
    return `<details class="review"><summary>畫面設定</summary><label>文字大小<select id="text-scale">${[['100', '100%（預設）'], ['150', '150%'], ['200', '200%']].map(([value, label]) => `<option value="${value}" ${state.textScale === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>${['lessons', 'records'].includes(page) ? `<label>畫面狀態<select id="preview-mode">${[['normal', '正常資料'], ['loading', '載入中'], ['empty', '空資料'], ['error', '載入失敗']].map(([v, n]) => `<option value="${v}" ${state.mode === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>` : ''}${page === 'leave' ? `<label><input id="fail-next" type="checkbox" ${state.failNext ? 'checked' : ''}> 下一次提交：失敗</label>` : ''}</details>`;
  }
  function render(focus = false) {
    const { page, lesson } = route(), s = student();
    const subpage = !!lesson, back = page === 'leave' ? `detail/${lesson.id}` : 'lessons';
    const pageBody = page === 'lessons' ? list() : page === 'detail' ? detail(lesson) : page === 'leave' ? leave(lesson) : page === 'success' ? success(lesson) : page === 'settings' ? settings() : records();
    navObserver.disconnect();
    root.dataset.page = page;
    root.innerHTML = `<a class="skip-link" href="#main-content">跳至主要內容</a><div class="app-top"><header class="header">${subpage ? `<a href="#${back}" class="icon-button" aria-label="${page === 'leave' ? '返回課堂詳情' : '返回課堂列表'}">${icon('back')}</a>` : ''}<a class="brand-logo" href="#lessons" aria-label="i-Learner 智愛學，返回我的課堂" translate="no"><img src="assets/i-learner-logo.png" alt="i-Learner 智愛學" width="161" height="65" fetchpriority="high"></a></header><div class="student-strip">${studentCard(s, page, subpage)}</div></div><main id="main-content" tabindex="-1">${pageBody}${reviewEnabled ? reviewControls(page) : ''}</main><nav class="bottom-nav" aria-label="主要導覽"><a href="#lessons" ${!['records', 'settings'].includes(page) ? 'aria-current="page"' : ''}><span class="nav-icon">${icon('calendar')}</span>課堂</a><a href="#records" ${page === 'records' ? 'aria-current="page"' : ''}><span class="nav-icon">${icon('file')}</span><span class="nav-label">請假<wbr>紀錄</span></a><a href="#settings" ${page === 'settings' ? 'aria-current="page"' : ''}><span class="nav-icon">${icon('gear')}</span>設定</a></nav>`;
    root.querySelector('#student-dialog')?.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...event.currentTarget.querySelectorAll('button')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    root.querySelector('#student-dialog')?.addEventListener('close', () => {
      root.querySelector('#student')?.setAttribute('aria-expanded', 'false');
    });
    const nav = root.querySelector('.bottom-nav');
    measureNav(nav);
    navObserver.observe(nav);
    document.title = `${({ lessons: '我的課堂', detail: '課堂詳情', leave: '請假表單', success: C.received, records: '請假紀錄', settings: '設定' })[page]} · 家長課堂`;
    if (focus) { const h = root.querySelector('h1'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); window.scrollTo(0, 0); }
  }
  root.addEventListener('change', event => {
    const e = event.target, { lesson } = route();
    if (['text-scale', 'settings-text-scale'].includes(e.id)) { state.textScale = e.value; document.documentElement.dataset.textScale = e.value; root.querySelectorAll('#text-scale, #settings-text-scale').forEach(control => { control.value = e.value; }); }
    if (e.id === 'preview-mode') { state.mode = e.value; render(); root.querySelector('.review').open = true; }
    if (e.id === 'fail-next') state.failNext = e.checked;
    if (lesson && e.id === 'reason') {
      draft(lesson.id).reason = e.value; draft(lesson.id).error = '';
      e.setAttribute('aria-invalid', 'false'); root.querySelector('#reason-error').textContent = '';
    }
    if (lesson && e.id === 'attachment') { draft(lesson.id).attachment = e.value; render(); root.querySelector('#attachment').focus(); }
  });
  root.addEventListener('input', e => { const { lesson } = route(); if (lesson && e.target.id === 'note') draft(lesson.id).note = e.target.value; });
  // Keep keyboard-focused controls above the fixed navigation after native focus scrolling.
  root.addEventListener('focusin', event => {
    const focused = event.target;
    if (focused.closest('.bottom-nav, dialog') || ['H1', 'MAIN'].includes(focused.tagName)) return;
    requestAnimationFrame(() => {
      if (!focused.isConnected) return;
      const bounds = focused.getBoundingClientRect();
      const navTop = root.querySelector('.bottom-nav').getBoundingClientRect().top;
      if (bounds.bottom > navTop - 16) window.scrollBy(0, bounds.bottom - navTop + 16);
    });
  });
  root.addEventListener('keydown', event => {
    const day = event.target.closest('[data-date]');
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (!day || !step) return;
    event.preventDefault(); state.selectedDate = shiftDate(day.dataset.date, step); render();
    root.querySelector(`[data-date="${state.selectedDate}"]`).focus();
  });
  root.addEventListener('click', event => {
    const skip = event.target.closest('.skip-link');
    if (skip) { event.preventDefault(); root.querySelector('main').focus(); return; }
    const button = event.target.closest('[data-action]');
    if (!button) return;
    if (button.dataset.action.startsWith('calendar-')) {
      const action = button.dataset.action;
      if (action === 'calendar-date') state.selectedDate = button.dataset.date;
      if (action === 'calendar-today') state.selectedDate = today;
      if (action === 'calendar-toggle') state.calendarMode = state.calendarMode === 'week' ? 'month' : 'week';
      if (['calendar-prev', 'calendar-next'].includes(action)) {
        const direction = action === 'calendar-prev' ? -1 : 1;
        state.selectedDate = state.calendarMode === 'week' ? shiftDate(state.selectedDate, direction * 7) : shiftMonth(state.selectedDate, direction);
      }
      render();
      const target = action === 'calendar-date' ? `[data-date="${state.selectedDate}"]` : `[data-action="${action}"]`;
      root.querySelector(target).focus({ preventScroll: true });
      return;
    }
    if (button.dataset.action === 'students') {
      root.querySelector('#student-dialog').showModal();
      button.setAttribute('aria-expanded', 'true');
      root.querySelector('.student-option[aria-pressed="true"]').focus();
    }
    if (button.dataset.action === 'close-students') root.querySelector('#student-dialog').close();
    if (button.dataset.action === 'choose-student') {
      root.querySelector('#student-dialog').close();
      state.student = button.dataset.student; state.mode = 'normal'; render();
      root.querySelector('#student').focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
    if (button.dataset.action === 'retry') { state.mode = 'normal'; render(); }
    if (button.dataset.action === 'remove') { draft(route().lesson.id).attachment = ''; render(); root.querySelector('#attachment').focus(); }
  });
  root.addEventListener('submit', event => {
    event.preventDefault();
    const { lesson: l } = route();
    if (!l || state.pending.has(l.id) || record(l.id)) return;
    const d = draft(l.id);
    if (!d.reason) { d.error = C.required; render(); root.querySelector('#reason').focus(); return; }
    const payload = { ...d }, fail = state.failNext;
    state.failNext = false; d.failed = false; state.pending.add(l.id); render();
    // 1.2 秒僅為可見的模擬延遲，非業務處理時限。
    setTimeout(() => {
      state.pending.delete(l.id);
      if (fail) d.failed = true;
      else if (!record(l.id)) state.records.unshift({ id: `REQ-${String(state.records.length + 1).padStart(3, '0')}`, lesson: l.id, student: l.student, status: 'requested', reason: payload.reason, note: payload.note, attachment: payload.attachment, submittedAt: new Date().toISOString() });
      const current = route();
      if (!fail && current.page === 'leave' && current.lesson?.id === l.id) location.hash = `success/${l.id}`;
      else render();
    }, 1200);
  });
  window.addEventListener('hashchange', () => { state.mode = 'normal'; render(true); });
  // Only warn on leaving/reloading the document; in-app navigation retains drafts.
  window.addEventListener('beforeunload', event => {
    if (Object.entries(state.drafts).some(([id, d]) => !record(id) && (d.reason || d.note || d.attachment))) {
      event.preventDefault(); event.returnValue = '';
    }
  });
  render();
})();
