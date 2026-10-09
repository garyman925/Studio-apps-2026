// 所有資料均為虛構。集中維護文案、示例資料與候選表單選項。
window.DEMO_CONTENT = {
  copy: {
    brand: 'i-Learner', subbrand: '家長課堂',
    listTitle: '我的課堂',
    received: '申請已收到', status: '申請已收到',
    disclaimer: '收到申請不等於批准請假，亦不代表獲得補堂資格。',
    required: '請選擇一個請假原因。', submitting: '正在提交申請…',
    failed: '提交失敗，資料已保留。請再試一次。',
    emptyLessons: '暫時沒有課堂', emptyRecords: '還沒有請假紀錄',
    reasons: ['身體不適', '家庭安排', '其他原因'],
    attachments: ['證明.pdf', '附件.jpg']
  },
  students: [
    { id: 's1', name: '陳樂晴', english: 'Chloe', initial: '晴', level: '小三' },
    { id: 's2', name: '陳樂言', english: 'Ethan', initial: '言', level: '小一' },
    { id: 's3', name: '林芷澄 Alexandra Lam', english: 'Alexandra', initial: '澄', level: '小四' }
  ],
  lessons: [
    { id: 'l1', student: 's1', title: '英語閱讀與寫作', subtitle: 'English Reading & Writing', date: '2026年9月24日', day: '星期四', time: '16:30 – 17:40', tutor: 'Miss Sophie', venue: '星光學習中心 · 203 室', tag: '英語', today: true },
    { id: 'l2', student: 's1', title: '中文思維與創意寫作', subtitle: 'Chinese Creative Writing', date: '2026年9月26日', day: '星期六', time: '10:00 – 11:10', tutor: '陳老師', venue: '星光學習中心 · 201 室', tag: '中文', today: false },
    { id: 'l3', student: 's2', title: '探索英語：閱讀理解與創意表達工作坊', subtitle: 'Discover English: Reading, Thinking & Creative Expression', date: '2026年9月24日', day: '星期四', time: '15:00 – 16:10', tutor: 'Miss Alexandra Wong-Lam', venue: '晴空學習中心 · 創意閱讀及小組討論課室 305', tag: '英語', today: true }
  ]
};
