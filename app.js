const app = document.querySelector('#app');
const root = document.documentElement;

function setPresentationTheme(theme) {
  root.dataset.theme = theme;
  document.querySelectorAll('[data-theme-choice]').forEach(button => button.classList.toggle('active', button.dataset.themeChoice === theme));
}

function setCareMode(enabled) {
  document.body.classList.toggle('care-mode', enabled);
  const button = document.querySelector('[data-action="toggle-care"]');
  if (button) { button.classList.toggle('active', enabled); button.setAttribute('aria-pressed', String(enabled)); }
}

const state = { tab: 'home', circle: null, circleView: 'feed', circleCategory: '全部', moreOpen: false, security: false, ai: false, aiMessages: [], liveSection: '互动', toast: null, joined: new Set(), reminders: new Set(), booked: false, notifications: new Set(['圈主更新', '评论互动', '任务提醒']), liveCart: new Set(), couponClaimed: false };

const circles = [
  { id: 'research', icon: '研', tone: '', image: 'assets/circle-research.jpg', title: '每日投研 · 盘面拆解', desc: '盘前策略 / 盘中观点 / 收盘复盘', members: '12,860', active: '今日 38 条动态', post: '王老师：午后关注新能源与券商板块的量能变化。' },
  { id: 'class', icon: '学', tone: 'gold', image: 'assets/circle-learning.jpg', title: '趋势技能提升营', desc: '课程学员专属陪跑圈', members: '3,428', active: '今日 126 人学习', post: '第 6 讲回放已更新，完成课后练习可解锁案例。' },
  { id: 'vip', icon: 'VIP', tone: 'red', image: 'assets/course-trend.jpg', title: '高阶会员服务圈', desc: '策略 / 工具 / 专属答疑', members: '860', active: '仅会员可见', post: '本周策略会议将于周五 20:00 开始，点击预约。' },
];

const circleCategories = ['全部', '每周答疑整理', '课程学习资料'];
const circleTasks = [
  ['第 6 讲课后打卡', '完成课程后，分享你的资产配置思路', '进行中', '趋势技能提升营'],
  ['本周答疑提问', '提交一个关于仓位管理的问题', '待开始', '每日投研 · 盘面拆解'],
  ['回放学习任务', '观看直播回放并完成 3 个关键笔记', '已完成', '高阶会员服务圈'],
];
const circleCourses = [
  ['趋势技能提升营', '6 个任务', '已学习 72%', '课程、打卡与配套学习圈'],
  ['投资者基础训练', '12 个任务', '未学习', '建立自己的风险管理框架'],
  ['盘面拆解实战课', '8 个任务', '进行中', '直播回放与每日投研同步'],
];
const circleMembers = [
  ['林老师', '圈主', '刚刚更新了第 6 讲回放'],
  ['白金用户', '连续学习 18 天', '今日完成 2 个任务'],
  ['研究小组', '会员成员', '最近活跃于每日投研圈'],
  ['新加入用户', '今日加入', '等待完成首个学习任务'],
];
const notificationItems = ['圈主更新', '评论互动', '提问回答', '被回答', '被评论', '被私信', '任务提醒'];

function icon(name) { return `<span aria-hidden="true">${name}</span>`; }
function shell(title, subtitle = '', options = {}) {
  return `<div class="hero-bar ${options.light ? 'hero-bar--light' : ''}"><div class="hero-row">${options.back || ''}<div class="hero-title"><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div><div class="hero-actions">${options.action || ''}</div></div></div>`;
}
function bottomNav() {
  const items = [['home', '⌂', '首页'], ['learning', '▣', '学习'], ['circles', '◉', '圈子'], ['market', '⌁', '投研'], ['messages', '♢', '消息'], ['profile', '○', '我的']];
  return `<nav class="bottom-nav">${items.map(([id, glyph, label]) => `<button class="${state.tab === id ? 'active' : ''}" data-tab="${id}">${icon(glyph)}${label}${id === 'messages' ? '<b class="badge">3</b>' : ''}</button>`).join('')}</nav>`;
}

