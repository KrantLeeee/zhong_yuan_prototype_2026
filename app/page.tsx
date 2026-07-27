"use client";

import { FormEvent, TouchEvent, useEffect, useRef, useState } from "react";

type Tab = "discover" | "watch" | "select";
type SelectTab = "hot" | "shape" | "strategy";
type ClassicView = "home" | "quotes" | "market" | "trade" | "wealth" | "profile";
type ReasoningMode = "smart" | "fast" | "deep" | "classic";
type FunctionPageId = "condition-order" | "bank-transfer" | "open-account" | "reverse-repo";
type StandalonePage = "search" | "daily-report" | FunctionPageId | null;
type StockInfo = { name: string; code: string; price: string; change: string; delta: string; market?: string };
type ArticleInfo = {
  id: string;
  kind: "资讯" | "公告" | "研报";
  title: string;
  source: string;
  time: string;
  lead: string;
  points: string[];
  conclusion: string;
  analysis: string[];
};

const topTabs: { id: Tab; label: string }[] = [
  { id: "discover", label: "发现" },
  { id: "watch", label: "看盘" },
  { id: "select", label: "选股" },
];

const sceneLabels: Record<Tab, string> = {
  discover: "AI切换版 · 发现模块",
  watch: "AI切换版 · 看盘模块",
  select: "AI切换版 · 选股模块",
};

const quickLinkSections = [
  {
    title: "",
    links: [
      { icon: "＃", tone: "yellow", title: "我的收藏", description: "收藏的问句都在这" },
      { icon: "◡", tone: "blue", title: "人工客服", description: "有问题找专属客服" },
    ],
  },
  {
    title: "帮你看盘",
    links: [
      { icon: "⌁", tone: "blue", title: "个股分析", description: "五大维度为你诊股" },
      { icon: "↗", tone: "blue", title: "大盘分析", description: "明星投顾独家解读" },
      { icon: "∿", tone: "red", title: "行业分析", description: "行业趋势专业分析" },
      { icon: "↗", tone: "orange", title: "账户分析", description: "全方位资产分析" },
    ],
  },
  {
    title: "帮你选股",
    links: [
      { icon: "★", tone: "orange", title: "概念选股", description: "概念相关股票筛选" },
      { icon: "▼", tone: "blue", title: "行业选股", description: "行业相关股票筛选" },
    ],
  },
] as const;

const stockCatalog: Record<string, StockInfo> = {
  "601375": { name: "中原证券", code: "601375", price: "4.15", change: "+1.72%", delta: "0.07" },
  "600000": { name: "浦发银行", code: "600000", price: "9.14", change: "+3.04%", delta: "0.27" },
  "600519": { name: "贵州茅台", code: "600519", price: "1488.00", change: "+0.68%", delta: "10.05", market: "沪A" },
  "300033": { name: "同花顺", code: "300033", price: "224.91", change: "+4.34%", delta: "9.35" },
  "300331": { name: "苏大维格", code: "300331", price: "39.00", change: "-12.48%", delta: "-5.56" },
  "300442": { name: "润泽科技", code: "300442", price: "65.11", change: "-3.93%", delta: "-2.66", market: "深股通" },
  "831370": { name: "新安洁", code: "831370", price: "5.82", change: "+14.4%", delta: "0.73" },
  "688035": { name: "德邦科技", code: "688035", price: "42.76", change: "+14.7%", delta: "5.49" },
  "001339": { name: "智微智能", code: "001339", price: "58.31", change: "+10.0%", delta: "5.30" },
  "000625": { name: "长安汽车", code: "000625", price: "15.62", change: "+12.4%", delta: "1.72" },
  "002230": { name: "科大讯飞", code: "002230", price: "52.08", change: "+8.7%", delta: "4.16" },
  "300456": { name: "赛微电子", code: "300456", price: "31.26", change: "+140.52%", delta: "18.26" },
  "301232": { name: "飞沃科技", code: "301232", price: "88.40", change: "+151.92%", delta: "53.31" },
};

const initialWatchlist = ["601375", "600000", "300033", "300331"];

const articleCatalog: ArticleInfo[] = [
  {
    id: "market-close",
    kind: "资讯",
    title: "A股收评：沪指低开高收，市场成交额突破3万亿元",
    source: "同花顺7x24快讯",
    time: "15:01",
    lead: "三大指数涨跌不一，能源、贵金属和航运方向走强，人工智能应用板块出现分化。",
    points: ["沪指上涨0.47%，两市成交保持活跃。", "能源与避险资产获得资金集中关注。", "AI应用方向分化，后续仍需观察量能承接。"],
    conclusion: "地缘事件与能源价格变化推动资金重新定价，能源、贵金属和高股息方向短期占优。",
    analysis: ["事件触发：海外风险升温抬高原油和黄金的风险溢价。", "产业传导：上游资源品盈利预期改善，航运和化工成本端承压。", "市场映射：资金偏好由高弹性题材转向业绩确定性与防御资产。"],
  },
  {
    id: "moutai-announcement",
    kind: "公告",
    title: "贵州茅台发布2026年半年度经营情况公告",
    source: "上市公司公告",
    time: "12:06",
    lead: "公司披露阶段性经营数据，主营业务保持稳健，现金分红安排持续推进。",
    points: ["主营产品销售节奏总体平稳。", "渠道库存与终端动销维持健康区间。", "现金分红计划按既定安排推进。"],
    conclusion: "公告未改变贵州茅台中长期经营逻辑，核心关注点仍是渠道动销、产品结构与分红兑现。",
    analysis: ["经营质量：核心产品收入保持韧性，产品结构继续优化。", "股东回报：稳定分红增强长期资金持有意愿。", "风险因素：消费需求变化与渠道价格波动仍需持续跟踪。"],
  },
  {
    id: "liquor-research",
    kind: "研报",
    title: "白酒行业中期策略：需求修复与高质量增长并行",
    source: "中原证券研究所",
    time: "09:30",
    lead: "研报认为行业进入结构性修复阶段，龙头酒企的品牌、渠道和现金流优势进一步凸显。",
    points: ["高端白酒需求韧性强于行业整体。", "渠道库存逐步回归合理水平。", "建议关注现金流稳定、分红能力突出的龙头公司。"],
    conclusion: "行业从普遍扩张转向结构分化，具备品牌壁垒和渠道掌控力的龙头更具确定性。",
    analysis: ["需求侧：宴席与商务场景逐步修复，但价格带表现分化。", "供给侧：酒企主动控货稳价，渠道利润有望改善。", "投资线索：关注高端龙头、区域强势品牌与高股息标的。"],
  },
];

function matchFunctionIntent(text: string): FunctionPageId | null {
  if (/条件单|自动交易/.test(text)) return "condition-order";
  if (/银证|转账|资金划转/.test(text)) return "bank-transfer";
  if (/开户|开账户/.test(text)) return "open-account";
  if (/国债|逆回购/.test(text)) return "reverse-repo";
  return null;
}

function Mascot() {
  return <div className="mascot"><img src="/xiaobao-avatar.png" alt="小宝IP形象" /></div>;
}

