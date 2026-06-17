import { useState, useEffect, useRef } from "react";

const PALETTE = {
  bg: "#F4F7FB",
  surface: "#FFFFFF",
  surfaceHover: "#EEF3FA",
  border: "#D0DCF0",
  borderLight: "#B0C4E0",
  gold: "#B07D10",
  goldLight: "#D4A020",
  text: "#1A2640",
  textMuted: "#5A6F8C",
  red: "#C0392B",
  green: "#1A7A4A",
  blue: "#1A5DB5",
  purple: "#6A3DAA",
  orange: "#C05010",
};

const CATEGORY_CONFIG = {
  macro: { label: "マクロ経済", color: "#1A5DB5", icon: "📊" },
  earnings: { label: "決算", color: "#B07D10", icon: "💹" },
  central_bank: { label: "中央銀行", color: "#6A3DAA", icon: "🏦" },
  ipo: { label: "IPO", color: "#1A7A4A", icon: "🚀" },
  dividend: { label: "配当", color: "#A05010", icon: "💰" },
  news: { label: "速報ニュース", color: "#C05010", icon: "🔴" },
  other: { label: "その他", color: "#5A6F8C", icon: "📌" },
};

function getImpactColor(impact) {
  if (impact >= 3) return "#E05252";
  if (impact === 2) return "#C9A84C";
  return "#4CAF82";
}