function course() {
  const courses = [['trend', '趋势技能提升营', '6 讲 · 已学习 72%', '从市场结构到仓位管理，建立自己的交易节奏', 'assets/course-trend.jpg'], ['basic', '投资者基础训练', '12 讲 · 待开始', '宏观、行业、公司与风险管理基础', 'assets/course-basic.jpg'], ['market', '盘面拆解实战课', '回放 · 42:18', '配套每日投研圈，边看边讨论', 'assets/course-market.jpg']];
  return `<div class="screen">${shell('学习中心', '课程、直播与学习进度', { light: true, action: '<button class="icon-btn" aria-label="学习搜索" data-action="toast" data-message="搜索课程、讲师或专题">⌕</button>' })}<div class="learning-tabs"><button class="active" data-action="toast" data-message="正在展示推荐课程">推荐课程</button><button data-action="toast" data-message="正在展示我的课程">我的课程</button><button data-action="toast" data-message="正在展示已购内容">已购内容</button></div><section class="learning-progress"><div><small>继续学习</small><h3>趋势技能提升营</h3><p>已完成 4 / 6 讲 · 还差 28% 完成课程</p></div><button data-course="trend" data-action="course">继续学习　›</button><div class="progress-track"><i style="width:72%"></i></div></section><section class="section"><div class="section-head"><h3>课程内容</h3><button class="more" data-action="toast" data-message="课程分类已打开">分类 ›</button></div><div class="course-list">${courses.map((c, i) => `<button class="course-card" data-action="course" data-course="${c[0]}"><div class="course-cover cover-${i}" style="background-image:url('${c[4]}')"><span>${i === 0 ? '趋势' : i === 1 ? '基础' : '实战'}</span></div><div class="course-copy"><b>${c[1]}</b><small>${c[2]}</small><p>${c[3]}</p><span>${i === 0 ? '继续学习　›' : '查看课程　›'}</span></div></button>`).join('')}</div></section><section class="section"><div class="section-head"><h3>学习服务</h3></div><div class="setting-list"><button class="setting" data-action="toast" data-message="学习提醒已开启">学习提醒 <span>每晚 20:30　›</span></button><button class="setting" data-tab="circles">课程配套圈子 <span>3 个　›</span></button></div></section>${bottomNav()}</div>`;
}

function courseDetail(id) {
  const data = { trend: ['趋势技能提升营', '6 讲 · 已学习 72%', '从市场结构到仓位管理，建立自己的交易节奏', 'assets/course-trend.jpg'], basic: ['投资者基础训练', '12 讲 · 待开始', '宏观、行业、公司与风险管理基础', 'assets/course-basic.jpg'], market: ['盘面拆解实战课', '回放 · 42:18', '配套每日投研圈，边看边讨论', 'assets/course-market.jpg'] }[id] || ['趋势技能提升营', '6 讲 · 已学习 72%', '从市场结构到仓位管理，建立自己的交易节奏', 'assets/course-trend.jpg'];
  return `<div class="screen">${shell(data[0], '课程详情 · 金脉投教中心', { light: true, back: '<button class="icon-btn hero-back" aria-label="返回学习中心" data-action="back-learning">‹</button>' })}<div class="course-detail-hero"><div class="course-cover cover-0" style="background-image:url('${data[3]}')"><span>投教</span></div><div><small>系统课程 · 讲师林老师</small><h1>${data[0]}</h1><p>${data[2]}</p></div></div><div class="course-detail-actions"><button class="primary" data-action="start-lesson">${id === 'trend' ? '继续学习' : '开始学习'}　›</button><button data-action="toast" data-message="已加入学习计划">☆ 学习计划</button></div><div class="course-info"><div><b>${data[1].split('·')[0].trim()}</b><span>课程内容</span></div><div><b>配套圈子</b><span>学习交流</span></div><div><b>可回放</b><span>移动学习</span></div></div><section class="section"><div class="section-head"><h3>课程目录</h3><button class="more" data-action="toast" data-message="课程目录已展开">目录 ›</button></div><div class="lesson-list"><button data-action="start-lesson"><span>01</span><div><b>认识市场结构与情绪周期</b><small>12:36 · 已完成</small></div><i>✓</i></button><button data-action="start-lesson"><span>02</span><div><b>趋势中的量价关系</b><small>18:42 · 已完成</small></div><i>✓</i></button><button data-action="start-lesson"><span>03</span><div><b>震荡市的仓位与节奏</b><small>24:08 · 待学习</small></div><i>›</i></button></div></section><section class="section"><div class="section-head"><h3>课程服务</h3></div><div class="setting-list"><button class="setting" data-tab="circles">进入配套学习圈 <span>趋势技能提升营　›</span></button><button class="setting" data-action="toast" data-message="课程资料已打开">下载课程资料 <span>3 份　›</span></button></div></section></div>`;
}

function lesson() {
  return `<div class="screen">${shell('课程播放', '趋势技能提升营 · 第 3 讲', { light: true, back: '<button class="icon-btn hero-back" aria-label="返回课程详情" data-action="back-course">‹</button>' })}<div class="player"><div class="player-screen"><span>▶</span><small>课程视频 · 00:00 / 24:08</small></div><div class="player-controls"><span>▶</span><div class="video-track"><i style="width:18%"></i></div><span>1.0x</span><span>⛶</span></div></div><div class="lesson-heading"><h3>03 震荡市的仓位与节奏</h3><p>讲师：林老师　·　已学习 18%</p></div><div class="lesson-switch"><button class="active">目录</button><button data-action="toast" data-message="课程评论已打开">评论 36</button><button data-action="toast" data-message="课程资料已打开">资料 3</button></div><div class="lesson-list"><button><span>01</span><div><b>认识市场结构与情绪周期</b><small>12:36 · 已完成</small></div><i>✓</i></button><button><span>02</span><div><b>趋势中的量价关系</b><small>18:42 · 已完成</small></div><i>✓</i></button><button class="current"><span>03</span><div><b>震荡市的仓位与节奏</b><small>24:08 · 播放中</small></div><i>▶</i></button></div><button class="complete-lesson" data-action="toast" data-message="已记录学习进度：完成 18%">完成本节并记录进度</button></div>`;
}

