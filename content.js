// 所有資料均為虛構。集中維護文案、示例資料與候選表單選項。
window.DEMO_CONTENT = {
  version: '0.11',
  copy: {
    brand: 'i-Learner', subbrand: '家長課堂',
    listTitle: '我的課堂',
    received: '申請已收到',
    statuses: { requested: '請假申請', approved: '請假已獲準' },
    approvedDisclaimer: '此課堂請假已獲準。補堂資格尚未確認。',
    disclaimer: '收到申請不等於批准請假，亦不代表獲得補堂資格。',
    required: '請選擇一個請假原因。', submitting: '正在提交申請…',
    failed: '提交失敗，資料已保留。請再試一次。',
    emptyLessons: '暫時沒有課堂', emptyRecords: '還沒有請假紀錄',
    reasons: ['身體不適', '家庭安排', '其他原因'],
    attachments: ['證明.pdf', '附件.jpg']
  },
  today: '2026-09-24',
  initialRecords: [
    { id: 'REQ-001', lesson: 'l1', student: 's1', status: 'requested', reason: '家庭安排', note: '申請當日請假。', attachment: '', submittedAt: '2026-09-22T08:30:00Z' },
    { id: 'REQ-002', lesson: 'l4', student: 's1', status: 'approved', reason: '家庭安排', note: '此課堂請假已獲準。', attachment: '', submittedAt: '2026-09-21T02:00:00Z' }
  ],
  students: [
    { id: 's1', name: '陳樂晴', english: 'Chloe', initial: '晴', level: '小三' },
    { id: 's2', name: '陳樂言', english: 'Ethan', initial: '言', level: '小一' },
    { id: 's3', name: '林芷澄', english: 'Alexandra Lam', initial: '澄', level: '小四' }
  ],
  lessons: [
    { id: 'l1', student: 's1', title: '英語閱讀與寫作', subtitle: 'English Reading & Writing', dateISO: '2026-09-24', time: '16:30 – 17:40', tutor: 'Miss Sophie', venue: '星光學習中心 · 203 室', tag: '英語' },
    { id: 'l2', student: 's1', title: '中文思維與創意寫作', subtitle: 'Chinese Creative Writing', dateISO: '2026-09-26', time: '10:00 – 11:10', tutor: '陳老師', venue: '星光學習中心 · 201 室', tag: '中文' },
    { id: 'l4', student: 's1', title: '中文閱讀與表達', subtitle: 'Chinese Reading & Expression', dateISO: '2026-09-24', time: '10:00 – 11:10', tutor: '陳老師', venue: '星光學習中心 · 201 室', tag: '中文' },
    { id: 'l3', student: 's2', title: '探索英語：閱讀理解與創意表達工作坊', subtitle: 'Discover English: Reading, Thinking & Creative Expression', dateISO: '2026-09-24', time: '15:00 – 16:10', tutor: 'Miss Alexandra Wong-Lam', venue: '晴空學習中心 · 創意閱讀及小組討論課室 305', tag: '英語' }
  ]
};