const SEED_EVENTS = [
  { id: "s1", date: "2026-06-16", title: "米国 CPI（5月）", category: "macro", impact: 3, country: "US", detail: "消費者物価指数。前月比・前年比ともに注目。FRBの利下げ判断に直結。", source: "Bureau of Labor Statistics", isNews: false },
  { id: "s2", date: "2026-06-17", title: "日銀金融政策決定会合（結果）", category: "central_bank", impact: 3, country: "JP", detail: "金利据え置きか追加利上げか。植田総裁の会見が焦点。", source: "日本銀行", isNews: false },
  { id: "s3", date: "2026-06-18", title: "NVIDIA 決算（Q1 FY2027）", category: "earnings", impact: 3, country: "US", detail: "データセンター需要・次世代GPU出荷動向が焦点。", source: "NVIDIA Corp", isNews: false },
  { id: "s4", date: "2026-06-19", title: "Juneteenth（米国祝日）", category: "other", impact: 1, country: "US", detail: "NYSE・NASDAQ 休場", source: "", isNews: false },
  { id: "s5", date: "2026-06-20", title: "日本 全国CPI（5月）", category: "macro", impact: 2, country: "JP", detail: "コアコアCPIが日銀政策の判断材料。", source: "総務省", isNews: false },
  { id: "s6", date: "2026-06-23", title: "米国 PMI速報（6月）", category: "macro", impact: 2, country: "US", detail: "製造業・サービス業PMI。景気先行指標。", source: "S&P Global", isNews: false },
  { id: "s7", date: "2026-06-24", title: "ソフトバンクグループ 決算", category: "earnings", impact: 2, country: "JP", detail: "ビジョンファンドのNAVと投資先評価が焦点。", source: "ソフトバンクグループ", isNews: false },
  { id: "s8", date: "2026-06-25", title: "欧州中央銀行（ECB）理事会", category: "central_bank", impact: 3, country: "EU", detail: "追加利下げの有無。ラガルド総裁会見に注目。", source: "ECB", isNews: false },
  { id: "s9", date: "2026-06-26", title: "米国 GDP（Q1確報）", category: "macro", impact: 2, country: "US", detail: "第1四半期GDP確報値。", source: "BEA", isNews: false },
  { id: "s10", date: "2026-06-27", title: "米国 PCEデフレーター（5月）", category: "macro", impact: 3, country: "US", detail: "FRBが最重視するインフレ指標。コアPCEが焦点。", source: "BEA", isNews: false },
  { id: "s11", date: "2026-07-01", title: "日銀短観（6月）", category: "macro", impact: 2, country: "JP", detail: "大企業製造業DIが注目。景況感の方向性を確認。", source: "日本銀行", isNews: false },
  { id: "s12", date: "2026-07-02", title: "米国 ADP雇用（6月）", category: "macro", impact: 2, country: "US", detail: "民間雇用者数。非農業部門雇用者数の先行指標。", source: "ADP", isNews: false },
  { id: "s13", date: "2026-07-04", title: "独立記念日（米国祝日）", category: "other", impact: 1, country: "US", detail: "NYSE・NASDAQ 休場", source: "", isNews: false },
  { id: "s14", date: "2026-07-05", title: "米国 雇用統計（6月）", category: "macro", impact: 3, country: "US", detail: "非農業部門雇用者数・失業率・平均時給。最重要指標の一つ。", source: "BLS", isNews: false },
  { id: "s15", date: "2026-07-08", title: "FOMC 議事録公表", category: "central_bank", impact: 2, country: "US", detail: "前回会合の詳細議論が明らかに。利下げ時期のヒントを探る。", source: "Federal Reserve", isNews: false },
  { id: "s16", date: "2026-07-10", title: "米国 CPI（6月）", category: "macro", impact: 3, country: "US", detail: "消費者物価指数6月分。FOMCへの影響大。", source: "BLS", isNews: false },
  { id: "s17", date: "2026-07-15", title: "JPモルガン 決算（Q2）", category: "earnings", impact: 2, country: "US", detail: "大手銀行決算シーズンの先陣。NII・貸倒引当金が焦点。", source: "JPMorgan Chase", isNews: false },
  { id: "s18", date: "2026-07-22", title: "テスラ 決算（Q2）", category: "earnings", impact: 2, country: "US", detail: "EV販売台数・マージン・エネルギー事業が焦点。", source: "Tesla Inc", isNews: false },
  { id: "s19", date: "2026-07-23", title: "アルファベット 決算（Q2）", category: "earnings", impact: 3, country: "US", detail: "YouTube広告・Google Cloud成長率・AI投資動向。", source: "Alphabet Inc", isNews: false },
  { id: "s20", date: "2026-07-24", title: "FOMC 政策金利決定", category: "central_bank", impact: 3, country: "US", detail: "7月会合。利下げ時期への声明文のニュアンスが焦点。", source: "Federal Reserve", isNews: false },
  { id: "s21", date: "2026-07-30", title: "アマゾン 決算（Q2）", category: "earnings", impact: 3, country: "US", detail: "AWSクラウド成長率・広告収入・物流コスト削減効果。", source: "Amazon.com", isNews: false },
  { id: "s22", date: "2026-07-31", title: "アップル 決算（Q3 FY2026）", category: "earnings", impact: 3, country: "US", detail: "iPhone出荷・サービス収入・インド生産比率。", source: "Apple Inc", isNews: false },
];

const COUNTRIES = ["すべて", "US", "JP", "EU"];

// ── Tiny helpers ─────────────────────────────────────────────
function ImpactDots({ impact }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i <= impact ? getImpactColor(impact) : PALETTE.border }} />
      ))}
    </div>
  );
}

function Badge({ children, color }) {
  return (
    <span style={{ fontSize: 12, color, background: color + "22", borderRadius: 3, padding: "1px 6px", fontWeight: 600, border: `1px solid ${color}44` }}>
      {children}
    </span>
  );
}