function home() {
  return `<div class="screen">${shell('金脉', '自主品牌 · 私域服务中枢', { action: `<button class="icon-btn" data-tab="messages" aria-label="查看消息">♢<b class="badge">3</b></button>` })}
    <section class="home-hero"><div class="home-hero-content"><small>今日直播 · 预约提醒</small><h1>从市场观点，到持续陪伴</h1><p>让每一次直播、课程和投研观点，都沉淀为可持续运营的用户关系。</p><button data-action="live">进入直播间　›</button></div></section>
    <div class="notice"><b>重要通知</b><span>本周策略会议预约已开启，直播开始前 15 分钟提醒</span></div>
    <section class="section"><div class="section-head"><h3>私域服务</h3><button class="more" data-tab="circles">查看全部 ›</button></div><div class="quick-grid"><button class="quick" data-tab="circles"><i>◉</i>我的圈子</button><button class="quick" data-action="live"><i>◷</i>直播预约</button><button class="quick" data-tab="messages"><i>♢</i>消息中心</button><button class="quick" data-tab="profile"><i>★</i>会员权益</button></div><button class="ai-entry" data-action="open-ai"><span class="ai-entry-icon">AI</span><div><b>AI 服务助手</b><p>内容检索、学习辅助与人工服务引导</p></div><strong>体验　›</strong></button><button class="course-promo" data-tab="learning"><span class="course-promo-image"></span><div><b>学习中心</b><span>课程、训练营与学习进度</span></div><strong>继续学习　›</strong></button></section>
    <section class="section"><div class="section-head"><h3>正在直播</h3><button class="more" data-action="live">直播日历 ›</button></div><div class="live-card"><small>LIVE · 1,286 人正在观看</small><h4>收盘复盘：震荡市的仓位与节奏</h4><p>投研主理人 · 林老师　20:00 开始</p><button data-action="live">预约并接收提醒</button></div></section>
    <section class="section"><div class="section-head"><h3>圈子动态</h3><button class="more" data-tab="circles">进入圈子 ›</button></div><div class="feed"><article class="feed-item"><div class="avatar">林</div><div><h4>林老师 · 每日投研圈</h4><p>午后市场情绪边际修复，关注量能是否持续。</p></div><span class="time">8分钟前</span></article><article class="feed-item"><div class="avatar">金</div><div><h4>金脉运营中心</h4><p>《趋势技能提升营》第 6 讲回放已更新。</p></div><span class="time">1小时前</span></article></div></section>${bottomNav()}</div>`;
}

function circleList() {
  const filtered = state.circleCategory === '全部' ? circles : circles.filter(c => state.circleCategory === '每周答疑整理' ? c.id !== 'vip' : c.id !== 'research');
  return `<div class="screen">${shell('圈子', '让内容变成持续关系', { light: true, action: '<button class="icon-btn" aria-label="搜索圈子" data-action="circle-search">⌕</button>' })}<section class="circle-overview"><div><small>金脉学习圈</small><h3>持续学习与服务陪伴</h3><p>把内容、任务、成员和服务放进同一个关系场。</p></div><div class="circle-overview-stats"><span><b>3,797</b>成员</span><span><b>3,741</b>动态</span></div></section><div class="circle-tabs"><button class="active" data-action="circle-filter" data-message="正在展示全部圈子">发现</button><button data-action="circle-filter" data-message="正在展示我加入的圈子">我的圈子</button><button data-action="circle-filter" data-message="正在展示我关注的圈子">已关注</button></div><div class="circle-shortcuts"><button data-action="circle-view" data-view="tasks"><i>✓</i><b>我的任务</b><span>1 个待完成</span></button><button data-action="circle-view" data-view="courses"><i>▣</i><b>课程中心</b><span>3 门学习中</span></button><button data-action="circle-view" data-view="members"><i>◎</i><b>成员</b><span>3,797 人</span></button><button data-action="more-circle"><i>•••</i><b>更多</b><span>通知与服务</span></button></div><div class="circle-categories">${circleCategories.map(category => `<button class="${state.circleCategory === category ? 'active' : ''}" data-action="circle-category" data-category="${category}">${category}</button>`).join('')}</div><div class="circle-list">${filtered.map(c => `<button class="circle-card" data-circle="${c.id}"><div class="circle-top"><div class="circle-icon ${c.tone}" style="background-image:url('${c.image}')"><span>${c.icon}</span></div><div class="circle-title"><h4>${c.title}</h4><p>${c.desc}</p></div><span class="join">${state.joined.has(c.id) ? '已加入' : c.id === 'vip' ? '会员' : '加入'}</span></div><div class="circle-meta"><span>● ${c.active}</span><span>${c.members} 位成员</span></div><div class="post"><b>${state.circleCategory === '课程学习资料' ? '课程资料' : state.circleCategory === '每周答疑整理' ? '答疑整理' : '最新动态'}</b>　${c.post}</div></button>`).join('')}</div>${state.moreOpen ? circleMore() : ''}${bottomNav()}</div>`;
}

