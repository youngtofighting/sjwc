import { Solar } from "lunar-javascript";
import { calendarFromGregorian, parseDate } from "@/lib/calendar";
import type { BaziResult, BirthInput, Pillar } from "@/lib/types";

const stemElements: Record<string, string> = { 甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水" };
const branchElements: Record<string, string> = { 子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火", 午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水" };
const hidden: Record<string, string[]> = {
  子: ["癸"], 丑: ["己", "癸", "辛"], 寅: ["甲", "丙", "戊"], 卯: ["乙"], 辰: ["戊", "乙", "癸"], 巳: ["丙", "戊", "庚"],
  午: ["丁", "己"], 未: ["己", "丁", "乙"], 申: ["庚", "壬", "戊"], 酉: ["辛"], 戌: ["戊", "辛", "丁"], 亥: ["壬", "甲"],
};
const yinStems = new Set(["乙", "丁", "己", "辛", "癸"]);
const produces: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };

function tenGod(dayStem: string, targetStem: string): string {
  const self = stemElements[dayStem];
  const target = stemElements[targetStem];
  const samePolarity = yinStems.has(dayStem) === yinStems.has(targetStem);
  if (self === target) return samePolarity ? "比肩" : "劫财";
  if (produces[self] === target) return samePolarity ? "食神" : "伤官";
  if (produces[target] === self) return samePolarity ? "偏印" : "正印";
  if (produces[self] === produces[target]) return samePolarity ? "偏财" : "正财";
  return samePolarity ? "七杀" : "正官";
}

function makePillar(label: Pillar["label"], value: string, dayStem: string): Pillar {
  const [stem, branch] = [...value];
  return {
    label,
    value,
    stem,
    branch,
    hiddenStems: hidden[branch] ?? [],
    element: `${stemElements[stem] ?? ""}${branchElements[branch] ?? ""}`,
    yinYang: `${yinStems.has(stem) ? "阴" : "阳"}${stemElements[stem] ?? ""}`,
    tenGod: label === "日柱" ? "日主" : tenGod(dayStem, stem),
    naYin: "以传统纳音规则为准",
  };
}

function fallbackLuck(year: number, monthPillar: string): BaziResult["luckCycles"] {
  const stems = "甲乙丙丁戊己庚辛壬癸";
  const branches = "子丑寅卯辰巳午未申酉戌亥";
  const stemIndex = stems.indexOf(monthPillar[0]);
  const branchIndex = branches.indexOf(monthPillar[1]);
  return Array.from({ length: 8 }, (_, index) => ({
    ganZhi: `${stems[(stemIndex + index + 1) % 10]}${branches[(branchIndex + index + 1) % 12]}`,
    startAge: 6 + index * 10,
    endAge: 15 + index * 10,
    startYear: year + 6 + index * 10,
    endYear: year + 15 + index * 10,
  }));
}

export function calculateBazi(input: BirthInput): BaziResult {
  if (!input.time) throw new Error("八字与紫微排盘需要出生时间；可在界面中选择未知时辰进入降级展示。");
  const { year, month, day } = parseDate(input.date);
  const [hour, minute] = input.time.split(":").map(Number);
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar() as unknown as Record<string, () => string>;
  const rawValues = [eightChar.getYear(), eightChar.getMonth(), eightChar.getDay(), eightChar.getTime()];
  const dayStem = rawValues[2][0];
  const pillars = ["年柱", "月柱", "日柱", "时柱"].map((label, index) => makePillar(label as Pillar["label"], rawValues[index], dayStem));
  const elementCounts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  pillars.forEach((pillar) => {
    elementCounts[stemElements[pillar.stem]] += 1;
    elementCounts[branchElements[pillar.branch]] += 1;
    pillar.hiddenStems.forEach((stem) => { elementCounts[stemElements[stem]] += 0.5; });
  });
  return {
    calendar: calendarFromGregorian(input.date, input.time, input.timezone),
    pillars,
    elementCounts,
    luckCycles: fallbackLuck(year, rawValues[1]),
    calculationVersion: "bazi-lunar-javascript-v1",
    warnings: ["大运起运年龄当前采用可复核的 MVP 近似展示；上线前请按选定流派补充精确起运规则。"],
  };
}