// ── News fetch via Anthropic API with web_search tool ────────
async function fetchNewsEvents(topic) {
  const today = new Date().toISOString().split("T")[0];
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      system: `Today is ${today}. You are a financial news assistant. Search for recent news about the given topic and return a JSON array of calendar events derived from that news.
Return ONLY a valid JSON array as your final text response (after tool use), no markdown, no backticks, no explanation.
Format: [{"date":"YYYY-MM-DD","title":"短いイベント名（日本語）","category":"macro|earnings|central_bank|ipo|dividend|news|other","impact":1|2|3,"country":"US|JP|EU|その他","detail":"ニュース内容の要約（日本語・2〜3文）","source":"出典メディア名","isNews":true}]
Rules:
- Use real dates found in the news. If a future date is mentioned, use it. If it already happened, use that date.
- impact 3 = 市場への影響大（利上げ・利下げ決定・サプライズ決算など）, 2 = 中程度, 1 = 軽微
- category "news" = 速報・突発ニュース, "central_bank" = 中銀関連, "macro" = 経済指標, "earnings" = 決算
- Return 3 to 8 events. No duplicate titles.`,
      messages: [{ role: "user", content: `Search for recent financial news about: ${topic}` }],
    }),
  });
  const data = await response.json();
  // Extract the final text block (after tool use)
  const textBlocks = (data.content || []).filter((b) => b.type === "text");
  const raw = textBlocks.map((b) => b.text).join("");
  // Strip any accidental markdown fences
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Auto-update via scheduled news fetch ─────────────────────
const NEWS_TOPICS = [
  "日銀 金融政策 利上げ 利下げ 2026",
  "Fed FOMC interest rate decision 2026",
  "日本 企業決算 2026",
  "米国 経済指標 CPI 雇用統計 2026",
  "ECB 欧州中央銀行 金融政策 2026",
];

