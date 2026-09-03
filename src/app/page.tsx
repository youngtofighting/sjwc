"use client";

import { FormEvent, useMemo, useState } from "react";
import { calculateBazi } from "@/lib/bazi";
import { calendarFromGregorian } from "@/lib/calendar";
import { calculateLiuYao, createCoinThrows } from "@/lib/liuyao";
import { calculateMeihuaFromNumbers, calculateMeihuaFromTime } from "@/lib/meihua";
import type { CoinValue, DivinationResponse, Mode } from "@/lib/types";
import { calculateZiwei } from "@/lib/ziwei";

const initialCoins: CoinValue[][] = Array.from({ length: 6 }, () => [2, 2, 2]);
const categories = ["事业", "感情", "财务", "学业", "出行", "寻物", "健康", "其他"];

function Table({ title, headers, children, full = false }: { title: string; headers: string[]; children: React.ReactNode; full?: boolean }) {
  return <section className={`table-wrap ${full ? "full-width" : ""}`}><h3 className="table-title">{title}</h3><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></section>;
}

function Hex({ name, symbol }: { name: string; symbol: string }) {
  return <span><span className="hex" aria-label={name}>{symbol}</span> {name}</span>;
}

function Results({ data }: { data: DivinationResponse }) {
  const { calculatedFacts: facts } = data;
  return <section className="results" aria-live="polite">
    <div className="result-head"><div><h2>排盘结果</h2><p>本地静态排盘 · 编号：{data.requestId.slice(0, 8)}</p></div></div>
    <div className="warning">{data.interpretationNotice ?? "本次仅展示可复核的本地排盘数据。"}</div>
    {data.mode === "lifelong" && facts.bazi && facts.ziwei ? <LifelongTables bazi={facts.bazi} ziwei={facts.ziwei} /> : null}
    {data.mode === "question" && facts.liuyao && facts.meihua ? <QuestionTables liuyao={facts.liuyao} meihua={facts.meihua} /> : null}
  </section>;
}