function circleDetail(id) {
  const c = circles.find(item => item.id === id) || circles[0];
  return `<div class="screen"><section class="detail-cover" style="background-image:linear-gradient(125deg, rgba(7,27,67,.92), rgba(32,87,180,.58)),url('${c.image}')"><button class="back" aria-label="返回圈子列表" data-action="back">‹</button><small>学习圈 · ${c.members} 位成员</small><h2>${c.title}</h2><p>${c.desc}</p></section><div class="detail-stats"><div><b>${c.members}</b><span>圈子成员</span></div><div><b>38</b><span>今日动态</span></div><div><b>96%</b><span>内容满意度</span></div></div><div class="detail-actions"><button data-action="remind" data-circle-id="${c.id}">♢ ${state.reminders.has(c.id) ? '已开启提醒' : '开启提醒'}</button><button class="primary" data-action="join" data-circle-id="${c.id}">${state.joined.has(c.id) ? '已加入圈子' : '加入圈子'}</button></div><section class="section"><div class="section-head"><h3>圈子内容</h3><button class="more" data-action="circle-view" data-view="tasks">任务 ›</button></div></section><article class="post-card"><header><div class="avatar">林</div><b>林老师</b><span>8分钟前</span></header><p>${c.post} 今天 20:00 直播间会继续拆解盘面结构，欢迎在评论区留下你的问题。</p><div class="post-footer"><span>学习任务</span><span>回放资料</span><span>展开全文</span></div></article><article class="post-card"><header><div class="avatar">金</div><b>金脉运营中心</b><span>1小时前</span></header><p>直播回放已归档至圈子，点击即可继续学习。相关课程和资料也已同步到“我的学习”。</p><div class="post-footer"><span>课程资料</span><span>成员答疑</span></div></article></div>`;
}

function circleView(view) {
  const titles = { tasks: ['我的任务', '任务、打卡与学习进度'], courses: ['课程中心', '课程、任务数与学习状态'], members: ['成员', '圈主、成员与最近活跃'] };
  const [heading, subtitle] = titles[view];
  const body = view === 'tasks' ? `<div class="circle-task-list">${circleTasks.map(([title, copy, status, source]) => `<article class="circle-task"><div class="task-status">${status}</div><b>${title}</b><p>${copy}</p><span>${source}</span><button data-action="toast" data-message="任务详情为演示内容，不会提交打卡">查看任务 ›</button></article>`).join('')}</div>` : view === 'courses' ? `<div class="circle-course-list">${circleCourses.map(([title, count, progress, copy]) => `<button class="circle-course-item" data-action="toast" data-message="课程详情为演示内容"><div class="course-mini-cover">学</div><div><b>${title}</b><small>${count} · ${progress}</small><p>${copy}</p></div><span>›</span></button>`).join('')}</div>` : `<div class="circle-member-list">${circleMembers.map(([name, role, activity], i) => `<article class="circle-member"><div class="avatar">${name.slice(0, 1)}</div><div><b>${name}</b><small>${role}</small><p>${activity}</p></div>${i === 0 ? '<span class="owner-tag">圈主</span>' : ''}</article>`).join('')}</div>`;
  return `<div class="screen">${shell(heading, subtitle, { light: true, back: '<button class="icon-btn hero-back" aria-label="返回圈子" data-action="back-circle-view">‹</button>' })}<section class="section">${body}</section>${bottomNav()}</div>`;
}

function circleMore() {
  return `<div class="circle-more-overlay"><div class="circle-more-panel"><div class="section-head"><h3>更多</h3><button class="icon-btn" aria-label="关闭更多" data-action="more-circle">×</button></div><div class="more-grid"><button data-action="toast" data-message="网页版入口为演示占位"><i>↗</i><b>网页版</b></button><button data-action="toast" data-message="搜索仅用于演示"><i>⌕</i><b>搜索</b></button><button data-action="toast" data-message="分享功能仅用于演示"><i>↗</i><b>分享</b></button><button data-action="circle-view" data-view="tasks"><i>✓</i><b>我的任务</b><span>1</span></button></div><div class="more-info"><div><b>消息通知</b><span>已开启 ${state.notifications.size} 项</span></div><button data-action="circle-view" data-view="notifications">设置 ›</button><div><b>服务有效期</b><span>2026-12-17 续费</span></div><div><b>服务主体</b><span>金脉运营中心</span></div><div><b>圈子 ID</b><span>circle_demo_2026</span></div></div></div></div>`;
}

