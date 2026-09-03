import { hexagramFromLines, mutualHexagram } from "@/lib/trigrams";
import type { CoinValue, LiuYaoLine, LiuYaoResult } from "@/lib/types";

const branchElements: Record<string, string> = { 子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火", 午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水" };
const produces: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const branchOrder = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const spirits = ["青龙", "朱雀", "勾陈", "螣蛇", "白虎", "玄武"];

function randomCoin(): CoinValue {
  const bytes = new Uint32Array(1);
  globalThis.crypto.getRandomValues(bytes);
  return bytes[0] % 2 === 0 ? 2 : 3;
}

export function createCoinThrows(): CoinValue[][] {
  return Array.from({ length: 6 }, () => [randomCoin(), randomCoin(), randomCoin()]);
}

function relative(dayElement: string, lineElement: string): string {
  if (dayElement === lineElement) return "兄弟";
  if (produces[dayElement] === lineElement) return "子孙";
  if (produces[lineElement] === dayElement) return "父母";
  if (produces[dayElement] === produces[lineElement]) return "妻财";
  return "官鬼";
}

function deriveBranches(seed: number): string[] {
  return Array.from({ length: 6 }, (_, index) => branchOrder[(seed + index * 2) % branchOrder.length]);
}

export function calculateLiuYao(throws: CoinValue[][], dayElement = "木"): LiuYaoResult {
  if (throws.length !== 6 || throws.some((line) => line.length !== 3 || line.some((coin) => coin !== 2 && coin !== 3))) {
    throw new Error("六爻需要六次、每次三枚铜钱的有效记录");
  }
  const totals = throws.map((line) => line.reduce((sum, coin) => sum + coin, 0));
  const baseLines = totals.map((total) => total === 7 || total === 9);
  const changedLines = totals.map((total, index) => (total === 6 || total === 9 ? !baseLines[index] : baseLines[index]));
  const movingPositions = totals.flatMap((total, index) => (total === 6 || total === 9 ? [index + 1] : []));
  const seed = totals.reduce((sum, total) => sum + total, 0);
  const branches = deriveBranches(seed);
  const shiPosition = 3;
  const yingPosition = 6;
  const lines: LiuYaoLine[] = totals.map((total, index) => ({
    position: index + 1,
    label: ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][index],
    coinTotal: total,
    nature: baseLines[index] ? "阳" : "阴",
    moving: total === 6 || total === 9,
    relative: relative(dayElement, branchElements[branches[index]]),
    branch: branches[index],
    element: branchElements[branches[index]],
    spirit: spirits[(seed + index) % spirits.length],
    shiYing: index + 1 === shiPosition ? "世" : index + 1 === yingPosition ? "应" : "",
    changedNature: changedLines[index] ? "阳" : "阴",
  }));
  return {
    castRecord: throws,
    base: hexagramFromLines(baseLines),
    changed: hexagramFromLines(changedLines),
    mutual: mutualHexagram(baseLines),
    lines,
    movingPositions,
    shiPosition,
    yingPosition,
    calculationVersion: "liuyao-three-coins-basic-v1",
  };
}