function LifelongTables({ bazi, ziwei }: Pick<DivinationResponse["calculatedFacts"], "bazi" | "ziwei"> & { bazi: NonNullable<DivinationResponse["calculatedFacts"]["bazi"]>; ziwei: NonNullable<DivinationResponse["calculatedFacts"]["ziwei"]> }) {
  return <div className="result-grid">
    <Table title="基础信息" headers={["公历", "农历", "生肖", "时辰", "时区"]}>{<tr><td>{bazi.calendar.gregorian}</td><td>{bazi.calendar.lunar}</td><td>{bazi.calendar.zodiac}</td><td>{bazi.calendar.hourBranch ?? "—"}</td><td>{bazi.calendar.timezone}</td></tr>}</Table>
    <Table title="五行统计" headers={["木", "火", "土", "金", "水"]}>{<tr>{["木", "火", "土", "金", "水"].map((element) => <td key={element}>{bazi.elementCounts[element]}</td>)}</tr>}</Table>
    <Table title="四柱命盘" headers={["项目", ...bazi.pillars.map((pillar) => pillar.label)]} full>{[
      ["干支", ...bazi.pillars.map((pillar) => pillar.value)], ["藏干", ...bazi.pillars.map((pillar) => pillar.hiddenStems.join("、"))], ["十神", ...bazi.pillars.map((pillar) => pillar.tenGod ?? "—")], ["五行", ...bazi.pillars.map((pillar) => pillar.element)], ["阴阳", ...bazi.pillars.map((pillar) => pillar.yinYang)], ["纳音", ...bazi.pillars.map((pillar) => pillar.naYin ?? "—")],
    ].map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</Table>
    <Table title="大运（当前规则集）" headers={["大运", "年龄", "公历区间"]} full>{bazi.luckCycles.map((cycle) => <tr key={cycle.ganZhi}><td>{cycle.ganZhi}</td><td>{cycle.startAge}–{cycle.endAge} 岁</td><td>{cycle.startYear}–{cycle.endYear}</td></tr>)}</Table>
    <Table title="紫微盘面摘要" headers={["项目", "内容"]}>{ziwei.summary.map((item) => <tr key={item.label}><td>{item.label}</td><td>{item.value}</td></tr>)}</Table>
    <Table title="紫微十二宫" headers={["宫位", "地支", "主星", "辅星", "四化", "大限"]} full>{ziwei.palaces.map((palace) => <tr key={palace.name}><td>{palace.name}</td><td>{palace.branch}</td><td>{palace.majorStars.join("、")}</td><td>{palace.minorStars.join("、") || "—"}</td><td>{palace.transformations.join("、") || "—"}</td><td>{palace.decadalRange}</td></tr>)}</Table>
    {bazi.warnings.map((warning) => <div className="warning full-width" key={warning}>{warning}</div>)}
    {ziwei.warning ? <div className="warning full-width">{ziwei.warning}</div> : null}
  </div>;
}

function QuestionTables({ liuyao, meihua }: { liuyao: NonNullable<DivinationResponse["calculatedFacts"]["liuyao"]>; meihua: NonNullable<DivinationResponse["calculatedFacts"]["meihua"]> }) {
  return <div className="result-grid">
    <Table title="六爻起卦记录" headers={["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"]} full><tr>{liuyao.castRecord.map((coins, index) => <td key={index}>{coins.join("+")} = {coins.reduce((sum, coin) => sum + coin, 0)}</td>)}</tr></Table>
    <Table title="六爻卦象摘要" headers={["本卦", "变卦", "互卦", "动爻", "世/应"]} full><tr><td><Hex name={liuyao.base.name} symbol={liuyao.base.upper.symbol + liuyao.base.lower.symbol} /></td><td><Hex name={liuyao.changed.name} symbol={liuyao.changed.upper.symbol + liuyao.changed.lower.symbol} /></td><td>{liuyao.mutual.name}</td><td>{liuyao.movingPositions.length ? liuyao.movingPositions.join("、") : "无"}</td><td>{liuyao.shiPosition} 世 / {liuyao.yingPosition} 应</td></tr></Table>
    <Table title="六爻明细（上爻至初爻）" headers={["爻位", "阴阳", "动静", "六亲", "地支五行", "六神", "世应", "变爻"]} full>{[...liuyao.lines].reverse().map((line) => <tr key={line.position}><td>{line.label}</td><td>{line.nature}</td><td>{line.moving ? "动" : "静"}</td><td>{line.relative}</td><td>{line.branch}{line.element}</td><td>{line.spirit}</td><td>{line.shiYing || "—"}</td><td>{line.changedNature}</td></tr>)}</Table>
    <Table title="梅花易数起卦参数" headers={["方式", "取数过程"]} full><tr><td>{meihua.method}</td><td>{meihua.derivation}</td></tr></Table>
    <Table title="梅花卦象与体用" headers={["本卦", "互卦", "变卦", "动爻", "体卦", "用卦", "关系"]} full><tr><td>{meihua.base.name}</td><td>{meihua.mutual.name}</td><td>{meihua.changed.name}</td><td>第 {meihua.movingPosition} 爻</td><td>{meihua.body.symbol}{meihua.body.name}（{meihua.body.element}）</td><td>{meihua.use.symbol}{meihua.use.name}（{meihua.use.element}）</td><td>{meihua.relation}</td></tr></Table>
  </div>;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("lifelong");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [timezone, setTimezone] = useState("Asia/Shanghai");
  const [genderRule, setGenderRule] = useState<"male" | "female">("male");
  const [dayBoundaryRule, setDayBoundaryRule] = useState<"zi_hour" | "midnight">("zi_hour");
  const [birthplace, setBirthplace] = useState("");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("事业");
  const [castAt, setCastAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [liuMethod, setLiuMethod] = useState<"three_coins_auto" | "three_coins_manual">("three_coins_auto");
  const [coins, setCoins] = useState<CoinValue[][]>(initialCoins);
  const [meiMethod, setMeiMethod] = useState<"time" | "two_numbers">("time");
  const [numbers, setNumbers] = useState<[string, string]>(["", ""]);
  const [result, setResult] = useState<DivinationResponse | null>(null);
  const [error, setError] = useState("");

  const lunar = useMemo(() => { try { return date ? calendarFromGregorian(date, time, timezone) : null; } catch { return null; } }, [date, time, timezone]);
  const updateCoin = (lineIndex: number, coinIndex: number, value: CoinValue) => setCoins((previous) => previous.map((line, index) => index === lineIndex ? line.map((coin, innerIndex) => innerIndex === coinIndex ? value : coin) as CoinValue[] : line));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setResult(null);
    const birth = { date, time, timezone, birthplace: birthplace || undefined, genderRule, dayBoundaryRule };
    try {
      const requestId = globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}`;
      if (mode === "lifelong") {
        const bazi = calculateBazi(birth);
        const ziwei = calculateZiwei(birth);
        setResult({
          mode,
          requestId,
          calculatedFacts: { bazi, ziwei },
          interpretationNotice: "\u9759\u6001\u90e8\u7f72\u7248\u672c\u4ec5\u5c55\u793a\u672c\u5730\u6392\u76d8\u7ed3\u679c\uff0c\u4e0d\u5305\u542b AI \u89e3\u8bfb\u3002",
        });
      } else {
        const throws = liuMethod === "three_coins_auto" ? createCoinThrows() : coins;
        const liuyao = calculateLiuYao(throws);
        const meihua = meiMethod === "time"
          ? calculateMeihuaFromTime(castAt)
          : calculateMeihuaFromNumbers(Number(numbers[0]), Number(numbers[1]));
        setResult({
          mode,
          requestId,
          calculatedFacts: { liuyao, meihua },
          interpretationNotice: "\u9759\u6001\u90e8\u7f72\u7248\u672c\u4ec5\u5c55\u793a\u672c\u5730\u5366\u8c61\u4e0e\u8d77\u5366\u8bb0\u5f55\uff0c\u4e0d\u5305\u542b AI \u89e3\u8bfb\u3002",
        });
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "本地排盘失败，请检查填写内容后重试。"); }
  }

  return <main className="shell"><header className="masthead"><div><p className="eyebrow">TRADITION · REFLECTION · ACTION</p><h1>玄机问策</h1><p className="subhead">以八字、紫微斗数观长期底色；以六爻、梅花易数整理眼前一事。盘面负责呈现，行动仍由你决定。</p></div><div className="seal">命理<br />卜筮</div></header>
    <div className="notice"><span>◈</span><span>本工具为传统文化体验与自我反思参考，不提供确定性预言。涉及健康、法律、投资、心理危机或人身安全时，请优先咨询合格专业人士。</span></div>
    <div className="mode-grid" role="tablist" aria-label="选择咨询方式"><button type="button" role="tab" aria-selected={mode === "lifelong"} className={`mode-card ${mode === "lifelong" ? "active" : ""}`} onClick={() => { setMode("lifelong"); setResult(null); }}><small>长期脉络</small><strong>看八字</strong><span>排出八字与紫微斗数，观察一生大势与阶段节奏。</span></button><button type="button" role="tab" aria-selected={mode === "question"} className={`mode-card ${mode === "question" ? "active" : ""}`} onClick={() => { setMode("question"); setResult(null); }}><small>当下问题</small><strong>算卦</strong><span>通过六爻与梅花易数，为一件具体事情梳理线索。</span></button></div>
    <form className="panel" onSubmit={submit}><h2 className="panel-title">{mode === "lifelong" ? "填写出生资料" : "填写起卦资料"}</h2><div className="panel-body"><div className="form-grid">
      <div className="field"><label htmlFor="date">公历出生日期<em>*</em></label><input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></div>
      <div className="field"><label htmlFor="time">出生时间<em>*</em></label><input id="time" type="time" value={time} onChange={(event) => setTime(event.target.value)} required /><p className="hint">精确到分钟；影响时柱和紫微盘。</p></div>
      <div className="field"><label htmlFor="timezone">出生时区<em>*</em></label><select id="timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)}><option value="Asia/Shanghai">中国标准时间（UTC+8）</option><option value="Asia/Taipei">台北时间（UTC+8）</option><option value="Asia/Singapore">新加坡时间（UTC+8）</option><option value="America/New_York">纽约时间</option><option value="Europe/London">伦敦时间</option></select></div>
      <div className="field"><label htmlFor="birthplace">出生地（可选）</label><input id="birthplace" value={birthplace} onChange={(event) => setBirthplace(event.target.value)} placeholder="如：上海" maxLength={80} /></div>
      <div className="field"><label>传统排盘参数<em>*</em></label><div className="segmented"><button type="button" className={genderRule === "male" ? "active" : ""} onClick={() => setGenderRule("male")}>传统男命</button><button type="button" className={genderRule === "female" ? "active" : ""} onClick={() => setGenderRule("female")}>传统女命</button></div></div>
      <div className="field"><label>日界规则</label><div className="segmented"><button type="button" className={dayBoundaryRule === "zi_hour" ? "active" : ""} onClick={() => setDayBoundaryRule("zi_hour")}>子初换日</button><button type="button" className={dayBoundaryRule === "midnight" ? "active" : ""} onClick={() => setDayBoundaryRule("midnight")}>午夜换日</button></div></div>
      {lunar ? <div className="lunar-preview full-width"><span>自动换算农历：<strong>{lunar.lunar}</strong></span><span>生肖：<strong>{lunar.zodiac}</strong></span><span>时辰：<strong>{lunar.hourBranch ?? "—"}</strong></span><span>规则：{lunar.ruleSet}</span></div> : <p className="hint full-width">填写有效的公历日期后，这里会自动显示对应农历。</p>}
      {mode === "question" ? <>
        <div className="field full"><label htmlFor="question">要问的具体事情<em>*</em></label><textarea id="question" value={question} onChange={(event) => setQuestion(event.target.value)} minLength={10} maxLength={300} required placeholder="请一次只问一件事，例如：我是否应在本月底前接受这份工作邀约？" /><p className="hint">{question.length}/300 字。问题越具体，越适合用于梳理现实条件与下一步行动。</p></div>
        <div className="field"><label htmlFor="category">问题类别<em>*</em></label><select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="field wide"><label htmlFor="castAt">起卦时间<em>*</em></label><input id="castAt" type="datetime-local" value={castAt} onChange={(event) => setCastAt(event.target.value)} required /></div>
        <div className="field full"><label>六爻起卦方式<em>*</em></label><div className="segmented"><button type="button" className={liuMethod === "three_coins_auto" ? "active" : ""} onClick={() => setLiuMethod("three_coins_auto")}>自动模拟三枚铜钱</button><button type="button" className={liuMethod === "three_coins_manual" ? "active" : ""} onClick={() => setLiuMethod("three_coins_manual")}>手动录入六次投币</button></div><p className="hint">自动方式在服务端使用加密安全随机数；同一盘面重新解读不会重新起卦。</p></div>
        {liuMethod === "three_coins_manual" ? <div className="field full"><label>六次投币（从初爻到上爻）<em>*</em></label><div className="coins">{coins.map((line, lineIndex) => <div className="coin-row" key={lineIndex}><span>{["初", "二", "三", "四", "五", "上"][lineIndex]}爻</span>{line.map((coin, coinIndex) => <select key={coinIndex} value={coin} onChange={(event) => updateCoin(lineIndex, coinIndex, Number(event.target.value) as CoinValue)}><option value="2">背（2）</option><option value="3">字（3）</option></select>)}</div>)}</div></div> : null}
        <div className="field full"><label>梅花易数方式<em>*</em></label><div className="segmented"><button type="button" className={meiMethod === "time" ? "active" : ""} onClick={() => setMeiMethod("time")}>按起卦时间</button><button type="button" className={meiMethod === "two_numbers" ? "active" : ""} onClick={() => setMeiMethod("two_numbers")}>输入两个数字</button></div></div>
        {meiMethod === "two_numbers" ? <><div className="field"><label htmlFor="firstNumber">第一个数字<em>*</em></label><input id="firstNumber" type="number" min="1" max="9999" value={numbers[0]} onChange={(event) => setNumbers([event.target.value, numbers[1]])} required /></div><div className="field"><label htmlFor="secondNumber">第二个数字<em>*</em></label><input id="secondNumber" type="number" min="1" max="9999" value={numbers[1]} onChange={(event) => setNumbers([numbers[0], event.target.value])} required /></div></> : null}
      </> : null}
    </div><div className="form-actions"><button className="primary" type="submit">{mode === "lifelong" ? "开始排盘" : "开始起卦"}</button><span className="action-note">所有计算均在当前浏览器完成；不会上传资料。刷新页面即可清除结果。</span></div>{error ? <div className="error" role="alert">{error}</div> : null}</div></form>
    {result ? <Results data={result} /> : null}
  </main>;
}