// ── Components ───────────────────────────────────────────────
function NewsUpdateLog({ log }) {
  if (!log.length) return null;
  return (
    <div style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
      <div style={{ color: PALETTE.textMuted, fontSize: 14, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>📡 自動更新ログ</div>
      <div style={{ maxHeight: 120, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {[...log].reverse().map((entry, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ color: PALETTE.textMuted, fontSize: 13, whiteSpace: "nowrap", fontFamily: "monospace" }}>{entry.time}</span>
            <span style={{ color: entry.type === "error" ? PALETTE.red : entry.type === "add" ? PALETTE.green : PALETTE.textMuted, fontSize: 12 }}>{entry.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AutoUpdatePanel({ onAddEvents, addLog, isRunning, setIsRunning, lastUpdated }) {
  const [intervalMin, setIntervalMin] = useState(60);
  const [customTopic, setCustomTopic] = useState("");
  const [loadingManual, setLoadingManual] = useState(false);
  const [progress, setProgress] = useState(null);

  const runUpdate = async (topics, manual = false) => {
    if (manual) setLoadingManual(true);
    let totalAdded = 0;
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      if (manual) setProgress(`検索中 (${i + 1}/${topics.length}): ${topic.slice(0, 30)}…`);
      addLog({ type: "info", msg: `🔍 検索: ${topic.slice(0, 40)}…`, time: new Date().toLocaleTimeString("ja-JP") });
      try {
        const events = await fetchNewsEvents(topic);
        if (events && events.length > 0) {
          onAddEvents(events, topic);
          totalAdded += events.length;
          addLog({ type: "add", msg: `✅ ${events.length}件追加: ${topic.slice(0, 30)}`, time: new Date().toLocaleTimeString("ja-JP") });
        }
      } catch (e) {
        addLog({ type: "error", msg: `❌ エラー: ${topic.slice(0, 30)} — ${e.message}`, time: new Date().toLocaleTimeString("ja-JP") });
      }
    }
    if (manual) { setLoadingManual(false); setProgress(null); }
    addLog({ type: "info", msg: `📋 更新完了。合計 ${totalAdded} 件追加。`, time: new Date().toLocaleTimeString("ja-JP") });
  };

  const handleManualAll = () => runUpdate(NEWS_TOPICS, true);
  const handleManualCustom = () => {
    if (!customTopic.trim()) return;
    runUpdate([customTopic.trim()], true);
  };

  return (
    <div style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: 10, padding: 18, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div>
          <span style={{ color: PALETTE.orange, fontWeight: 700, fontSize: 14 }}>🔴 ライブニュース自動更新</span>
          {lastUpdated && <span style={{ color: PALETTE.textMuted, fontSize: 13, marginLeft: 10 }}>最終更新: {lastUpdated}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: PALETTE.textMuted, fontSize: 12 }}>自動更新間隔:</span>
          <select value={intervalMin} onChange={(e) => setIntervalMin(Number(e.target.value))}
            style={{ background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, color: PALETTE.text, borderRadius: 5, padding: "4px 8px", fontSize: 12 }}>
            <option value={30}>30分</option>
            <option value={60}>1時間</option>
            <option value={180}>3時間</option>
            <option value={360}>6時間</option>
          </select>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
              background: isRunning ? PALETTE.red : PALETTE.green, color: "#fff",
            }}>
            {isRunning ? "⏹ 停止" : "▶ 開始"}
          </button>
        </div>
      </div>

      {/* Auto-fetch topics */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: PALETTE.textMuted, fontSize: 13, marginBottom: 6 }}>監視中のトピック:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {NEWS_TOPICS.map((t, i) => (
            <span key={i} style={{ fontSize: 13, color: PALETTE.blue, background: PALETTE.blue + "18", borderRadius: 4, padding: "2px 8px", border: `1px solid ${PALETTE.blue}33` }}>
              {t.split(" ")[0]} {t.split(" ")[1]}
            </span>
          ))}
        </div>
      </div>

      {/* Manual custom search */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleManualCustom()}
          placeholder="カスタム検索: 例「日銀 追加利上げ」「ソニー 決算」..."
          style={{
            flex: 1, padding: "9px 12px", background: PALETTE.bg,
            border: `1px solid ${PALETTE.border}`, borderRadius: 6,
            color: PALETTE.text, fontSize: 15, outline: "none",
          }}
        />
        <button
          onClick={handleManualCustom}
          disabled={loadingManual || !customTopic.trim()}
          style={{ padding: "9px 14px", background: PALETTE.orange, color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loadingManual ? 0.6 : 1, whiteSpace: "nowrap" }}>
          🔍 検索
        </button>
        <button
          onClick={handleManualAll}
          disabled={loadingManual}
          style={{ padding: "9px 14px", background: "transparent", color: PALETTE.orange, border: `1px solid ${PALETTE.orange}`, borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loadingManual ? 0.6 : 1, whiteSpace: "nowrap" }}>
          {loadingManual ? "取得中…" : "全更新"}
        </button>
      </div>
      {progress && <div style={{ color: PALETTE.textMuted, fontSize: 14, padding: "6px 0" }}>⏳ {progress}</div>}
    </div>
  );
}

function AISearchPanel({ onAddEvents }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const events = await fetchNewsEvents(query);
      setResult(events);
    } catch (e) {
      setError("取得に失敗しました。もう一度お試しください。");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: 10, padding: 18, marginBottom: 20 }}>
      <div style={{ color: PALETTE.gold, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>🤖 AI手動検索</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="例：7月の米国経済指標、日本のIT企業決算..."
          style={{ flex: 1, padding: "10px 14px", background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: 7, color: PALETTE.text, fontSize: 14, outline: "none" }}
        />
        <button onClick={handleSearch} disabled={loading}
          style={{ padding: "10px 18px", background: PALETTE.gold, color: PALETTE.bg, border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, whiteSpace: "nowrap" }}>
          {loading ? "検索中…" : "検索"}
        </button>
      </div>
      {error && <p style={{ color: PALETTE.red, fontSize: 15, margin: 0 }}>{error}</p>}
      {result && result.length > 0 && (
        <div>
          <p style={{ color: PALETTE.textMuted, fontSize: 14, marginBottom: 10 }}>{result.length}件のイベントが見つかりました。</p>
          {result.map((ev, i) => {
            const cat = CATEGORY_CONFIG[ev.category] || CATEGORY_CONFIG.other;
            return (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5, padding: "6px 10px", background: PALETTE.bg, borderRadius: 6 }}>
                <span>{cat.icon}</span>
                <span style={{ color: PALETTE.text, fontSize: 15, flex: 1 }}>{ev.title}</span>
                <span style={{ color: PALETTE.textMuted, fontSize: 12 }}>{ev.date}</span>
                <ImpactDots impact={ev.impact || 2} />
              </div>
            );
          })}
          <button
            onClick={() => { onAddEvents(result, query); setResult(null); setQuery(""); }}
            style={{ marginTop: 10, width: "100%", padding: "9px 0", background: "transparent", border: `1px solid ${PALETTE.gold}`, color: PALETTE.gold, borderRadius: 7, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            ✅ すべてカレンダーに追加
          </button>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, onClick, compact }) {
  const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.other;
  return (
    <div onClick={() => onClick(event)}
      style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderLeft: `3px solid ${cat.color}`, borderRadius: 6, padding: compact ? "6px 10px" : "10px 14px", cursor: "pointer", marginBottom: compact ? 4 : 8, transition: "background 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = PALETTE.surfaceHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = PALETTE.surface)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: compact ? 11 : 13 }}>{cat.icon}</span>
          <span style={{ color: PALETTE.text, fontWeight: 600, fontSize: compact ? 12 : 13 }}>{event.title}</span>
          {event.country && <span style={{ fontSize: 12, color: PALETTE.textMuted, background: PALETTE.border, borderRadius: 3, padding: "1px 5px" }}>{event.country}</span>}
          {event.isNews && <Badge color={PALETTE.orange}>速報</Badge>}
        </div>
        <ImpactDots impact={event.impact} />
      </div>
    </div>
  );
}

function EventModal({ event, onClose }) {
  const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.other;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
      <div style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.borderLight}`, borderRadius: 12, padding: 28, maxWidth: 480, width: "100%", borderLeft: `4px solid ${cat.color}` }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ color: cat.color, fontWeight: 700, fontSize: 13 }}>{cat.icon} {cat.label}</span>
            {event.isNews && <Badge color={PALETTE.orange}>速報ニュース</Badge>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: PALETTE.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <h2 style={{ color: PALETTE.text, margin: "0 0 10px", fontSize: 20, fontWeight: 700 }}>{event.title}</h2>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: PALETTE.textMuted, fontSize: 13 }}>📅 {event.date}</span>
          {event.country && <span style={{ fontSize: 13, color: PALETTE.textMuted, background: PALETTE.border, borderRadius: 3, padding: "2px 7px" }}>{event.country}</span>}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <ImpactDots impact={event.impact} />
            <span style={{ color: getImpactColor(event.impact), fontSize: 14, fontWeight: 600 }}>
              影響度: {["低", "中", "高"][event.impact - 1]}
            </span>
          </div>
        </div>
        {event.detail && (
          <p style={{ color: PALETTE.text, fontSize: 14, lineHeight: 1.75, margin: "0 0 14px", background: PALETTE.bg, borderRadius: 6, padding: "12px 14px" }}>{event.detail}</p>
        )}
        {event.source && <p style={{ color: PALETTE.textMuted, fontSize: 14, margin: 0 }}>出典: {event.source}</p>}
        {event.fetchedAt && <p style={{ color: PALETTE.textMuted, fontSize: 13, margin: "6px 0 0" }}>取得: {event.fetchedAt}</p>}
      </div>
    </div>
  );
}

function MonthView({ year, month, events, onSelectDay, selectedDay }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getEventsForDay = (d) => {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return events.filter((e) => e.date === ds);
  };
  const isToday = (d) => d && today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
  const isSelected = (d) => d && selectedDay === `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: 1 }}>
        {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
          <div key={d} style={{ textAlign: "center", padding: "8px 0", color: i === 0 ? PALETTE.red : i === 6 ? "#6AAADA" : PALETTE.textMuted, fontSize: 14, fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((d, i) => {
          const dayEvs = d ? getEventsForDay(d) : [];
          const hasNews = dayEvs.some((e) => e.isNews);
          const maxImpact = dayEvs.length ? Math.max(...dayEvs.map((e) => e.impact)) : 0;
          return (
            <div key={i} onClick={() => d && onSelectDay(d)}
              style={{ minHeight: 76, background: isSelected(d) ? PALETTE.surfaceHover : d ? PALETTE.surface : "transparent", borderRadius: 6, border: isToday(d) ? `2px solid ${PALETTE.gold}` : isSelected(d) ? `1px solid ${PALETTE.borderLight}` : `1px solid ${d ? PALETTE.border : "transparent"}`, cursor: d ? "pointer" : "default", padding: 6, transition: "background 0.15s", overflow: "hidden" }}
              onMouseEnter={(e) => d && (e.currentTarget.style.background = PALETTE.surfaceHover)}
              onMouseLeave={(e) => d && !isSelected(d) && (e.currentTarget.style.background = PALETTE.surface)}>
              {d && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: isToday(d) ? 700 : 400, color: isToday(d) ? PALETTE.gold : PALETTE.text, fontFamily: "monospace" }}>{d}</span>
                    <div style={{ display: "flex", gap: 3 }}>
                      {hasNews && <span style={{ width: 7, height: 7, borderRadius: "50%", background: PALETTE.orange, display: "block" }} title="速報あり" />}
                      {maxImpact >= 3 && <span style={{ width: 7, height: 7, borderRadius: "50%", background: PALETTE.red, display: "block" }} />}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {dayEvs.slice(0, 2).map((ev) => {
                      const cat = CATEGORY_CONFIG[ev.category] || CATEGORY_CONFIG.other;
                      return (
                        <div key={ev.id} style={{ background: cat.color + "22", borderRadius: 3, padding: "2px 5px", fontSize: 12, color: cat.color, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {cat.icon} {ev.title}
                        </div>
                      );
                    })}
                    {dayEvs.length > 2 && <div style={{ fontSize: 12, color: PALETTE.textMuted }}>+{dayEvs.length - 2}件</div>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState(SEED_EVENTS);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterCountry, setFilterCountry] = useState("すべて");
  const [filterCategory, setFilterCategory] = useState("すべて");
  const [filterImpact, setFilterImpact] = useState(0);
  const [showAutoPanel, setShowAutoPanel] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [updateLog, setUpdateLog] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [view, setView] = useState("month");
  const autoTimerRef = useRef(null);
  const topicIndexRef = useRef(0);
  const [intervalMin] = useState(60);

  const addLog = (entry) => setUpdateLog((prev) => [...prev.slice(-49), entry]);

  // De-duplicate by title+date when adding events
  const addEvents = (newEvs, source = "") => {
    const ts = new Date().toLocaleString("ja-JP");
    const withMeta = newEvs.map((e, i) => ({
      ...e,
      id: `news-${Date.now()}-${i}`,
      fetchedAt: ts,
      isNews: e.isNews !== false,
    }));
    setEvents((prev) => {
      const existing = new Set(prev.map((e) => e.title + "|" + e.date));
      const fresh = withMeta.filter((e) => !existing.has(e.title + "|" + e.date));
      return [...prev, ...fresh];
    });
    setLastUpdated(ts);
  };

  // Auto-update scheduler: fetch one topic at a time on interval
  useEffect(() => {
    if (!isAutoRunning) {
      clearInterval(autoTimerRef.current);
      return;
    }
    const tick = async () => {
      const topic = NEWS_TOPICS[topicIndexRef.current % NEWS_TOPICS.length];
      topicIndexRef.current++;
      addLog({ type: "info", msg: `🔄 自動更新: ${topic.slice(0, 35)}…`, time: new Date().toLocaleTimeString("ja-JP") });
      try {
        const evs = await fetchNewsEvents(topic);
        if (evs && evs.length > 0) {
          addEvents(evs, topic);
          addLog({ type: "add", msg: `✅ ${evs.length}件取得`, time: new Date().toLocaleTimeString("ja-JP") });
        }
      } catch (e) {
        addLog({ type: "error", msg: `❌ エラー: ${e.message}`, time: new Date().toLocaleTimeString("ja-JP") });
      }
    };
    tick(); // run immediately on start
    autoTimerRef.current = setInterval(tick, intervalMin * 60 * 1000);
    return () => clearInterval(autoTimerRef.current);
  }, [isAutoRunning, intervalMin]);

  const filteredEvents = events.filter((ev) => {
    if (filterCountry !== "すべて" && ev.country !== filterCountry) return false;
    if (filterCategory !== "すべて" && ev.category !== filterCategory) return false;
    if (filterImpact > 0 && ev.impact < filterImpact) return false;
    return true;
  });

  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;
  const selectedDayEvents = selectedDateStr ? filteredEvents.filter((e) => e.date === selectedDateStr) : [];
  const monthEvents = filteredEvents.filter((e) => {
    const [y, m] = e.date.split("-");
    return parseInt(y) === year && parseInt(m) === month + 1;
  });
  const newsCount = events.filter((e) => e.isNews).length;
  const highImpactCount = monthEvents.filter((e) => e.impact >= 3).length;

  const prevMonth = () => { setMonth((m) => m === 0 ? (setYear((y) => y - 1), 11) : m - 1); setSelectedDay(null); };
  const nextMonth = () => { setMonth((m) => m === 11 ? (setYear((y) => y + 1), 0) : m + 1); setSelectedDay(null); };

  const MONTH_NAMES = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.bg, color: PALETTE.text, fontFamily: "'Inter', 'Hiragino Sans', sans-serif", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: PALETTE.surface, borderBottom: `1px solid ${PALETTE.border}`, padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <span style={{ color: PALETTE.gold, fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>📈 マーケットカレンダー</span>
          <span style={{ color: PALETTE.textMuted, fontSize: 14, marginLeft: 10 }}>CPI・決算・中銀イベント追跡</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isAutoRunning && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: PALETTE.orange, fontSize: 14, fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: PALETTE.orange, display: "inline-block", animation: "pulse 1.2s infinite" }} />
              LIVE
            </span>
          )}
          {newsCount > 0 && <Badge color={PALETTE.orange}>速報 {newsCount}件</Badge>}
          <button onClick={() => { setShowAutoPanel(!showAutoPanel); setShowAISearch(false); }}
            style={{ padding: "7px 13px", background: showAutoPanel ? PALETTE.orange : "transparent", border: `1px solid ${PALETTE.orange}`, color: showAutoPanel ? "#fff" : PALETTE.orange, borderRadius: 7, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
            🔴 ライブ更新
          </button>
          <button onClick={() => { setShowAISearch(!showAISearch); setShowAutoPanel(false); }}
            style={{ padding: "7px 13px", background: showAISearch ? PALETTE.gold : "transparent", border: `1px solid ${PALETTE.gold}`, color: showAISearch ? PALETTE.bg : PALETTE.gold, borderRadius: 7, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
            🤖 AI検索
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
        {/* Panels */}
        {showAutoPanel && (
          <>
            <AutoUpdatePanel onAddEvents={addEvents} addLog={addLog} isRunning={isAutoRunning} setIsRunning={setIsAutoRunning} lastUpdated={lastUpdated} />
            <NewsUpdateLog log={updateLog} />
          </>
        )}
        {showAISearch && <AISearchPanel onAddEvents={addEvents} />}

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
          <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}
            style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, color: PALETTE.text, borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, color: PALETTE.text, borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
            <option value="すべて">すべてのカテゴリ</option>
            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
          <select value={filterImpact} onChange={(e) => setFilterImpact(Number(e.target.value))}
            style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, color: PALETTE.text, borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
            <option value={0}>影響度: すべて</option>
            <option value={2}>影響度: 中以上</option>
            <option value={3}>影響度: 高のみ</option>
          </select>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {["month", "list"].map((v) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "6px 12px", background: view === v ? PALETTE.gold : "transparent", border: `1px solid ${view === v ? PALETTE.gold : PALETTE.border}`, color: view === v ? PALETTE.bg : PALETTE.textMuted, borderRadius: 6, fontSize: 15, cursor: "pointer", fontWeight: 600 }}>
                {v === "month" ? "📅 月表示" : "📋 リスト"}
              </button>
            ))}
          </div>
        </div>

        {/* Month nav + stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, color: PALETTE.text, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 16 }}>‹</button>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, flex: 1 }}>{year}年 {MONTH_NAMES[month]}</h2>
          <button onClick={nextMonth} style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, color: PALETTE.text, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 16 }}>›</button>
          <div style={{ display: "flex", gap: 10, marginLeft: 8 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: PALETTE.gold }}>{monthEvents.length}</div>
              <div style={{ fontSize: 13, color: PALETTE.textMuted }}>イベント</div>
            </div>
            <div style={{ width: 1, background: PALETTE.border }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: PALETTE.red }}>{highImpactCount}</div>
              <div style={{ fontSize: 13, color: PALETTE.textMuted }}>高影響度</div>
            </div>
            <div style={{ width: 1, background: PALETTE.border }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: PALETTE.orange }}>
                {monthEvents.filter((e) => e.isNews).length}
              </div>
              <div style={{ fontSize: 13, color: PALETTE.textMuted }}>速報</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedDay ? "1fr 280px" : "1fr", gap: 16 }}>
          <div>
            {view === "month" ? (
              <MonthView year={year} month={month} events={filteredEvents} onSelectDay={(d) => setSelectedDay(selectedDay === d ? null : d)} selectedDay={selectedDateStr} />
            ) : (
              <div>
                {monthEvents.length === 0 && <p style={{ color: PALETTE.textMuted, textAlign: "center", padding: 40 }}>この月のイベントはありません</p>}
                {[...monthEvents].sort((a, b) => a.date.localeCompare(b.date)).map((ev) => (
                  <EventCard key={ev.id} event={ev} onClick={setSelectedEvent} />
                ))}
              </div>
            )}
          </div>
          {selectedDay && (
            <div>
              <div style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 14, color: PALETTE.textMuted }}>{month + 1}月{selectedDay}日</h3>
                  <button onClick={() => setSelectedDay(null)} style={{ background: "none", border: "none", color: PALETTE.textMuted, cursor: "pointer" }}>✕</button>
                </div>
                {selectedDayEvents.length === 0
                  ? <p style={{ color: PALETTE.textMuted, fontSize: 15, textAlign: "center", padding: "20px 0" }}>イベントなし</p>
                  : selectedDayEvents.map((ev) => <EventCard key={ev.id} event={ev} onClick={setSelectedEvent} compact />)}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24, padding: "12px 16px", background: PALETTE.surface, borderRadius: 8, border: `1px solid ${PALETTE.border}` }}>
          <span style={{ color: PALETTE.textMuted, fontSize: 14, fontWeight: 600, alignSelf: "center" }}>凡例：</span>
          {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
            <span key={k} style={{ fontSize: 14, color: v.color, display: "flex", alignItems: "center", gap: 4 }}>{v.icon} {v.label}</span>
          ))}
          <span style={{ fontSize: 14, color: PALETTE.textMuted, marginLeft: "auto" }}>● 高 ● 中 ○ 低（影響度）｜🟠 速報あり</span>
        </div>
      </div>

      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