function notificationSettings() {
  return `<div class="screen">${shell('消息通知', '圈主更新、互动和任务提醒', { light: true, back: '<button class="icon-btn hero-back" aria-label="返回圈子" data-action="back-circle-view">‹</button>' })}<section class="section"><div class="setting-list">${notificationItems.map(item => `<button class="setting" data-action="toggle-notification" data-notification="${item}">${item}<span>${state.notifications.has(item) ? '已开启' : '已关闭'}　›</span></button>`).join('')}</div><p class="security-note">这里只切换本地演示状态，不会向真实账号发送通知。</p></section>${bottomNav()}</div>`;
}

function messages() {
  const list = [['◷', '直播提醒', '收盘复盘将在 20:00 开始，提前进入可参与提问。', '刚刚'], ['◉', '圈子动态', '林老师在“每日投研 · 盘面拆解”发布了新观点。', '8分钟前'], ['▣', '课程更新', '趋势技能提升营第 6 讲回放已更新，点击继续学习。', '1小时前'], ['★', '服务通知', '你的高阶会员权益将在 12 天后到期。', '昨天']];
  return `<div class="screen">${shell('消息中心', '你的内容、圈子与服务提醒', { light: true, action: '<button class="icon-btn" data-action="toast" data-message="已全部标记为已读">✓</button>' })}<div class="message-list">${list.map(([glyph, title, copy, time]) => `<button class="message" data-action="toast" data-message="已打开：${title}"><div class="message-icon">${glyph}</div><div><b>${title}</b><p>${copy}</p></div><time>${time}</time></button>`).join('')}</div><section class="section"><div class="section-head"><h3>触达设置</h3></div><div class="setting-list"><button class="setting" data-action="toast" data-message="直播提醒已开启">直播与预约提醒 <span>已开启　›</span></button><button class="setting" data-action="toast" data-message="圈子动态提醒已开启">圈子动态提醒 <span>已开启　›</span></button><button class="setting" data-action="toast" data-message="课程更新提醒已开启">课程与服务提醒 <span>已开启　›</span></button></div></section>${bottomNav()}</div>`;
}

function market() {
  return `<div class="screen">${shell('投研', '行情、策略与研究内容', { action: '<button class="icon-btn" data-action="toast" data-message="已打开搜索">⌕</button>' })}<div class="market-strip"><div><small>上证指数</small><b>3,885.33</b><span>-0.07%</span></div><div><small>深证成指</small><b>13,384.56</b><span>-0.64%</span></div><div><small>创业板指</small><b>3,285.58</b><span>-1.09%</span></div></div><section class="section"><button class="ai-entry ai-entry--market" data-action="open-ai"><span class="ai-entry-icon">AI</span><div><b>AI 投研服务助手</b><p>整理已授权内容，辅助学习与服务引导</p></div><strong>进入　›</strong></button></section><section class="section"><div class="section-head"><h3>今日投研</h3><button class="more" data-action="toast" data-message="更多研究内容即将打开">更多 ›</button></div><div class="market-list"><article class="market-card"><header><div><h4>盘前策略 · 震荡中的结构机会</h4><small>林老师　08:35 发布</small></div><span class="join">圈子同步</span></header><div class="number">关注量能变化 <span>● 新</span></div></article><article class="market-card"><header><div><h4>行业观察 · 新能源链条跟踪</h4><small>研究中心　昨天</small></div><span class="join">会员可见</span></header><div class="number">3 个重点方向 <span>↗</span></div></article></div></section><section class="section"><div class="section-head"><h3>自选与诊股</h3></div><div class="quick-grid"><button class="quick" data-action="toast" data-message="自选股功能演示"><i>☆</i>自选股</button><button class="quick" data-action="toast" data-message="智能诊股功能演示"><i>⌁</i>智能诊股</button><button class="quick" data-action="toast" data-message="股票池功能演示"><i>▦</i>策略股票池</button><button class="quick" data-action="toast" data-message="研报功能演示"><i>▤</i>研究报告</button></div></section>${bottomNav()}</div>`;
}