function MiniLine({ down = false }: { down?: boolean }) {
  return <div className={`mini-line ${down ? "down" : ""}`}><i /><i /><i /><i /><i /><i /><i /><i /></div>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("discover");
  const [selectTab, setSelectTab] = useState<SelectTab>("hot");
  const [classic, setClassic] = useState(false);
  const [classicView, setClassicView] = useState<ClassicView>("home");
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [toast, setToast] = useState("");
  const [voicePlayback, setVoicePlayback] = useState(true);
  const [voiceListening, setVoiceListening] = useState(false);
  const [reasoningMode, setReasoningMode] = useState<ReasoningMode>("smart");
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [quickDrawerOpen, setQuickDrawerOpen] = useState(false);
  const [aiUtilityView, setAiUtilityView] = useState<ClassicView | null>(null);
  const [contextAssistantOpen, setContextAssistantOpen] = useState(false);
  const [contextQuestion, setContextQuestion] = useState("");
  const [classicChatOpen, setClassicChatOpen] = useState(false);
  const [watchInsight, setWatchInsight] = useState("");
  const [standalonePage, setStandalonePage] = useState<StandalonePage>(null);
  const [selectedStock, setSelectedStock] = useState<StockInfo | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleInfo | null>(null);
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [watchlistLoaded, setWatchlistLoaded] = useState(false);
  const [functionBackToSearch, setFunctionBackToSearch] = useState(false);
  const [toastAction, setToastAction] = useState<(() => void) | null>(null);

  const reasoningModes: { id: ReasoningMode; label: string; description: string }[] = [
    { id: "smart", label: "智能调度", description: "根据会话任务，智能调度模型" },
    { id: "fast", label: "快速推理", description: "简单推理，快速响应" },
    { id: "deep", label: "深度思考", description: "多步规划，深度推理" },
    { id: "classic", label: "传统引擎", description: "传统对话引擎，快捷式诊选股" },
  ];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("caishengbao-watchlist");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setWatchlist(parsed.filter(code => typeof code === "string" && stockCatalog[code]));
        }
      } catch {
        // Keep the built-in demo watchlist when browser storage is unavailable.
      }
      setWatchlistLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!watchlistLoaded) return;
    try {
      window.localStorage.setItem("caishengbao-watchlist", JSON.stringify(watchlist));
    } catch {
      // In-memory synchronization still works when storage is unavailable.
    }
  }, [watchlist, watchlistLoaded]);

  function flash(text: string, action?: () => void) {
    setToast(text);
    setToastAction(() => action ?? null);
    window.setTimeout(() => { setToast(""); setToastAction(null); }, action ? 3200 : 1800);
  }

  function ask(text: string) {
    const functionIntent = matchFunctionIntent(text);
    if (functionIntent && /打开|进入|办理|怎么|如何/.test(text)) {
      openFunction(functionIntent);
      return;
    }
    setQuery(text);
    if (text.includes("压力位")) {
      setReply("上证指数短线压力位可重点观察 4200 点附近。该结论基于近期高点与成交密集区，仅供参考。");
    } else if (text.includes("选股") || text.includes("ROE") || text.includes("自定义条件")) {
      setReply("已理解你的定制条件：近三年ROE保持在15%以上、现金流稳定，并优先关注当前有资金关注的行业。我已调用选股能力生成匹配结果。");
    } else if (text.includes("资金")) {
      setReply("当前资金主要流向人工智能、机器人与高股息方向，板块内部仍存在明显分化。");
    } else if (text.includes("公告") || text.includes("贵州茅台")) {
      setReply("已延续刚才的公告查询。贵州茅台近期重要信息集中在经营数据、现金分红安排与股东大会决议，短期未见改变核心经营逻辑的重大风险事项。");
    } else {
      setReply("已为你整理相关数据与核心结论。你可以继续追问，或点击卡片进入对应功能页面。");
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) ask(query.trim());
  }

  function switchScene(next: Tab) {
    setClassic(false);
    setStandalonePage(null);
    setSelectedStock(null);
    setSelectedArticle(null);
    setAiUtilityView(null);
    setContextAssistantOpen(false);
    setWatchInsight("");
    setTab(next);
    setReply("");
    setQuery("");
  }

  function openStock(code: string) {
    setStandalonePage(null);
    setSelectedArticle(null);
    setSelectedStock(stockCatalog[code] ?? stockCatalog["300442"]);
  }

  function openArticle(id: string) {
    const article = articleCatalog.find(item => item.id === id);
    if (article) setSelectedArticle(article);
  }

  function openFunction(id: FunctionPageId, backToSearch = false) {
    setSelectedArticle(null);
    setSelectedStock(null);
    setFunctionBackToSearch(backToSearch);
    setStandalonePage(id);
  }

  function openWatchlist() {
    setSelectedArticle(null);
    setSelectedStock(null);
    setStandalonePage(null);
    setClassic(true);
    setClassicView("quotes");
    setClassicChatOpen(false);
    setAiUtilityView(null);
  }

  function toggleStock(code: string) {
    const stock = stockCatalog[code];
    if (!stock) return;
    const removing = watchlist.includes(code);
    setWatchlist(current => removing ? current.filter(item => item !== code) : [...current, code]);
    if (removing) flash(`${stock.name}已从自选移除`);
    else flash(`${stock.name}已添加自选 · 去查看`, openWatchlist);
  }

  function openAiStockSelection() {
    const prompt = "帮我自定义选股：近三年ROE超过15%，现金流稳定，并关注近期资金流入";
    setClassic(false);
    setStandalonePage(null);
    setSelectedStock(null);
    setSelectedArticle(null);
    setAiUtilityView(null);
    setTab("discover");
    ask(prompt);
  }

  function continueSearchConversation(question: string) {
    setStandalonePage(null);
    setSelectedStock(null);
    setSelectedArticle(null);
    setClassic(false);
    setAiUtilityView(null);
    setTab("discover");
    ask(question);
  }

  const phoneTitle = selectedArticle
    ? `${selectedArticle.kind}详情 · AI解读`
    : selectedStock
    ? `个股行情 · ${selectedStock.name}`
    : standalonePage
      ? { search: "全局搜索", "condition-order": "条件单", "daily-report": "AI日报", "bank-transfer": "银证转账", "open-account": "在线开户", "reverse-repo": "国债逆回购" }[standalonePage]
      : classic
        ? `经典版 · ${{home:"首页",quotes:"行情-自选",market:"行情-行情",trade:"交易",wealth:"理财",profile:"我的"}[classicView]}`
        : aiUtilityView
          ? `AI版 · ${{home:"小宝",quotes:"行情",market:"行情",trade:"交易",wealth:"理财",profile:"我的"}[aiUtilityView]}`
          : sceneLabels[tab];

  return (
    <main className="prototype-page">
      <aside className="review-rail">
        <div className="doc-brand"><span>中原证券</span><b>财升宝智能化升级</b></div>
        <p className="kicker">WORD 原型复刻版</p>
        <h1>按方案稿页面结构<br />还原交互 Demo</h1>
        <p className="rail-copy">本版依据文档中的原型截图搭建，不再使用概念型视觉。点击下方场景可直接切换手机页面。</p>
        <div className="scene-picker">
          {topTabs.map((item, index) => (
            <button key={item.id} className={!classic && tab === item.id ? "active" : ""} onClick={() => switchScene(item.id)}>
              <span>0{index + 1}</span><div><b>{item.label}</b><small>{sceneLabels[item.id]}</small></div><i>›</i>
            </button>
          ))}
          <button className={classic ? "active" : ""} onClick={() => { setClassic(true); setClassicView("home"); setClassicChatOpen(false); setAiUtilityView(null); setStandalonePage(null); setSelectedStock(null); setReply(""); }}>
            <span>04</span><div><b>经典版联动</b><small>自选场景 · AI浮窗入口</small></div><i>›</i>
          </button>
        </div>
        <div className="fidelity-note"><b>本次校准</b><p>浅蓝色AI页面、顶部三级导航、白色内容卡片、深度思考输入区、五栏底部导航，均与 Word 截图保持一致。</p></div>
      </aside>

      <section className="phone-stage" aria-label="财升宝APP智能化升级交互原型">
        <div className="phone-label"><span>{phoneTitle}</span><small>示例数据仅用于原型演示</small></div>
        <div className={`phone ${classic ? "classic-mode" : ""} ${aiUtilityView ? "ai-utility-mode" : ""} ${standalonePage || selectedStock || selectedArticle ? "standalone-mode" : ""}`}>
          <div className="status"><b>{classic ? "20:41" : "9:03"}</b><span>▮▮▮ {classic ? "5G" : "4G"}　▰</span></div>

          {selectedArticle ? (
            <ArticleDetailPage article={selectedArticle} onBack={() => setSelectedArticle(null)} onContinue={(question) => { setSelectedArticle(null); continueSearchConversation(question); }} />
          ) : selectedStock ? (
            <StockDetailPage stock={selectedStock} added={watchlist.includes(selectedStock.code)} onBack={() => setSelectedStock(null)} onToggle={() => toggleStock(selectedStock.code)} onOpenArticle={openArticle} flash={flash} />
          ) : standalonePage === "daily-report" ? (
            <DailyReportPage watchlistCount={watchlist.length} onBack={() => setStandalonePage(null)} />
          ) : standalonePage === "search" ? (
            <GlobalSearchPage onBack={() => setStandalonePage(null)} onOpenFunction={(id) => openFunction(id, true)} onContinue={continueSearchConversation} onOpenStock={openStock} onToggleStock={toggleStock} onOpenArticle={openArticle} isAdded={(code) => watchlist.includes(code)} />
          ) : standalonePage === "condition-order" ? (
            <ConditionOrderPage onBack={() => setStandalonePage(functionBackToSearch ? "search" : null)} flash={flash} />
          ) : standalonePage ? (
            <NativeFunctionPage id={standalonePage} onBack={() => setStandalonePage(functionBackToSearch ? "search" : null)} flash={flash} />
          ) : classic ? (
            classicChatOpen
              ? <ClassicChatPage reply={reply} question={query} onAsk={ask} onClose={() => setClassicChatOpen(false)} />
              : <ClassicScreen view={classicView} onView={setClassicView} onBack={() => setClassic(false)} onAssistant={() => setClassicChatOpen(true)} flash={flash} onSearch={() => setStandalonePage("search")} onDailyReport={() => setStandalonePage("daily-report")} onOpenStock={openStock} onToggleStock={toggleStock} watchlist={watchlist} />
          ) : aiUtilityView ? (
            <>
              <ClassicScreen
                view={aiUtilityView}
                aiMode
                onView={(next) => { setContextAssistantOpen(false); setContextQuestion(""); setAiUtilityView(next === "home" ? null : next); }}
                onBack={() => setAiUtilityView(null)}
                onAssistant={() => { setContextQuestion(""); setContextAssistantOpen(true); }}
                flash={flash}
                onSearch={() => setStandalonePage("search")}
                onDailyReport={() => setStandalonePage("daily-report")}
                onOpenStock={openStock}
                onToggleStock={toggleStock}
                watchlist={watchlist}
              />
              {contextAssistantOpen && <ContextAssistant
                view={aiUtilityView}
                question={contextQuestion}
                onQuestion={(text) => { const intent = matchFunctionIntent(text); if (intent && text.startsWith("打开")) { setContextAssistantOpen(false); openFunction(intent); } else setContextQuestion(text); }}
                onClose={() => { setContextAssistantOpen(false); setContextQuestion(""); }}
                onInteract={flash}
                onEscalate={(text) => { setContextAssistantOpen(false); setContextQuestion(""); setAiUtilityView(null); setTab("discover"); ask(text); }}
              />}
            </>
          ) : (
            <>
              <header className="ai-header">
                <button className="classic-switch" onClick={() => { setClassic(true); setClassicView("home"); setClassicChatOpen(false); setAiUtilityView(null); setStandalonePage(null); setSelectedStock(null); }}>⇆ 经典版</button>
                <nav>{topTabs.map(item => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => switchScene(item.id)}>{item.label}</button>)}</nav>
                <button className={`header-icon voice-toggle ${voicePlayback ? "on" : "off"}`} aria-label={voicePlayback ? "关闭语音播报" : "开启语音播报"} aria-pressed={voicePlayback} onClick={() => { setVoicePlayback(v => !v); flash(voicePlayback ? "语音播报已关闭" : "语音播报已开启"); }}>
                  <span className="speaker-icon" aria-hidden="true"><b /><em /><em /></span>
                </button>
                <button className="header-icon menu" aria-label="更多菜单" onClick={() => flash("已打开更多功能")}>☰</button>
              </header>

              <div className="ai-body">
                {tab === "discover" && <Discover reply={reply} question={query} onAsk={ask} onBannerAction={flash} onOpenSelection={() => setTab("select")} />}
                {tab === "watch" && <Watch flash={flash} onInsight={setWatchInsight} />}
                {tab === "select" && <SelectStock active={selectTab} setActive={setSelectTab} onAsk={ask} reply={reply} onOpenStock={openStock} onToggleStock={toggleStock} onOpenAi={openAiStockSelection} isAdded={(code) => watchlist.includes(code)} />}
              </div>

              <form className="composer" onSubmit={submit}>
                {voiceListening ? <button className="voice-listening" type="button" onClick={() => setVoiceListening(false)} aria-label="结束语音输入">
                  <b>我在听！请说...</b><span>松开发送　上滑取消</span><i className="voice-wave" aria-hidden="true">{Array.from({length:24},(_,i)=><em key={i} />)}</i>
                </button> : <>
                  {modeMenuOpen && <div className="reasoning-menu" role="menu" aria-label="选择推理模式">{reasoningModes.map((mode,index)=><button type="button" role="menuitemradio" aria-checked={reasoningMode===mode.id} className={reasoningMode===mode.id?"active":""} key={mode.id} onClick={() => { setReasoningMode(mode.id); setModeMenuOpen(false); flash(`已切换为${mode.label}`); }}><i>{["▤","ϟ","◎","⬡"][index]}</i><span><b>{mode.label}</b><small>{mode.description}</small></span></button>)}</div>}
                  <div className="thinking"><button type="button" aria-expanded={modeMenuOpen} onClick={() => setModeMenuOpen(v=>!v)}><i>▤</i>{reasoningModes.find(mode=>mode.id===reasoningMode)?.label}<span>{modeMenuOpen?"⌃":"⌄"}</span></button></div>
                  <div className="input-row"><button type="button" aria-label="切换语音输入" onClick={() => { setModeMenuOpen(false); setVoiceListening(true); }}><i className="mic-icon" /></button><input aria-label="向小宝提问" value={query} onChange={e => setQuery(e.target.value)} placeholder="在这里输入想说的话.."/><button type={query.trim() ? "submit" : "button"} aria-label={query.trim() ? "发送问题" : "展开快捷入口"} aria-expanded={query.trim() ? undefined : quickDrawerOpen} onClick={query.trim() ? undefined : () => { setModeMenuOpen(false); setQuickDrawerOpen(true); }}>{query.trim() ? "↑" : "＋"}</button></div>
                </>}
              </form>
              <BottomNav active="ai" aiMode onNavigate={(next) => { if (next !== "home") setAiUtilityView(next); }} />
              {watchInsight && <WatchInsightModal title={watchInsight} onClose={() => setWatchInsight("")} onAction={flash} />}
              {quickDrawerOpen && <QuickLinksDrawer onClose={() => setQuickDrawerOpen(false)} onOpen={(title) => { setQuickDrawerOpen(false); flash(`打开${title}`); }} />}
            </>
          )}
          <div className="home-bar" />
        </div>
      </section>
      {toast && <button className={`toast ${toastAction ? "actionable" : ""}`} type="button" role="status" onClick={() => { if (toastAction) toastAction(); setToast(""); setToastAction(null); }}>{toast}</button>}
    </main>
  );
}

