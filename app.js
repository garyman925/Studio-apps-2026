(() => {
  'use strict';
  const { copy: C, students, lessons } = window.DEMO_CONTENT;
  const root = document.getElementById('app');
  const reviewEnabled = new URLSearchParams(location.search).get('review') === '1';
  const state = { student: 's1', records: [], drafts: {}, pending: new Set(), mode: 'normal', failNext: false, textScale: '100' };
  // Includes safe-area padding and recalculates when text size or viewport changes.
  const navObserver = new ResizeObserver(entries => {
    const nav = entries[0]?.target;
    if (nav?.isConnected) measureNav(nav);
  });
  function measureNav(nav) {
    document.documentElement.style.setProperty('--nav-height', `${Math.ceil(nav.getBoundingClientRect().height)}px`);
  }
  const paths = {
    book: '<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v14"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    pin: '<path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
    arrow: '<path d="m9 5 7 7-7 7"/>', back: '<path d="m14 5-7 7 7 7"/>',
    check: '<path d="m5 12 5 5L20 7"/>', file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8m-8 4h5"/>'
  };
  const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const student = () => students.find(s => s.id === state.student);
  const draft = id => state.drafts[id] ||= { reason: '', note: '', attachment: '', error: '', failed: false };
  const record = id => state.records.find(r => r.lesson === id);
  function route() {
    const [page = 'lessons', id] = location.hash.slice(1).split('/');
    const lesson = lessons.find(l => l.id === id);
    if (['detail', 'leave', 'success'].includes(page) && lesson) {
      state.student = lesson.student;
      if (page === 'success' && !record(id)) return { page: 'lessons' };
      return { page, lesson };
    }
    return { page: page === 'records' ? 'records' : 'lessons' };
  }
  const link = (hash, text, cls = 'primary') => `<a class="${cls}" href="#${hash}">${text}</a>`;
  const receivedBadge = () => `<span class="badge received">${icon('file')}${C.status}</span>`;
  function summary(l) {
    return `<div class="card"><div class="eyebrow">${esc(student().name)} · ${student().level}</div><h2>${esc(l.title)}</h2><p class="class-date">${l.date}（${l.day}）</p><strong>${l.time}</strong></div>`;
  }
  function lessonCard(l) {
    return `<a href="#detail/${l.id}" class="card lesson ${l.today ? 'featured' : ''}" aria-label="查看詳情：${esc(l.title)}，${l.date}，${l.time}"><div class="row between"><span class="badge">${l.tag}</span>${record(l.id) ? receivedBadge() : `<span class="lesson-date">${l.today ? '今日課堂' : l.date}</span>`}</div><div class="time">${l.time}</div><h2>${esc(l.title)}</h2><p class="subtitle">${esc(l.subtitle)}</p><div class="lesson-footer"><p>${esc(l.tutor)}</p><p>${esc(l.venue)}</p></div><span class="lesson-cta">查看詳情<span class="round-arrow">${icon('arrow')}</span></span></a>`;
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
  function list() {
    const mine = lessons.filter(l => l.student === state.student);
    return `<section class="intro list-intro"><h1>${C.listTitle}</h1></section>${previewState(false) || (!mine.length ? empty(false) : `<div class="section-heading"><h2>今日 · 9月24日</h2><span class="class-date">星期四</span></div>${mine.filter(l => l.today).map(lessonCard).join('')}${mine.some(l => !l.today) ? `<div class="section-heading"><h2>接下來的課堂</h2><span class="hint">${mine.filter(l => !l.today).length} 堂</span></div>${mine.filter(l => !l.today).map(lessonCard).join('')}` : ''}`)}`;
  }
  function detail(l) {
    const line = (symbol, label, value) => `<div class="detail-line">${icon(symbol)}<div><span class="hint">${label}</span><strong>${esc(value)}</strong></div></div>`;
    return `<div class="intro"><h1>課堂詳情</h1></div><section class="card details-title"><span class="badge">${l.tag}</span><h2>${esc(l.title)}</h2><p class="muted">${esc(l.subtitle)}</p></section><section class="card">${line('calendar', '上課日期', `${l.date}（${l.day}）`)}${line('clock', '課堂時間 · 香港時間', l.time)}${line('person', '導師', l.tutor)}${line('pin', '地點', l.venue)}</section><div class="actions">${record(l.id) ? `${receivedBadge()}<div class="note">${C.disclaimer}</div>${link('records', '查看請假紀錄')}` : link(`leave/${l.id}`, '申請請假 ' + icon('arrow'))}</div>`;
  }
  function leave(l) {
    if (record(l.id)) return `<h1>${C.received}</h1>${summary(l)}<div class="note">${C.disclaimer}</div>${link('records', '查看請假紀錄')}`;
    const d = draft(l.id), busy = state.pending.has(l.id);
    return `<div class="intro"><h1>為這堂課請假</h1><p class="muted">請核對學生及課堂，再填寫資料。</p></div>${summary(l)}<form id="leave-form" novalidate><fieldset ${busy ? 'disabled' : ''}><div class="field"><label class="form-label" for="reason">請假原因 <span class="optional">必填</span></label><select id="reason" name="reason" aria-required="true" aria-invalid="${!!d.error}" aria-describedby="reason-error"><option value="">請選擇原因</option>${C.reasons.map(r => `<option ${d.reason === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select><p class="error" id="reason-error" role="alert">${d.error}</p></div><div class="field"><label class="form-label" for="note">備註 <span class="optional">選填</span></label><textarea id="note" name="note" placeholder="如有其他補充，可在這裡填寫。">${esc(d.note)}</textarea></div><div class="field"><label class="form-label" for="attachment">附件 <span class="optional">選填</span></label><select id="attachment" name="attachment"><option value="">不加入附件</option>${C.attachments.map(a => `<option ${d.attachment === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select>${d.attachment ? `<div class="attachment row between"><span>${icon('file')} ${esc(d.attachment)}</span><button type="button" class="text-button" data-action="remove">移除</button></div>` : ''}</div></fieldset><div class="note">${C.disclaimer}</div>${d.failed ? `<div role="alert" class="error-panel error">${C.failed}</div>` : ''}<button class="primary" type="submit" ${busy ? 'disabled' : ''}>${busy ? '<span class="spinner" aria-hidden="true"></span>' + C.submitting : '提交申請 ' + icon('arrow')}</button><p class="hint" role="status">${busy ? '提交中，請勿重複操作。' : ''}</p></form>`;
  }
  function success(l) {
    const r = record(l.id);
    return `<section class="success-heading"><div class="success-icon">${icon('file')}</div><h1 tabindex="-1">${C.received}</h1><p class="muted">可在請假紀錄查看這次申請。</p></section>${summary(l)}<p class="hint">申請編號 · ${r.id}</p><div class="note">${C.disclaimer}</div>${link('records', '查看請假紀錄')}${link('lessons', '返回課堂', 'secondary')}`;
  }
  function records() {
    const mine = state.records.filter(r => r.student === state.student);
    return `<div class="intro"><h1>請假紀錄</h1></div>${previewState(true) || (!mine.length ? empty(true) : mine.map(r => {
      const l = lessons.find(l => l.id === r.lesson);
      return `<article class="card record"><div class="row between">${receivedBadge()}<span class="hint">${r.id}</span></div><h2>${esc(l.title)}</h2><p class="class-date">${l.date}（${l.day}）</p><strong>${l.time}</strong><dl><dt>請假原因</dt><dd>${esc(r.reason)}</dd><dt>備註</dt><dd>${esc(r.note || '未填寫')}</dd><dt>附件</dt><dd>${esc(r.attachment || '沒有附件')}</dd><dt>申請時間 · 香港時間</dt><dd>${esc(r.time)}</dd></dl><div class="note">${C.disclaimer}</div>${link(`detail/${l.id}`, '查看課堂詳情', 'secondary')}</article>`;
    }).join(''))}`;
  }
  function studentCard(s, page, locked) {
    return `<section class="student row ${locked ? '' : 'selectable'}" aria-label="學生資料"><span class="avatar" aria-hidden="true">${s.initial}</span><div class="student-fields"><p class="hint">${['leave', 'success'].includes(page) ? '本次申請學生' : '目前學生'}</p><p class="student-name"><strong>${esc(s.name)}</strong><span class="hint">${s.level}</span></p><p class="hint">${esc(s.english)}</p></div>${locked ? '' : `<span class="student-switch" aria-hidden="true">切換⌄</span><select id="student" aria-label="切換學生">${students.map(v => `<option value="${v.id}" ${v.id === s.id ? 'selected' : ''}>${esc(v.name)} · ${v.level}</option>`).join('')}</select>`}</section>`;
  }
  // Review controls are opt-in; explanatory notes live in the handoff documents.
  function reviewControls(page) {
    return `<details class="review"><summary>畫面設定</summary><label>文字大小<select id="text-scale">${[['100', '100%（預設）'], ['150', '150%'], ['200', '200%']].map(([value, label]) => `<option value="${value}" ${state.textScale === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>${['lessons', 'records'].includes(page) ? `<label>畫面狀態<select id="preview-mode">${[['normal', '正常資料'], ['loading', '載入中'], ['empty', '空資料'], ['error', '載入失敗']].map(([v, n]) => `<option value="${v}" ${state.mode === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>` : ''}${page === 'leave' ? `<label><input id="fail-next" type="checkbox" ${state.failNext ? 'checked' : ''}> 下一次提交：失敗</label>` : ''}</details>`;
  }
  function render(focus = false) {
    const { page, lesson } = route(), s = student();
    const subpage = !!lesson, back = page === 'leave' ? `detail/${lesson.id}` : 'lessons';
    const pageBody = page === 'lessons' ? list() : page === 'detail' ? detail(lesson) : page === 'leave' ? leave(lesson) : page === 'success' ? success(lesson) : records();
    navObserver.disconnect();
    root.innerHTML = `<header class="header">${subpage ? `<a href="#${back}" class="icon-button" aria-label="${page === 'leave' ? '返回課堂詳情' : '返回課堂列表'}">${icon('back')}</a><span class="hint">${C.subbrand}</span>` : `<div class="row"><span class="brand-mark">${icon('book')}</span><span class="brand">${C.brand}<small>${C.subbrand}</small></span></div>`}</header>${studentCard(s, page, subpage)}<main>${pageBody}${reviewEnabled ? reviewControls(page) : ''}</main><nav class="bottom-nav" aria-label="主要導覽"><a href="#lessons" ${page !== 'records' ? 'aria-current="page"' : ''}><span class="nav-icon">${icon('calendar')}</span>課堂</a><a href="#records" ${page === 'records' ? 'aria-current="page"' : ''}><span class="nav-icon">${icon('file')}</span>請假紀錄</a></nav>`;
    const nav = root.querySelector('.bottom-nav');
    measureNav(nav);
    navObserver.observe(nav);
    document.title = `${({ lessons: '我的課堂', detail: '課堂詳情', leave: '請假表單', success: C.received, records: '請假紀錄' })[page]} · 家長課堂`;
    if (focus) { const h = root.querySelector('h1'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); window.scrollTo(0, 0); }
  }
  root.addEventListener('change', event => {
    const e = event.target, { lesson } = route();
    if (e.id === 'student') { state.student = e.value; state.mode = 'normal'; render(); root.querySelector('#student').focus({ preventScroll: true }); }
    if (e.id === 'text-scale') { state.textScale = e.value; document.documentElement.dataset.textScale = e.value; }
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
    if (focused.closest('.bottom-nav') || focused.tagName === 'H1') return;
    requestAnimationFrame(() => {
      if (!focused.isConnected) return;
      const bounds = focused.getBoundingClientRect();
      const navTop = root.querySelector('.bottom-nav').getBoundingClientRect().top;
      if (bounds.bottom > navTop - 16) window.scrollBy(0, bounds.bottom - navTop + 16);
    });
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
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
      else if (!record(l.id)) state.records.unshift({ id: `REQ-${String(state.records.length + 1).padStart(3, '0')}`, lesson: l.id, student: l.student, reason: payload.reason, note: payload.note, attachment: payload.attachment, time: new Intl.DateTimeFormat('zh-HK', { timeZone: 'Asia/Hong_Kong', dateStyle: 'medium', timeStyle: 'short' }).format(new Date()) });
      const current = route();
      if (!fail && current.page === 'leave' && current.lesson?.id === l.id) location.hash = `success/${l.id}`;
      else render();
    }, 1200);
  });
  window.addEventListener('hashchange', () => { state.mode = 'normal'; render(true); });
  render();
})();