function aiAssistant() {
  const prompts = [
    ['今日直播重点', '已为你整理本场直播的内容目录、关联回放和圈子讨论入口。'],
    ['课程中的仓位管理', '可以从《趋势技能提升营》第 3 讲和课后资料中查找相关内容，并回到课程继续学习。'],
    ['转人工服务', '已为你定位服务入口。演示中不会提交真实咨询，可按客户服务 SOP 接入人工坐席或企微。'],
  ];
  const messages = state.aiMessages.map(([question, answer]) => `<div class="ai-message ai-message--user">${question}</div><div class="ai-message ai-message--assistant"><b>AI 服务助手</b><p>${answer}</p><small>仅供信息整理与学习辅助，不构成投资建议</small></div>`).join('');
  return `<div class="screen ai-screen">${shell('AI 服务助手', '演示入口 · 内容服务与用户引导', { light: true, back: '<button class="icon-btn hero-back" aria-label="返回首页" data-action="back-ai">‹</button>' })}<section class="ai-welcome"><span class="ai-orb">AI</span><div><small>金融服务场景</small><h3>把已授权内容，转成可用服务</h3><p>结合课程、直播、圈子和知识库，为用户提供内容检索、学习辅助与服务分流。</p></div></section><section class="section ai-service-notes"><div><b>接入客户现有 Agent</b><span>复用客户知识库与编排能力</span></div><div><b>定制金融服务 Agent</b><span>按内容、服务 SOP 与合规边界建设</span></div></section><section class="section"><div class="section-head"><h3>你可以这样问</h3></div><div class="ai-suggestions">${prompts.map(([question, answer]) => `<button data-action="ai-prompt" data-question="${question}" data-answer="${answer}">${question}<span>›</span></button>`).join('')}</div></section><section class="section"><div class="section-head"><h3>对话示意</h3><span class="status-chip">本地演示</span></div><div class="ai-chat">${messages || '<div class="ai-message ai-message--assistant"><b>AI 服务助手</b><p>你好，我可以帮你定位课程、直播回放、圈子内容与服务入口。</p><small>仅供信息整理与学习辅助，不构成投资建议</small></div>'}</div></section><div class="ai-compose"><input aria-label="AI 服务助手输入框" placeholder="输入你的问题" readonly /><button data-action="toast" data-message="演示版仅支持上方示例问题">发送</button></div></div>`;
}

function profile() {
  return `<div class="screen">${shell('我的', '用户、权益与服务', { light: true, action: '<button class="icon-btn" aria-label="打开设置" data-action="toast" data-message="设置已打开">⚙</button>' })}<div class="profile"><div class="profile-card"><div class="profile-avatar">白</div><div><h3>白金用户</h3><p>已加入 3 个圈子　·　连续学习 18 天</p></div></div><div class="member-card"><b>高阶会员服务</b><p>专属圈子、策略会议、投研资料和 1V1 答疑</p><button data-action="toast" data-message="会员权益页已打开">查看我的权益　›</button></div><div class="setting-list"><button class="setting" data-tab="circles">我的圈子 <span>3 个　›</span></button><button class="setting" data-tab="learning">我的课程 <span>6 门　›</span></button><button class="setting" data-tab="messages">消息设置 <span>3 条未读　›</span></button><button class="setting" data-action="security">隐私与合规 <span>安全中心　›</span></button></div></div>${bottomNav()}</div>`;
}

function security() {
  return `<div class="screen">${shell('隐私与合规', '合规展示 · 信息安全 · 部署边界', { light: true, back: '<button class="icon-btn hero-back" aria-label="返回我的" data-action="back-profile">‹</button>' })}<section class="section"><div class="security-hero"><small>COMPLIANCE & SECURITY</small><h3>让合规与安全成为产品能力</h3><p>风险提示、适当性、用户授权和审计留痕可配置；数据部署边界可按客户安全域评估。</p></div></section><section class="section"><div class="section-head"><h3>合规组件</h3><span class="status-chip">可配置</span></div><div class="security-grid"><article class="security-card"><b>适当性与风险提示</b><p>R3/C3 文案、投资有风险、反诈提醒、风险提示角标。</p></article><article class="security-card"><b>身份与信息披露</b><p>执业信息、隐私协议、青少年模式、SDK 清单与授权说明。</p></article><article class="security-card"><b>运营留痕</b><p>关键操作、内容审核、用户授权和消息触达记录可查询。</p></article></div></section><section class="section"><div class="section-head"><h3>部署与安全</h3><span class="status-chip status-chip--green">按边界组合</span></div><div class="deployment-card"><div><b>部分私有化部署</b><p>用户、业务数据和审计日志可部署在客户安全域；内容运营、消息、直播等平台能力按需组合。</p></div><div class="security-pills"><span>传输加密</span><span>存储加密</span><span>最小权限</span><span>租户隔离</span><span>审计日志</span><span>备份恢复</span></div></div><p class="security-note">具体部署范围需结合客户主体、数据分类分级及法务/安全评审确认。</p></section></div>`;
}