function QuickLinksDrawer({ onClose, onOpen }: { onClose: () => void; onOpen: (title: string) => void }) {
  return <div className="quick-drawer-layer">
    <button className="quick-drawer-backdrop" type="button" aria-label="关闭快捷入口" onClick={onClose} />
    <section className="quick-drawer" role="dialog" aria-modal="true" aria-label="快捷入口">
      <div className="drawer-handle" aria-hidden="true" />
      <header><h2>我的</h2><button type="button" onClick={() => onOpen("新建会话")}><i aria-hidden="true">＋</i> 新建会话</button></header>
      <div className="quick-drawer-scroll">
        {quickLinkSections.map(section => <section className="quick-section" key={section.title}>
          <h3>{section.title}</h3>
          <div>{section.links.map(link => <button type="button" key={link.title} onClick={() => onOpen(link.title)}>
            <i className={`quick-icon ${link.tone}`} aria-hidden="true">{link.icon}</i><span><b>{link.title}</b><small>{link.description}</small></span>
          </button>)}</div>
        </section>)}
      </div>
    </section>
  </div>;
}

type BannerRecommendation = { id: string; eyebrow: string; title: string; subtitle: string; action: string; tone: string; image: string };

const fallbackBanners: BannerRecommendation[] = [
  { id: "midyear", eyebrow: "2026年度", title: "向新深耕 掘金成长", subtitle: "A股中期投资策略报告会回放", action: "立即查看", tone: "gold", image: "/og-classic.png" },
  { id: "daily", eyebrow: "专属智能投顾", title: "AI日报 每日焕新", subtitle: "自选与持仓重点变化一屏掌握", action: "查看日报", tone: "red", image: "/xiaobao-avatar.png" },
  { id: "strategy", eyebrow: "稳健投资专区", title: "穿越波动 寻找确定性", subtitle: "高股息与优质成长精选策略", action: "查看策略", tone: "green", image: "/og-classic.png" },
];

function DiscoverBanner({ onAction }: { onAction: (message: string) => void }) {
  const [items, setItems] = useState(fallbackBanners);
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/recommendations?placement=discover-banner", { signal: controller.signal })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((payload: { items?: BannerRecommendation[] }) => { if (payload.items?.length) setItems(payload.items); })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setActive(current => (current + 1) % items.length), 4200);
    return () => window.clearInterval(timer);
  }, [items.length]);

  function finishSwipe(event: TouchEvent<HTMLDivElement>) {
    if (touchStart.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(distance) > 36) setActive(current => (current + (distance < 0 ? 1 : items.length - 1)) % items.length);
    touchStart.current = null;
  }

  return <section className="discover-banner" aria-label="个性化推荐">
    <div className="banner-track" style={{ transform: `translateX(-${active * 100}%)` }} onTouchStart={event => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={finishSwipe}>
      {items.map(item => <button type="button" className={`banner-slide ${item.tone}`} key={item.id} onClick={() => onAction(`打开${item.title}`)}>
        <img src={item.image} alt="" aria-hidden="true" />
        <span><small>{item.eyebrow}</small><b>{item.title}</b><em>{item.subtitle}</em><strong>{item.action} 〉</strong></span>
      </button>)}
    </div>
    <div className="banner-dots">{items.map((item, index) => <button type="button" key={item.id} className={index === active ? "active" : ""} aria-label={`查看第${index + 1}张广告`} onClick={() => setActive(index)} />)}</div>
  </section>;
}

function Discover({ reply, question, onAsk, onBannerAction = () => undefined, onOpenSelection = () => undefined }: { reply: string; question?: string; onAsk: (text: string) => void; onBannerAction?: (message: string) => void; onOpenSelection?: () => void }) {
  const isSelectionConversation = Boolean(question && /选股|ROE|自定义条件/.test(question));
  return <div className="discover-screen screen-scroll">
    <DiscoverBanner onAction={onBannerAction} />
    <div className="ip-row"><Mascot /><div><b>Hi,我是AI小宝，随时与您在线交流~</b></div></div>
    <div className="welcome-card">
      <p>今日上证指数温和上涨0.85%，可燃冰板块极端大涨4.77%，显著强于大盘。稳扎稳打～</p>
      <p>👍 当前热点方向明确，我可以帮你梳理核心逻辑。</p>
    </div>
    <div className="prompt-chips"><button onClick={() => onAsk("大盘压力位在哪")}>大盘压力位在哪</button><button onClick={() => onAsk("市场资金动向")}>市场资金动向</button></div>
    {reply && <>{question && <div className="conversation-question">{question}</div>}<div className="assistant-reply"><div><Mascot /><b>{isSelectionConversation ? "AI定制选股" : "小宝解读"}</b><small>AI生成 · 已保留对话上下文</small></div><p>{reply}</p>{isSelectionConversation ? <div className="selection-result-preview"><span><b>12</b>只匹配</span><span><b>ROE &gt; 15%</b>核心条件</span><button type="button" onClick={onOpenSelection}>查看选股结果 〉</button></div> : <button>查看数据来源 ¹</button>}</div></>}
    {!reply && <p className="ai-disclaimer">以上内容由AI生成，不代表投资立场，且无法保证所有生成内容准确 <span>⌄</span></p>}
  </div>;
}

function Watch({ flash, onInsight }: { flash: (text: string) => void; onInsight: (title: string) => void }) {
  return <div className="watch-screen screen-scroll">
    <div className="index-cards">
      <button onClick={() => flash("跳转上证指数行情")}><b>4162.88</b><span>上证 +0.39%</span><MiniLine /></button>
      <button className="green" onClick={() => flash("跳转深成指数行情")}><b>14495.09</b><span>深成 -0.06%</span><MiniLine down /></button>
      <button className="green" onClick={() => flash("跳转创业板行情")}><b>3310.30</b><span>创指 -1.04%</span><MiniLine down /></button>
    </div>
    <button className="breadth" onClick={() => flash("打开涨跌分布分析")}><div><span>涨3271 / 涨停91</span><b>实时总成交额 2.51万亿</b></div><div><span>跌2068 / 跌停1</span><b>近60日平均 2.36万亿　<em>6.29%</em></b></div></button>
    <div className="feed-tabs"><button className="active">全部</button><button>市场观察</button><button>盘面播报</button><button>快讯精选</button><button onClick={() => flash("播放盘面播报")}>▶ 播放</button></div>
    <div className="news-feed">
      <button onClick={() => onInsight("欧佩克+增产协议将如何影响市场？")}><span>●　2026-03-01 18:40　快讯精选　<b>▣ AI解读</b></span><strong>财联社3月1日电，据报道，消息人士称，八个欧佩克+国家已就将石油日产量提高20.6万桶达成原则性协议。</strong><p>据报道，消息人士称，欧佩克+正在讨论将石油日产量上调。</p></button>
      <button onClick={() => onInsight("伊朗相关事件对A股有哪些影响？")}><span>●　2026-03-01 18:38　快讯精选　<b>▣ AI解读</b></span><strong>外交部发言人就伊朗最高领袖哈梅内伊遇害答记者问</strong><p>相关事件持续影响全球风险偏好与能源市场预期。</p></button>
      <button onClick={() => flash("打开盘面播报")}><span>●　2026-03-01 18:20　盘面播报</span><strong>金融与高股息方向贡献靠前，市场成交保持活跃</strong></button>
    </div>
  </div>;
}

function WatchInsightModal({ title, onClose, onAction }: { title: string; onClose: () => void; onAction: (message: string) => void }) {
  return <div className="watch-insight-layer">
    <button className="watch-insight-backdrop" type="button" aria-label="关闭AI资讯解读" onClick={onClose} />
    <article className="watch-insight-modal" role="dialog" aria-modal="true" aria-label="AI资讯解读">
      <header><div><i>◉</i><b>问财AI资讯解读</b><em>AI生成</em></div><button type="button" aria-label="更多操作" onClick={() => onAction("已打开更多操作")}>•••</button><button type="button" aria-label="关闭" onClick={onClose}>×</button></header>
      <div className="insight-scroll">
        <section className="insight-search"><span><i /><i /><i /></span><div><b>补充搜索与总结已完成</b><small>检索4条权威来源 · 交叉验证关键信息</small></div><em>完成</em></section>
        <h2>{title}</h2>
        <section className="insight-conclusion"><h3>结论</h3><p>中东地缘与产量政策变化将重新定价全球风险资产。短期资金可能向能源、黄金及军工等避险方向集中，同时关注原油价格变化对化工、航空运输和通胀预期的传导影响。</p></section>
        <section className="insight-analysis"><h3>解读分析</h3><ol><li><b>事件触发：</b>供应预期与地缘风险同步变化，国际油价波动率可能阶段性上升。</li><li><b>产业链传导：</b>上游油气开采、油服及煤化工方向相对受益；航空、物流等成本敏感行业承压。</li><li><b>A股映射：</b>能源安全、黄金、军工及高股息资产可能获得更多防御型资金关注。</li><li><b>风险提示：</b>消息仍可能反复，需结合后续官方信息、油价和资金流向持续验证。</li></ol></section>
        <section className="insight-sources"><h3>补充搜索来源</h3><button onClick={() => onAction("打开资讯原文")}>财联社快讯 <span>已核验</span></button><button onClick={() => onAction("打开行业数据")}>国际能源市场数据 <span>已核验</span></button><button onClick={() => onAction("打开市场表现")}>A股行业表现与资金流向 <span>已汇总</span></button></section>
      </div>
    </article>
  </div>;
}

function SelectStock({ active, setActive, onAsk, reply, onOpenStock, onToggleStock, onOpenAi, isAdded }: { active: SelectTab; setActive: (t: SelectTab) => void; onAsk: (text: string) => void; reply: string; onOpenStock: (code: string) => void; onToggleStock: (code: string) => void; onOpenAi: () => void; isAdded: (code: string) => boolean }) {
  const stockProps = (code: string) => ({ onOpen: () => onOpenStock(code), onAdd: () => onToggleStock(code), added: isAdded(code) });
  return <div className="select-screen screen-scroll">
    <div className="select-intro"><Mascot /><span>盘中异动监测完毕，为您提炼了核心方向👇</span></div>
    <button className="ai-selection-entry" type="button" onClick={onOpenAi}><span><i>Ai</i><b>AI定制选股</b><small>用自然语言补充行业、财务和技术条件</small></span><em>去定制 〉</em></button>
    <div className="select-card">
      <nav className="select-tabs"><button className={active === "hot" ? "active" : ""} onClick={() => setActive("hot")}>热点题材</button><button className={active === "shape" ? "active" : ""} onClick={() => setActive("shape")}>热门形态</button><button className={active === "strategy" ? "active" : ""} onClick={() => setActive("strategy")}>策略选股</button></nav>
      {active === "hot" && <div className="hot-list"><h3>人工智能 <em>+0.27%</em><small>数据智能</small></h3><p>中共山东省委等印发措施，大力储备“人工智能+”人才...</p><div><Stock name="润泽科技" code="300442" rate="+17.7%" {...stockProps("300442")} /><Stock name="新安洁" code="831370" rate="+14.4%" {...stockProps("831370")} /></div><h3>人形机器人 <em>+0.59%</em><small>智能制造</small></h3><p>小鹏人形机器人量产基地作为重点项目正式提报落地...</p><div><Stock name="德邦科技" code="688035" rate="+14.7%" {...stockProps("688035")} /><Stock name="智微智能" code="001339" rate="+10.0%" {...stockProps("001339")} /></div><button className="explore">查看完整热点题材解读 〉</button></div>}
      {active === "shape" && <div className="shape-panel"><div className="shape-head"><b>热门形态🔥</b><button>查看完整形态选股热榜 〉</button></div><div className="shape-stocks"><Stock name="W底成型 · 长安汽车" code="000625" rate="+12.4%" {...stockProps("000625")} /><Stock name="均线多头 · 科大讯飞" code="002230" rate="+8.7%" {...stockProps("002230")} /></div><b className="strength">强势　<span>弱势　反转　震荡</span></b><div className="shape-tags">{["揭竿而起","老鸭头","均线多头","三线开花","MACD","金山谷","回踩支撑确认","单阳盖阴","一阳穿三线"].map((x,i)=><button className={i===0?"active":""} key={x}>{x}</button>)}</div><button className="select-action" onClick={() => onAsk("帮我选出满足揭竿而起形态的股票有哪些？")}>选出符合条件的个股</button></div>}
      {active === "strategy" && <div className="strategy-list"><article><h3>高盈利 <small>中长线　价值投资</small></h3><p>根据利润相关指标筛选出有很强盈利能力的公司</p><Stock name="赛微电子" code="300456" rate="+140.52%" {...stockProps("300456")} /></article><article><h3>高成长 <small>中长线　价值投资</small></h3><p>根据成长性相关指标筛选出有很强成长能力的公司</p><Stock name="飞沃科技" code="301232" rate="+151.92%" {...stockProps("301232")} /></article><button className="explore">探索所有策略 〉</button></div>}
    </div>
    <div className="prompt-chips select-prompts"><button onClick={() => onAsk("帮我深度解析人工智能板块")}>帮我深度解析人工智能板块</button><button onClick={() => onAsk("当前市场适合什么选股策略？")}>当前市场适合什么选股策略？</button></div>
    {reply && <div className="assistant-reply compact"><b>问财 已经准备好答案了</b><p>{reply}</p></div>}
  </div>;
}

function Stock({ name, code, rate, onOpen, onAdd, added }: { name: string; code: string; rate: string; onOpen: () => void; onAdd: () => void; added: boolean }) {
  return <article className="stock"><button type="button" className="stock-link" onClick={onOpen}><span><b>{name}</b><small>{code}</small></span><em>{rate}</em></button><button type="button" className={`stock-add ${added ? "added" : ""}`} aria-label={added ? `移除${name}自选` : `添加${name}到自选`} onClick={onAdd}><span className="stock-add-icon" aria-hidden="true" /></button></article>;
}

const contextPrompts: Record<ClassicView, string[]> = {
  home: ["今天有哪些市场机会", "帮我梳理持仓"],
  quotes: ["最近的热点板块是什么", "分析今日大盘走势"],
  market: ["最近的热点板块是什么", "分析今日大盘走势"],
  trade: ["打开国债逆回购", "怎么领取分红派息"],
  wealth: ["一折基金都有哪些", "有没有适合长期稳健投资的基金推荐"],
  profile: ["如何开户", "新客专享活动"],
};

function ContextAssistant({ view, question, onQuestion, onClose, onInteract, onEscalate }: { view: ClassicView; question: string; onQuestion: (question: string) => void; onClose: () => void; onInteract: (message: string) => void; onEscalate: (question: string) => void }) {
  const [draft, setDraft] = useState("");
  const submitContextQuestion = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (question) onEscalate(text);
    else { onQuestion(text); setDraft(""); }
  };
  return <div className="context-assistant-layer">
    <button className="context-assistant-backdrop" type="button" aria-label="关闭AI助手" onClick={onClose} />
    {!question && <div className="context-suggestions" aria-label="推荐问题">{contextPrompts[view].map(prompt => <button type="button" key={prompt} onClick={() => onQuestion(prompt)}><i>✦</i>{prompt}</button>)}</div>}
    {question && <article className="context-result" role="dialog" aria-modal="true" aria-label="AI回答">
      <header><h2>{question}</h2><button type="button" aria-label="播放回答" onClick={() => onInteract("正在播放回答")}>◖</button><button type="button" aria-label="展开到AI首页" onClick={() => onEscalate(question)}>↗</button></header>
      <section className="reasoning-status"><b>⚛ 快速推理</b><strong>模型答案生成完成</strong><small>思考1秒</small></section>
      <div className="result-copy"><h3>{question.includes("基金") ? "稳健基金筛选建议" : question.includes("开户") ? "开户办理指引" : question.includes("国债") || question.includes("分红") ? "交易服务办理说明" : "市场分析结果 📈"}</h3><p>{question.includes("基金") ? "结合长期收益、最大回撤与产品规模，建议优先关注均衡配置、波动较低且运作稳定的产品。以下内容仅供参考。" : question.includes("开户") ? "准备本人身份证和银行卡，完成身份验证、风险测评与协议签署后即可提交开户申请。" : question.includes("国债") || question.includes("分红") ? "已为你整理对应业务入口、办理条件和交易时段，可点击卡片继续查看操作说明。" : "根据近期成交、资金流向与板块强度，当前结构性机会主要集中在科技成长、高股息与政策驱动方向。"}</p>
        <div className="result-tags"><button onClick={() => onInteract("已打开详细数据")}>查看详细数据</button><button onClick={() => onInteract("已加入自选跟踪")}>加入跟踪</button></div>
        <div className="result-table"><span>参考标的</span><span>最新</span><span>变化</span><button onClick={() => onInteract("打开中原证券详情")}>中原证券 <small>601375</small></button><b>4.15</b><em>+1.72%</em><button onClick={() => onInteract("打开同花顺详情")}>同花顺 <small>300033</small></button><b>224.91</b><em>+4.34%</em></div>
      </div>
      <footer><button onClick={() => onInteract("正在连接投顾")}>♙ 问投顾</button></footer>
    </article>}
    <form className="context-input" onSubmit={submitContextQuestion}><button type="button" aria-label="语音提问" onClick={() => onInteract("请开始说话")}><i className="mic-icon" /></button><input value={draft} onChange={event => setDraft(event.target.value)} aria-label={question ? "继续向AI提问" : "向AI提问"} placeholder="您可以搜索或提问"/><button type="submit" aria-label="提交问题">＋</button></form>
  </div>;
}