function live() {
  const sections = ['互动', '排行榜', '介绍'];
  const sectionBody = state.liveSection === '互动' ? `<div class="live-chat"><div class="assistant-card"><b>直播助手</b><p>欢迎进入直播间：请自行调节音量，听众发言可以在讨论区进行或以弹幕形式查看。</p></div><div class="discussion-head"><b>讨论区</b><span>互动评论 36</span></div><div class="discussion-list"><article><div class="avatar">林</div><div><b>林老师</b><p>欢迎大家在讨论区留下问题，回放也可以继续交流。</p><time>刚刚</time></div></article><article><div class="avatar">白</div><div><b>白金用户</b><p>今天的资产配置案例很有启发，已加入课后任务。</p><time>3分钟前</time></div></article><article><div class="avatar">研</div><div><b>研究小组</b><p>请问回放资料会同步到课程中心吗？</p><time>8分钟前</time></div></article></div><div class="discussion-compose"><input aria-label="讨论区输入框" placeholder="说点什么，参与讨论" readonly /><button data-action="toast" data-message="讨论内容仅为演示，不会提交到真实直播间">提交</button></div><button class="ask-entry" data-action="toast" data-message="提问入口为演示，不会发送问题">问　向讲师提问</button></div>` : state.liveSection === '排行榜' ? `<div class="ranking-card"><div><b>本场贡献榜</b><span>仅展示演示数据</span></div><ol><li><i>1</i><b>白金用户</b><span>连续学习 18 天</span></li><li><i>2</i><b>研究小组</b><span>完成 6 个任务</span></li><li><i>3</i><b>新加入用户</b><span>刚刚进入直播间</span></li></ol></div>` : `<div class="live-intro"><h3>【直播回放】收盘复盘：震荡市的仓位与节奏</h3><p>开始时间：2026.09.23 14:30</p><p>回放有效期：2026.09.23 17:39 至 2026.09.24 17:39</p><p>详情：暂无详情</p></div>`;
  return `<div class="screen">${shell('直播间', '直播、回放与互动服务', { light: true, back: '<button class="icon-btn hero-back" aria-label="返回首页" data-action="back-home">‹</button>', action: '<button class="icon-btn" aria-label="直播更多" data-action="toast" data-message="直播更多功能已打开">•••</button>' })}<div class="live-room"><div class="live-stage"><span class="live-badge">回放</span><span class="live-viewers">讲解中</span><button class="live-play" data-action="toast" data-message="播放控制为演示状态">▶</button><small>00:00 / 42:18　 1.0x　⛶</small></div><div class="live-room-title"><div><h3>收盘复盘：震荡市的仓位与节奏</h3><p>吴晓波频道　·　回放有效期内</p></div><button data-action="book-live">${state.booked ? '已预约' : '预约提醒'}</button></div></div><div class="live-tabs">${sections.map(s => `<button class="${state.liveSection === s ? 'active' : ''}" data-action="live-section" data-section="${s}">${s}</button>`).join('')}</div><section class="section">${sectionBody}</section><section class="section"><div class="section-head"><h3>直播带货</h3><span class="status-chip">${state.liveCart.size ? `待购 ${state.liveCart.size} 件` : '私域专享'}</span></div><div class="live-products"><article class="product-card"><div class="product-cover product-cover--gold">会员</div><div class="product-info"><b>财富增长超级会员</b><p>畅听全场课程 · 服务有效期内可回放</p><small>¥2,980　·　13,126 人购买</small></div><button data-action="buy-live" data-product="会员">${state.liveCart.has('会员') ? '已加入' : '购买'}</button></article><article class="product-card"><div class="product-cover product-cover--blue">课程</div><div class="product-info"><b>财富增长课程包</b><p>直播回放、课程资料和任务权益</p><small>¥999 起　·　会员专享</small></div><button data-action="buy-live" data-product="课程">${state.liveCart.has('课程') ? '已加入' : '购买'}</button></article><article class="product-card"><div class="product-cover product-cover--red">资料</div><div class="product-info"><b>家庭资产配置资料包</b><p>配置清单、复盘表和学习手册</p><small>¥360　·　限时优惠</small></div><button data-action="buy-live" data-product="资料">${state.liveCart.has('资料') ? '已加入' : '购买'}</button></article></div><div class="coupon-row"><span>专属补差升级券　¥360 · 满 ¥2,980 可用</span><button data-action="claim-coupon">${state.couponClaimed ? '已领取' : '领取'}</button></div></section><section class="section"><div class="section-head"><h3>直播后继续</h3><span class="status-chip">服务承接</span></div><div class="setting-list"><button class="setting" data-circle="research">进入每日投研圈 <span>讨论直播观点　›</span></button><button class="setting" data-action="toast" data-message="回放已打开">继续观看回放 <span>42:18　›</span></button><button class="setting" data-tab="learning">进入课程中心 <span>8 门课程　›</span></button></div></section><p class="live-safety">直播内容及互动评论需遵守平台规则；请谨慎判断，注意财产安全。</p></div>`;
}