function ClassicChatPage({ reply, question, onAsk, onClose }: { reply: string; question: string; onAsk: (question: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState("");
  return <div className="classic-chat-page">
    <header><button type="button" onClick={onClose} aria-label="返回经典页面">‹</button><b>发现</b><span>小宝</span></header>
    <div className="classic-chat-body"><Discover reply={reply} question={question} onAsk={onAsk} /></div>
    <form onSubmit={(event) => { event.preventDefault(); if (draft.trim()) { onAsk(draft.trim()); setDraft(""); } }}><button type="button" aria-label="语音提问"><i className="mic-icon" /></button><input value={draft} onChange={event => setDraft(event.target.value)} placeholder="向小宝提问" aria-label="向小宝提问"/><button type="submit">＋</button></form>
  </div>;
}

function ClassicScreen({ view, onView, onBack, onAssistant, flash, onSearch, onDailyReport, onOpenStock, onToggleStock, watchlist, aiMode = false }: { view: ClassicView; onView: (view: ClassicView) => void; onBack: () => void; onAssistant: () => void; flash: (s: string) => void; onSearch: () => void; onDailyReport: () => void; onOpenStock: (code: string) => void; onToggleStock: (code: string) => void; watchlist: string[]; aiMode?: boolean }) {
  return <div className={`classic-screen classic-${view} ${aiMode ? "ai-utility-screen" : ""}`}>
    <div className="classic-scroll">
      {view === "home" && <ClassicHome flash={flash} onSwitchAi={onBack} onAssistant={onAssistant} onSearch={onSearch} />}
      {view === "quotes" && <ClassicQuotes market={false} onView={onView} onAssistant={onAssistant} aiMode={aiMode} flash={flash} onDailyReport={onDailyReport} onOpenStock={onOpenStock} onToggleStock={onToggleStock} watchlist={watchlist} />}
      {view === "market" && <ClassicQuotes market onView={onView} onAssistant={onAssistant} aiMode={aiMode} flash={flash} onDailyReport={onDailyReport} onOpenStock={onOpenStock} onToggleStock={onToggleStock} watchlist={watchlist} />}
      {view === "trade" && <ClassicTrade onAssistant={onAssistant} aiMode={aiMode} flash={flash} />}
      {view === "wealth" && <ClassicWealth onAssistant={onAssistant} aiMode={aiMode} flash={flash} />}
      {view === "profile" && <ClassicProfile onAssistant={onAssistant} aiMode={aiMode} flash={flash} />}
    </div>
    <BottomNav active={view} aiMode={aiMode} onNavigate={onView} />
  </div>;
}

function HeaderAssistantButton({ aiMode, onClick }: { aiMode: boolean; onClick: () => void }) {
  return <button className={`header-assistant ${aiMode ? "ai" : "mascot"}`} type="button" aria-label={aiMode ? "打开AI助手" : "打开小宝对话"} onClick={onClick}>{aiMode ? <b>Ai</b> : <img src="/xiaobao-avatar.png" alt="" />}</button>;
}

function ClassicHome({ flash, onSwitchAi, onAssistant, onSearch }: { flash: (s: string) => void; onSwitchAi: () => void; onAssistant: () => void; onSearch: () => void }) {
  const apps = [["▣","开户"],["▤","业务办理"],["♟","投顾社区"],["T0","T0算法交易"],["⇩","新股申购"],["▥","选股宝"],["基","买基金"],["ETF","ETF专区"],["▤","资讯"],["▦","全部应用"]];
  return <div className="classic-home-page">
    <header className="classic-home-head">
      <button className="ai-mode-switch" onClick={onSwitchAi} aria-label="切换到AI版本"><i>⇆</i><b>AI版</b></button>
      <button className="classic-search" onClick={onSearch}><span>股票/基金/资讯/功能/问答</span><i aria-hidden="true" /></button>
      <button className="robot-entry" onClick={onAssistant} aria-label="打开小宝发现页"><img src="/xiaobao-avatar.png" alt="" /></button>
      <button className="message-btn" onClick={() => flash("打开消息中心")} aria-label="打开消息中心"><span /><span /><span /><i>50</i></button>
    </header>
    <section className="classic-apps">{apps.map(([icon,label],i)=><button key={label} onClick={() => flash(`打开${label}`)}><i className={`app-dot tone-${i%4}`}>{icon}</i><span>{label}</span>{(i===2||i===6)&&<em>热门</em>}</button>)}</section>
    <button className="notice-row" onClick={() => flash("查看全部公告")}><b>公告</b><span>公告</span><em>更多 〉</em></button>
    <button className="classic-banner" onClick={() => flash("立即解锁Level-2行情")}><span>Level-2行情</span><b>解码盘口信息<br/>把握决策先机</b><em>立即解锁</em><i>▥</i></button>
    <nav className="content-tabs"><button className="active">发现</button><button>快讯</button><button>直播</button><button>自选</button><button>课程</button></nav>
    <div className="flash-news"><b>快讯</b><p><span>20:26</span> 可孚医疗：控股股东拟增持公司股份...</p></div>
    <section className="theme-card"><h3>风口掘金 <small>洞悉风口提前布局</small><em>更多 〉</em></h3><div><b>足球概念 <span>-2.81%</span></b><small>人气星级：<em>3.0</em>　排名：1/10</small><i className="theme-line" /></div></section>
  </div>;
}

function ClassicQuotes({ market, onView, onAssistant, aiMode, flash, onDailyReport, onOpenStock, onToggleStock, watchlist }: { market: boolean; onView: (view: ClassicView) => void; onAssistant: () => void; aiMode: boolean; flash: (s: string) => void; onDailyReport: () => void; onOpenStock: (code: string) => void; onToggleStock: (code: string) => void; watchlist: string[] }) {
  const [editing, setEditing] = useState(false);
  if (market) return <ClassicMarket onView={onView} onAssistant={onAssistant} aiMode={aiMode} flash={flash} />;
  const rows = watchlist.map(code => stockCatalog[code]).filter(Boolean);
  return <div className="quotes-page">
    <header className="classic-red-head quotes-head"><button onClick={() => flash("打开侧边菜单")}>☰</button><nav><button className="active">自选</button><button onClick={() => onView("market")}>行情</button></nav><HeaderAssistantButton aiMode={aiMode} onClick={onAssistant} /><button onClick={() => flash("搜索行情")}>⌕</button></header>
    <div className="quote-index"><div className="up"><span>上证指数</span><b>3796.<small>28</small></b><em>32.13　0.85%</em></div><div><span>深证成指</span><b>13610.<small>23</small></b><em>-96.65　-0.71%</em></div><div><span>北证50</span><b>1045.<small>20</small></b><em>-31.18　-2.90%</em></div><button>⌄</button><button>¥<small>资金</small></button><button className="daily-report-entry" onClick={onDailyReport}><b>Ai</b><small>AI日报</small></button></div>
    <div className={`classic-table quote-table ${editing ? "editing" : ""}`}><div className="table-head"><button type="button" onClick={() => setEditing(value => !value)}>{editing ? "完成" : "编辑 ✎"}</button><span>最新</span><span>涨幅</span><span>涨跌</span></div>{rows.length ? rows.map(stock=><div className="quote-row" key={stock.code}><button className="quote-stock-row" type="button" onClick={() => onOpenStock(stock.code)}><b>{stock.name}<small><i>融</i> {stock.code}</small></b><span className={stock.change.startsWith("+")?"red":"green"}>{stock.price}</span><span className={stock.change.startsWith("+")?"red":"green"}>{stock.change}</span><span className={stock.change.startsWith("+")?"red":"green"}>{stock.delta}</span></button>{editing && <button className="quote-remove" type="button" aria-label={`移除${stock.name}自选`} onClick={() => onToggleStock(stock.code)}>−</button>}</div>) : <div className="watchlist-empty"><b>暂无自选股</b><span>可在选股、搜索或个股行情页添加</span></div>}</div>
  </div>;
}

function ClassicMarket({ onView, onAssistant, aiMode, flash }: { onView: (view: ClassicView) => void; onAssistant: () => void; aiMode: boolean; flash: (s: string) => void }) {
  const bars=[32,52,43,65,88,8,80,45,27,20,10];
  return <div className="market-page">
    <header className="classic-red-head market-head"><button>看资金</button><nav><button onClick={()=>onView("quotes")}>自选</button><button className="active">行情</button></nav><HeaderAssistantButton aiMode={aiMode} onClick={onAssistant} /><button onClick={()=>flash("搜索行情")}>⌕</button><div className="market-scope"><button>全球</button><button className="active">A股</button><button>港股</button><button>其他</button></div></header>
    <nav className="market-tabs"><button className="active">沪深京</button><button>板块</button><button>科创板</button></nav>
    <section className="market-summary"><h2><i>▣</i> 已收盘 <b>〉</b></h2><p>2026-07-20 星期一</p><div className="market-cards"><article className="up"><span>上证指数</span><b>3796.28</b><em>+32.13 +0.85%</em></article><article><span>深证成指</span><b>13610.23</b><em>-96.65 -0.71%</em></article><article><span>北证50</span><b>1045.20</b><em>-31.18 -2.90%</em></article></div><div className="breadth-bars">{bars.map((h,i)=><i key={i} className={i>5?"up":""} style={{height:`${h}px`}}><b>{[329,645,532,835,1369,74,1176,292,131,99,42][i]}</b></i>)}</div><div className="market-ratio"><span>跌 3710</span><span>涨 1740 〉</span></div><p className="turnover"><span>今日成交额总计27181亿</span><span>较上一日<b>增量+465亿</b></span></p></section>
    <section className="market-tools">{[["新","打新日历"],["▥","选股宝"],["▧","涨停聚焦"],["☷","条件单"],["ETF","ETF专区"]].map(x=><button key={x[1]} onClick={()=>flash(`打开${x[1]}`)}><i>{x[0]}</i><span>{x[1]}</span></button>)}</section>
    <section className="market-stats"><article><b>涨跌停对比</b><span><em>54</em> : <i>238</i></span></article><article><b>昨日涨停表现</b><span><em>0.43%</em></span></article><article><b>大小盘对比</b><span><em>1.5%</em> : <i>-2.8%</i></span></article></section>
  </div>;
}

function ClassicTrade({ onAssistant, aiMode, flash }: { onAssistant: () => void; aiMode: boolean; flash: (s: string) => void }) {
  const tiles=[["买","买入"],["卖","卖出"],["撤","撤单"],["查","查询"],["持","我的持仓"],["成","当日成交"],["委","当日委托"],["转","银证转账"]];
  return <div className="trade-page"><header className="classic-red-head trade-head"><nav><button className="active">普通交易</button><button>融资融券</button><button>股票期权</button></nav><HeaderAssistantButton aiMode={aiMode} onClick={onAssistant} /><button onClick={()=>flash("刷新交易数据")}>↻</button></header><section className="login-card"><p>请登录后查看资产详情</p><button onClick={()=>flash("打开交易登录")}>交易登录</button></section><section className="trade-grid">{tiles.map(x=><button key={x[1]} onClick={()=>flash(`打开${x[1]}`)}><b>{x[0]}</b><span>{x[1]}</span></button>)}</section><button className="new-stock-row"><b>一键打新</b><span>今日有<em>2</em>只新股,<em>1</em>只新债　〉</span></button><section className="classic-list">{[["银证转账",""],["条件单","预设条件，触发委托"],["债券通用质押式回购",""],["基金交易",""],["港股通",""],["T0交易",""]].map(x=><button key={x[0]} onClick={()=>flash(`打开${x[0]}`)}><span>{x[0]}</span><em>{x[1]} 〉</em></button>)}</section></div>;
}

function ClassicWealth({ onAssistant, aiMode, flash }: { onAssistant: () => void; aiMode: boolean; flash: (s: string) => void }) {
  const tools=["收益凭证","公募基金","高端理财","中原汇利现金宝","买基金","中原优选","定投专区","理财日历","个人中心"];
  return <div className="wealth-page"><header className="classic-red-head wealth-head"><nav><button className="active">理财</button><button>自选</button></nav><HeaderAssistantButton aiMode={aiMode} onClick={onAssistant} /><button onClick={()=>flash("搜索理财产品")}>⌕</button></header><section className="wealth-assets"><div><span>总资产（元）</span><b>登录后查看</b></div><div><span>日收益(元)</span><b>******</b></div><button>▥<span>我的持仓</span></button></section><section className="wealth-tools">{tools.map((x,i)=><button key={x} onClick={()=>flash(`打开${x}`)}><i>{["%","↗","♔","▰","买","✧","∟","▦","♙"][i]}</i><span>{x}</span></button>)}</section><section className="preferred"><nav><button className="active">中原优选</button><button>中原资管</button></nav><div>{[["交银核心前收...","+6.64%"],["易方达沪深3...","+0.65%"],["博时信用债纯...","+15.58%"]].map(x=><article key={x[0]}><b>{x[0]}</b><strong>{x[1]}</strong><span>近五年收益率</span><button>立即查看</button></article>)}</div></section><section className="wealth-rank"><article><h3>🔥 大家都在看</h3><p>华商均衡成长混合型... <em>+212.77%</em></p><p>易方达战略新兴产业... <em>+180.39%</em></p><p>华夏全球科技先锋混... <em>+56.36%</em></p></article><article><h3>🟠 人气定投</h3><p>华夏科创50ETF联接A <em>+18.85%</em></p><p>华夏沪深300指数增... <em>+2.55%</em></p><p>易方达创业板ETF联... <em>+6.06%</em></p></article></section></div>;
}

function ClassicProfile({ onAssistant, aiMode, flash }: { onAssistant: () => void; aiMode: boolean; flash: (s: string) => void }) {
  return <div className="profile-page"><header className="profile-hero"><div className="profile-actions"><HeaderAssistantButton aiMode={aiMode} onClick={onAssistant} /><button onClick={()=>flash("打开设置")}>⚙</button></div><div className="user-row"><span className="user-avatar">♟</span><b>150****2177</b><button>▣ 签到</button></div><section className="profile-assets"><h2>资产总览 <small>尚未开户，<em>立即开户 〉</em></small></h2><p>请登录后查看资产详情</p><button onClick={()=>flash("打开交易登录")}>交易登录</button></section></header><section className="profile-tools">{[["▤","账户分析"],["▢","积分商城"],["🎁","活动专区"],["▥","业务办理"]].map(x=><button key={x[1]} onClick={()=>flash(`打开${x[1]}`)}><i>{x[0]}</i><span>{x[1]}</span></button>)}</section><button className="profile-banner" onClick={()=>flash("参加天天猜涨跌")}><b>天天猜涨跌</b><span>立即参与</span><i>↗</i></button><section className="classic-list profile-list">{[["☀","天天大赚盘"],["♢","新发基金"],["L2","Level-2"],["VIP","付费工具"]].map(x=><button key={x[1]}><i>{x[0]}</i><span>{x[1]}</span><em>〉</em></button>)}</section></div>;
}

function PageHeader({ title, onBack, action }: { title: string; onBack: () => void; action?: React.ReactNode }) {
  return <header className="standalone-header"><button type="button" onClick={onBack} aria-label="返回">‹</button><b>{title}</b><span>{action}</span></header>;
}

function DailyReportPage({ watchlistCount, onBack }: { watchlistCount: number; onBack: () => void }) {
  return <div className="standalone-page daily-report-page">
    <PageHeader title="AI日报" onBack={onBack} action={<small>7月24日</small>} />
    <div className="standalone-scroll">
      <section className="report-summary"><span>今日已更新</span><h2>你的专属投资日报</h2><p>聚合自选与持仓变化，盘前快速掌握值得关注的信息。</p></section>
      <section className="report-module"><header><i>自</i><div><h3>自选分析日报</h3><p>{watchlistCount}只自选股 · 2条重要变化</p></div><button>查看 〉</button></header><div className="report-placeholder"><b>重点异动与公告摘要</b><span /><span /><span className="short" /></div></section>
      <section className="report-module"><header><i>持</i><div><h3>持仓分析日报</h3><p>登录后生成专属持仓洞察</p></div><button>查看 〉</button></header><div className="report-placeholder"><b>收益归因与风险提示</b><span /><span /><span className="short" /></div></section>
      <p className="report-note">内容为原型占位，正式版本将根据交易日数据生成。</p>
    </div>
  </div>;
}

type SearchAiPhase = "idle" | "thinking" | "streaming" | "done";

const searchableFeatures = [
  { id: "condition-order" as const, label: "条件单", description: "预设条件，触发委托", icon: "条", keywords: ["条件", "条件单", "自动交易"] },
  { id: "bank-transfer" as const, label: "银证转账", description: "证券账户与银行卡转账", icon: "转", keywords: ["转账", "银证", "资金划转"] },
  { id: "open-account" as const, label: "开户", description: "在线开立证券账户", icon: "户", keywords: ["开户", "开账户"] },
  { id: "reverse-repo" as const, label: "国债逆回购", description: "闲置资金短期理财", icon: "债", keywords: ["国债", "逆回购"] },
];

const streamedAnnouncementAnswer = "贵州茅台近期披露的信息主要集中在经营数据、现金分红安排与股东大会决议。综合公告内容来看，公司主营业务保持稳健，目前未发现改变核心经营逻辑的重大风险事项。";

function GlobalSearchPage({ onBack, onOpenFunction, onContinue, onOpenStock, onToggleStock, onOpenArticle, isAdded }: { onBack: () => void; onOpenFunction: (id: FunctionPageId) => void; onContinue: (question: string) => void; onOpenStock: (code: string) => void; onToggleStock: (code: string) => void; onOpenArticle: (id: string) => void; isAdded: (code: string) => boolean }) {
  const [draft, setDraft] = useState("");
  const [aiPhase, setAiPhase] = useState<SearchAiPhase>("idle");
  const [streamedText, setStreamedText] = useState("");
  const normalized = draft.trim();
  const stockMatched = /茅台|贵州|600519/i.test(normalized);
  const suggestedQuestion = stockMatched ? "贵州茅台最近有什么重要公告？" : normalized;
  const featureMatches = normalized ? searchableFeatures.filter(feature => feature.keywords.some(keyword => normalized.includes(keyword) || keyword.includes(normalized.replace(/^打开/, "")))) : [];

  useEffect(() => {
    if (aiPhase !== "thinking") return;
    const timer = window.setTimeout(() => setAiPhase("streaming"), 2000);
    return () => window.clearTimeout(timer);
  }, [aiPhase]);

  useEffect(() => {
    if (aiPhase !== "streaming") return;
    const timer = window.setInterval(() => {
      setStreamedText(current => {
        const next = streamedAnnouncementAnswer.slice(0, current.length + 2);
        if (next.length >= streamedAnnouncementAnswer.length) setAiPhase("done");
        return next;
      });
    }, 34);
    return () => window.clearInterval(timer);
  }, [aiPhase]);

  function updateDraft(text: string) {
    setDraft(text);
    setAiPhase("idle");
    setStreamedText("");
  }

  function askAi() {
    if (!normalized) return;
    setStreamedText("");
    setAiPhase("thinking");
  }

  return <div className="standalone-page search-page">
    <form className="global-search" onSubmit={event => { event.preventDefault(); askAi(); }}><i aria-hidden="true" /><input autoFocus value={draft} onChange={event => updateDraft(event.target.value)} placeholder="股票/基金/资讯/功能/问答" aria-label="全局搜索输入"/><button type="button" onClick={onBack}>关闭</button></form>
    <nav className="search-tabs"><button className="active">综合</button><button>股票</button><button>基金</button><button>资讯</button><button>智能问答</button></nav>
    <div className="search-scroll">
      {!normalized && <section className="search-empty"><b>搜索历史</b><span>输入股票、资讯或功能名称，结果将实时匹配</span></section>}

      {featureMatches.length > 0 && <section className="native-search-section feature-results"><header><h2>功能</h2><span>AI已识别功能意图</span></header>{featureMatches.map(feature => <article key={feature.label}><i>{feature.icon}</i><div><b>{feature.label}</b><span>{feature.description}</span></div><button type="button" onClick={() => onOpenFunction(feature.id)}>打开</button></article>)}</section>}

      {stockMatched && <section className="native-search-section search-stock-section"><header><h2>股票</h2><button>查看全部 〉</button></header><article><button className="search-stock-link" type="button" onClick={() => onOpenStock("600519")}><span className="market-badge">沪A</span><small>600519</small><b>贵州<span>茅台</span></b><em>GZMT</em></button><button type="button" className={`search-stock-add ${isAdded("600519") ? "added" : ""}`} aria-label={isAdded("600519") ? "移除贵州茅台自选" : "添加贵州茅台到自选"} onClick={() => onToggleStock("600519")}><span className="stock-add-icon" aria-hidden="true" /></button></article></section>}

      {normalized && featureMatches.length === 0 && aiPhase === "idle" && <section className="ai-search-prompt"><header><img src="/xiaobao-avatar.png" alt=""/><div><b>问财AI助手</b><span>你的专属智能投资顾问</span></div></header><div><p>猜你想问“<b>{suggestedQuestion}</b>”</p><button type="button" onClick={askAi}>提问</button></div></section>}

      {normalized && featureMatches.length === 0 && aiPhase !== "idle" && <section className={`search-answer ${aiPhase}`} aria-live="polite"><header><img src="/xiaobao-avatar.png" alt=""/><div><b>问财AI助手</b><span>基于公开公告整理</span></div></header>{aiPhase === "thinking" ? <div className="ai-thinking-state"><span><i/><i/><i/></span><div><b>正在检索并梳理重要公告</b><small>公告 · 财报 · 公司动态</small></div></div> : <><div className="answer-thinking"><i>Ai</i><span><b>{aiPhase === "done" ? "已完成信息检索与归纳" : "正在生成回答"}</b><small>公告 · 财报 · 公司动态</small></span></div><h2>贵州茅台近期重要公告</h2><div className="answer-highlight"><b>核心结论</b><p>{streamedText}<i className={aiPhase === "streaming" ? "stream-cursor" : ""} /></p></div>{aiPhase === "done" && <><ol><li><b>经营数据：</b>公司披露阶段性经营情况，主营业务保持稳健。</li><li><b>利润分配：</b>现金分红相关安排持续推进，关注后续实施公告。</li><li><b>治理动态：</b>股东大会审议事项已披露，未见重大异常变更。</li></ol><p className="answer-risk">以上由AI根据原型示例数据整理，不构成投资建议。</p><button className="continue-question" type="button" onClick={() => onContinue(suggestedQuestion)}>继续追问</button></>}</>}</section>}

      {stockMatched && <section className="native-search-section search-news-section"><header><h2>资讯</h2><button>查看全部 〉</button></header>{articleCatalog.map(article => <button type="button" className="news-result" key={article.id} onClick={() => onOpenArticle(article.id)}><b>{article.title}</b><span>{article.time}　{article.kind} · {article.source}</span></button>)}</section>}
    </div>
  </div>;
}

function ConditionOrderPage({ onBack, flash }: { onBack: () => void; flash: (message: string) => void }) {
  return <div className="standalone-page condition-page">
    <PageHeader title="条件单" onBack={onBack} action={<button onClick={() => flash("打开条件单帮助")}>帮助</button>} />
    <nav className="condition-tabs"><button className="active">我的条件单</button><button>智能策略</button></nav>
    <div className="standalone-scroll"><section className="condition-asset"><span>可用资金（元）</span><b>******</b><button onClick={() => flash("打开交易登录")}>交易登录</button></section><h3 className="condition-title">常用条件单</h3><div className="condition-grid">{[["价","价格条件","达到目标价自动提醒"],["涨","涨跌幅条件","按涨跌幅触发委托"],["回","回落卖出","锁定收益控制回撤"],["定","定时买卖","指定时间执行策略"]].map(item => <button key={item[1]} onClick={() => flash(`创建${item[1]}`)}><i>{item[0]}</i><b>{item[1]}</b><span>{item[2]}</span></button>)}</div><button className="create-condition" onClick={() => flash("开始创建条件单")}>＋ 创建条件单</button></div>
  </div>;
}

function NativeFunctionPage({ id, onBack, flash }: { id: FunctionPageId; onBack: () => void; flash: (message: string) => void }) {
  if (id === "bank-transfer") return <div className="standalone-page native-function-page">
    <PageHeader title="银证转账" onBack={onBack} action={<button onClick={() => flash("打开转账记录")}>记录</button>} />
    <div className="standalone-scroll function-scroll">
      <section className="function-hero"><i>转</i><div><span>证券账户可用资金</span><b>******</b></div><button onClick={() => flash("打开交易登录")}>登录查看</button></section>
      <div className="function-segment"><button className="active">银行转证券</button><button>证券转银行</button></div>
      <section className="function-form"><label><span>银行账户</span><b>中原银行　尾号 2177</b></label><label><span>转账金额</span><input placeholder="请输入金额" inputMode="decimal" /></label><label><span>资金密码</span><input placeholder="请输入资金密码" type="password" /></label></section>
      <button className="function-primary" onClick={() => flash("原型演示：已提交转账校验")}>确认转入</button>
    </div>
  </div>;

  if (id === "open-account") return <div className="standalone-page native-function-page">
    <PageHeader title="在线开户" onBack={onBack} action={<button onClick={() => flash("联系在线客服")}>客服</button>} />
    <div className="standalone-scroll function-scroll">
      <section className="account-welcome"><i>户</i><span>中原证券</span><h2>三步完成线上开户</h2><p>准备身份证和银行卡，全程约需 5 分钟</p></section>
      <ol className="account-steps"><li><i>1</i><div><b>身份认证</b><span>上传身份证并完成人脸识别</span></div><em>待完成</em></li><li><i>2</i><div><b>资料填写</b><span>完善个人资料与风险测评</span></div><em>未开始</em></li><li><i>3</i><div><b>账户开通</b><span>绑定银行卡并签署协议</span></div><em>未开始</em></li></ol>
      <button className="function-primary" onClick={() => flash("开始身份认证")}>立即开户</button>
    </div>
  </div>;

  return <div className="standalone-page native-function-page repo-page">
    <PageHeader title="国债逆回购" onBack={onBack} action={<button onClick={() => flash("打开逆回购说明")}>规则</button>} />
    <div className="standalone-scroll function-scroll">
      <section className="repo-summary"><span>可用资金（元）</span><b>******</b><small>闲置资金短期理财，当日计息</small></section>
      <nav className="repo-tabs"><button className="active">沪市</button><button>深市</button></nav>
      <div className="repo-products">{[["1天期","GC001","2.185%"],["2天期","GC002","2.205%"],["7天期","GC007","2.320%"],["14天期","GC014","2.410%"]].map(item => <button key={item[1]} onClick={() => flash(`选择${item[0]}逆回购`)}><span>{item[0]}<small>{item[1]}</small></span><b>{item[2]}</b><em>参考年化</em></button>)}</div>
      <button className="function-primary" onClick={() => flash("打开交易登录")}>登录后交易</button>
    </div>
  </div>;
}

function ArticleDetailPage({ article, onBack, onContinue }: { article: ArticleInfo; onBack: () => void; onContinue: (question: string) => void }) {
  const [insightOpen, setInsightOpen] = useState(false);
  const [insightPhase, setInsightPhase] = useState<"idle" | "thinking" | "streaming" | "done">("idle");
  const [streamedInsight, setStreamedInsight] = useState("");

  useEffect(() => {
    if (!insightOpen || insightPhase !== "thinking") return;
    const thinkingTimer = window.setTimeout(() => setInsightPhase("streaming"), 900);
    return () => window.clearTimeout(thinkingTimer);
  }, [insightOpen, insightPhase]);

  useEffect(() => {
    if (!insightOpen || insightPhase !== "streaming") return;
    let index = 0;
    const streamTimer = window.setInterval(() => {
      index += 1;
      setStreamedInsight(article.conclusion.slice(0, index));
      if (index >= article.conclusion.length) {
        window.clearInterval(streamTimer);
        setInsightPhase("done");
      }
    }, 28);
    return () => window.clearInterval(streamTimer);
  }, [article.conclusion, insightOpen, insightPhase]);

  function toggleInsight() {
    const nextOpen = !insightOpen;
    setInsightOpen(nextOpen);
    if (nextOpen && insightPhase === "idle") {
      setStreamedInsight("");
      setInsightPhase("thinking");
    } else if (!nextOpen && insightPhase !== "done") {
      setStreamedInsight("");
      setInsightPhase("idle");
    }
  }

  return <div className="standalone-page article-detail-page">
    <header className="article-head"><button type="button" onClick={onBack} aria-label="返回">‹</button><b>{article.kind}详情</b><span /></header>
    <div className="standalone-scroll article-scroll">
      <span className="article-kind">{article.kind}</span>
      <h1>{article.title}</h1>
      <p className="article-meta">{article.source} · {article.time}</p>
      <section className={`article-ai-insight ${insightOpen ? "open" : ""}`}>
        <button className="article-ai-trigger" type="button" aria-expanded={insightOpen} onClick={toggleInsight}>
          <img src="/xiaobao-avatar.png" alt="" />
          <span><b>AI解读</b><small>摘要、关键数据与核心观点</small></span>
          <i>{insightOpen ? "⌃" : "⌄"}</i>
        </button>
        {insightOpen && <div className="article-ai-result" aria-live="polite">
          {insightPhase === "thinking" ? <div className="article-ai-thinking"><span><i /><i /><i /></span><b>正在阅读并总结原文</b></div> : <>
            <h2>核心观点</h2>
            <p>{streamedInsight}<i className={insightPhase === "streaming" ? "stream-cursor" : ""} /></p>
            {insightPhase === "done" && <><h2>关键要点</h2><ol>{article.points.map(point => <li key={point}>{point}</li>)}</ol><button className="article-continue" type="button" onClick={() => onContinue(`继续解读：${article.title}`)}>继续追问</button></>}
          </>}
        </div>}
      </section>
      <p className="article-lead">{article.lead}</p>
      <p>从盘面和公开信息看，相关变化正在通过行业景气、资金偏好和企业盈利预期向市场传导。投资者仍需结合后续公告、行业数据及价格变化持续验证。</p>
    </div>
  </div>;
}

type StockDetailTab = "看点" | "资讯" | "盘口" | "简况(F10)" | "诊股" | "财务";

function StockDetailPage({ stock, added, onBack, onToggle, onOpenArticle, flash }: { stock: StockInfo; added: boolean; onBack: () => void; onToggle: () => void; onOpenArticle: (id: string) => void; flash: (message: string) => void }) {
  const down = stock.change.startsWith("-");
  const prices = ["65.16", "65.14", "65.13", "65.12", "65.11", "65.10", "65.09", "65.08", "65.07", "65.06"];
  const [activeTab, setActiveTab] = useState<StockDetailTab>("看点");
  const tabs: StockDetailTab[] = ["看点", "资讯", "盘口", "简况(F10)", "诊股", "财务"];
  return <div className="standalone-page stock-detail-page">
    <header className="stock-detail-head"><button onClick={onBack} aria-label="返回">‹</button><div><b>{stock.name}</b><span>{stock.price}　{stock.change}</span></div><button onClick={() => flash("打开个股搜索")} aria-label="搜索">⌕</button></header>
    <nav className="stock-main-tabs">{tabs.map(tab => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
    <div className="stock-detail-scroll">
      {activeTab === "看点" && <StockHighlights stock={stock} />}
      {activeTab === "资讯" && <section className="stock-news-list"><header><b>AI精选资讯</b><span>公告 · 研报 · 新闻</span></header>{articleCatalog.map(article => <button key={article.id} onClick={() => onOpenArticle(article.id)}><em>{article.kind}</em><div><b>{article.title}</b><span>{article.source} · {article.time}</span></div><i>〉</i></button>)}</section>}
      {activeTab === "盘口" && <><section className={`stock-overview ${down ? "down" : ""}`}><div><strong>{stock.price}</strong><span>{stock.delta}　{stock.change}</span></div><dl><div><dt>高</dt><dd>66.83</dd><dt>低</dt><dd>64.86</dd><dt>开</dt><dd>65.92</dd></div><div><dt>市值</dt><dd>1068.48亿</dd><dt>市盈</dt><dd>20.65</dd><dt>量比</dt><dd>0.76</dd></div></dl></section><nav className="stock-periods"><button className="active">分时</button><button>日K</button><button>周K</button><button>月K</button><button>五日</button><button>更多</button></nav><section className="market-chart"><div className="chart-main"><p><span>均价: 65.94</span>　最新: {stock.price}　{stock.change}</p><svg viewBox="0 0 260 270" preserveAspectRatio="none" aria-label="分时价格走势"><path className="grid" d="M0 45H260M0 135H260M0 225H260M65 0V270M130 0V270M195 0V270"/><path className="average" d="M0 215 C35 155 70 160 105 170 S175 150 260 175"/><path className="price" d="M0 235 L8 190 14 205 20 165 27 182 35 145 43 175 52 130 61 166 70 138 78 190 86 154 95 171 104 112 112 158 122 142 132 184 143 169 152 205 162 187 174 221 186 208 198 236 210 223 221 239 232 218 244 246 260 258"/></svg><small>09:30　　　　　　　　　11:30　　　　　　　　15:00</small></div><div className="order-book">{prices.map((price,index) => <p key={`${price}-${index}`}><span>{index < 5 ? `卖${5-index}` : `买${index-4}`}</span><b>{price}</b><i>{[44,10,64,32,59,34,50,19,31,50][index]}</i></p>)}</div></section></>}
      {activeTab === "简况(F10)" && <StockInfoPanel title="公司简况" items={[["所属行业","软件和信息技术服务"],["总市值","1068.48亿元"],["主营业务","数据中心、云计算与数字化服务"],["上市日期","2022-04-21"]]} />}
      {activeTab === "诊股" && <StockInfoPanel title="AI诊股评分" items={[["综合评分","78分 · 优于行业72%公司"],["趋势强度","中性偏强"],["资金状态","近5日主力净流入"],["风险等级","中等"]]} />}
      {activeTab === "财务" && <StockInfoPanel title="核心财务指标" items={[["营业收入","44.62亿元 · +17.42%"],["归母净利润","5.67亿元 · +5.43%"],["净资产收益率","16.82%"],["经营现金流","8.31亿元"]]} />}
    </div>
    <footer className="stock-actions"><button onClick={() => flash("打开下单")}>⌄<span>下单</span></button><button onClick={() => setActiveTab("诊股")}>＋<span>诊股</span></button><button className={added ? "added" : ""} onClick={onToggle}>{added ? "✓" : "＋"}<span>{added ? "移除自选" : "加自选"}</span></button><button onClick={() => flash("打开更多行情")}>•••<span>更多</span></button></footer>
  </div>;
}

function StockHighlights({ stock }: { stock: StockInfo }) {
  const highlights = [
    { title: "行业景气延续，核心业务具备增长韧性", impact: 5, text: `${stock.name}所属方向近期政策与产业催化密集，公司核心业务与行业需求深度绑定，订单和收入弹性值得关注。` },
    { title: "业绩稳健增长，盈利质量持续改善", impact: 4, text: "最新披露期营业收入和净利润保持增长，经营现金流同步改善，基本面对股价形成支撑。" },
    { title: "主力资金出现阶段性净流入", impact: 5, text: "近5个交易日主动买盘增强，成交活跃度高于近20日均值，但短线波动可能随之放大。" },
    { title: "技术形态处于关键位置", impact: 3, text: "股价正在测试前期成交密集区，若量能延续，可继续观察突破有效性。" },
  ];
  return <div className="stock-highlights">
    <nav><button className="active">个股看点</button><button>AI策略</button></nav>
    <div className="highlight-summary"><img src="/xiaobao-avatar.png" alt=""/><b>今日{stock.name}，包含<span>3</span>个风险，<em>4</em>个亮点</b></div>
    <section className="market-impression"><h2>市场印象</h2><p>{stock.name}是所在行业的核心公司，业务具备较强竞争壁垒。当前市场关注点集中在行业景气、盈利兑现和资金承接，短期弹性与波动并存。</p></section>
    {highlights.map(item => <article className="highlight-card" key={item.title}><h3><span>亮点</span>{item.title}<i>⌃</i></h3><div className="impact-stars"><small>影响度</small><b>{"★★★★★".slice(0,item.impact)}<em>{"★★★★★".slice(item.impact)}</em></b></div><p>{item.text}</p></article>)}
    <article className="highlight-card risk"><h3><span>风险</span>短线涨幅较大，注意波动风险<i>⌃</i></h3><div className="impact-stars"><small>影响度</small><b>★★★★<em>★</em></b></div><p>当前估值与交易拥挤度均有所提升，若行业催化不及预期，股价可能出现较大回撤。</p></article>
  </div>;
}

function StockInfoPanel({ title, items }: { title: string; items: string[][] }) {
  return <section className="stock-info-panel"><header><b>{title}</b><span>AI整理</span></header>{items.map(item => <div key={item[0]}><span>{item[0]}</span><b>{item[1]}</b></div>)}</section>;
}

function BottomNav({ active, onNavigate, aiMode = false }: { active: "ai" | ClassicView; onNavigate: (view: ClassicView) => void; aiMode?: boolean }) {
  const quoteActive=active==="quotes"||active==="market";
  const showAiHome = aiMode || active === "ai";
  return <nav className={`bottom-nav ${!showAiHome?"classic-bottom-nav":""}`} aria-label="底部主导航">
    <button className={active==="ai"||active==="home"?"active":""} aria-current={active==="ai"||active==="home"?"page":undefined} onClick={()=>active!=="ai"&&onNavigate("home")}><i className={`nav-icon ${showAiHome?"nav-ai":"nav-home"}`} aria-hidden="true">{showAiHome?"Ai":""}</i><span>{showAiHome?"小宝":"首页"}</span></button>
    <button className={quoteActive?"active":""} aria-current={quoteActive?"page":undefined} onClick={()=>onNavigate("quotes")} aria-label="行情"><i className="nav-icon nav-chart" aria-hidden="true"><em /><em /><em /></i><span>行情</span></button>
    <button className={active==="trade"?"active":""} aria-current={active==="trade"?"page":undefined} onClick={()=>onNavigate("trade")} aria-label="交易"><i className="nav-icon nav-trade" aria-hidden="true" /><span>交易</span></button>
    <button className={active==="wealth"?"active":""} aria-current={active==="wealth"?"page":undefined} onClick={()=>onNavigate("wealth")} aria-label="理财"><i className="nav-icon nav-wealth" aria-hidden="true"><em /></i><span>理财</span></button>
    <button className={active==="profile"?"active":""} aria-current={active==="profile"?"page":undefined} onClick={()=>onNavigate("profile")} aria-label="我的"><i className="nav-icon nav-profile" aria-hidden="true"><em /><strong /></i><span>我的</span></button>
  </nav>;
}