function render() {
  if (state.ai) app.innerHTML = aiAssistant();
  else if (state.security) app.innerHTML = security();
  else if (state.circleView === 'notifications') app.innerHTML = notificationSettings();
  else if (state.circleView !== 'feed') app.innerHTML = circleView(state.circleView);
  else if (state.circle) app.innerHTML = circleDetail(state.circle);
  else if (state.lesson) app.innerHTML = lesson();
  else if (state.courseId) app.innerHTML = courseDetail(state.courseId);
  else if (state.tab === 'home') app.innerHTML = home();
  else if (state.tab === 'learning') app.innerHTML = course();
  else if (state.tab === 'circles') app.innerHTML = circleList();
  else if (state.tab === 'messages') app.innerHTML = messages();
  else if (state.tab === 'market') app.innerHTML = market();
  else if (state.tab === 'profile') app.innerHTML = profile();
  else if (state.tab === 'live') app.innerHTML = live();
  if (state.toast) {
    const toast = document.createElement('div'); toast.className = 'toast'; toast.textContent = state.toast; app.appendChild(toast);
    setTimeout(() => { state.toast = null; render(); }, 1900);
  }
}

document.addEventListener('click', event => {
  const theme = event.target.closest('[data-theme-choice]');
  if (theme) { setPresentationTheme(theme.dataset.themeChoice); return; }
  const tab = event.target.closest('[data-tab]');
  const circle = event.target.closest('[data-circle]');
  const action = event.target.closest('[data-action]');
  if (tab) { state.tab = tab.dataset.tab; state.security = false; state.ai = false; state.circle = null; state.circleView = 'feed'; state.moreOpen = false; state.courseId = null; state.lesson = false; render(); return; }
  if (circle) { state.circle = circle.dataset.circle; state.circleView = 'feed'; state.moreOpen = false; render(); return; }
  if (action) {
    if (action.dataset.action === 'toggle-care') { setCareMode(!document.body.classList.contains('care-mode')); return; }
    if (action.dataset.action === 'open-ai') { state.ai = true; state.circle = null; state.courseId = null; state.lesson = false; render(); return; }
    if (action.dataset.action === 'back-ai') { state.ai = false; render(); return; }
    if (action.dataset.action === 'ai-prompt') { state.aiMessages.push([action.dataset.question, action.dataset.answer]); render(); return; }
    if (action.dataset.action === 'back') { state.circle = null; state.circleView = 'feed'; state.tab = 'circles'; render(); return; }
    if (action.dataset.action === 'back-home') { state.circle = null; state.tab = 'home'; render(); return; }
    if (action.dataset.action === 'back-profile') { state.security = false; state.circle = null; state.tab = 'profile'; render(); return; }
    if (action.dataset.action === 'security') { state.security = true; state.circle = null; state.circleView = 'feed'; state.courseId = null; state.lesson = false; render(); return; }
    if (action.dataset.action === 'back-circle-view') { state.circleView = 'feed'; state.moreOpen = false; render(); return; }
    if (action.dataset.action === 'circle-view') { state.circleView = action.dataset.view; state.moreOpen = false; state.circle = null; render(); return; }
    if (action.dataset.action === 'circle-category') { state.circleCategory = action.dataset.category; render(); return; }
    if (action.dataset.action === 'more-circle') { state.moreOpen = !state.moreOpen; render(); return; }
    if (action.dataset.action === 'circle-search') { state.toast = '搜索为演示入口，可接入圈子内容与成员搜索'; render(); return; }
    if (action.dataset.action === 'toggle-notification') { const key = action.dataset.notification; state.notifications.has(key) ? state.notifications.delete(key) : state.notifications.add(key); render(); return; }
    if (action.dataset.action === 'back-learning') { state.courseId = null; state.lesson = false; state.tab = 'learning'; render(); return; }
    if (action.dataset.action === 'back-course') { state.lesson = false; state.courseId = 'trend'; render(); return; }
    if (action.dataset.action === 'live') { state.tab = 'live'; state.circle = null; state.liveSection = '互动'; state.liveCart.clear(); state.couponClaimed = false; render(); return; }
    if (action.dataset.action === 'book-live') { state.booked = true; state.toast = '已预约，开播前 15 分钟提醒你'; render(); return; }
    if (action.dataset.action === 'buy-live') { state.liveCart.add(action.dataset.product); state.toast = `${action.dataset.product}商品已加入待购演示`; render(); return; }
    if (action.dataset.action === 'claim-coupon') { state.couponClaimed = true; state.toast = '优惠券已领取到演示账户'; render(); return; }
    if (action.dataset.action === 'live-section') { state.liveSection = action.dataset.section; render(); return; }
    if (action.dataset.action === 'join') { state.joined.add(action.dataset.circleId); state.toast = '已加入圈子，后续动态将持续触达'; render(); return; }
    if (action.dataset.action === 'remind') { state.reminders.add(action.dataset.circleId); state.toast = '已开启圈子动态提醒'; render(); return; }
    if (action.dataset.action === 'course') { state.courseId = action.dataset.course || 'trend'; state.lesson = false; render(); return; }
    if (action.dataset.action === 'start-lesson') { state.lesson = true; render(); return; }
    if (action.dataset.action === 'circle-filter') { state.toast = action.dataset.message; render(); return; }
    state.toast = action.dataset.message || '操作已完成'; render();
  }
});

render();
