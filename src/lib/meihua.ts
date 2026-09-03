import { elementRelation, hexagramFromLines, mutualHexagram, trigramFromNumber } from "@/lib/trigrams";
import type { MeiHuaResult, Trigram } from "@/lib/types";

function remainder(value: number, divisor: number): number {
  const result = value % divisor;
  return result === 0 ? divisor : result;
}

function changeLine(lines: boolean[], position: number): boolean[] {
  return lines.map((line, index) => (index === position - 1 ? !line : line));
}

export function calculateMeihuaFromNumbers(first: number, second: number): MeiHuaResult {
  const upper = trigramFromNumber(remainder(first, 8));
  const lower = trigramFromNumber(remainder(second, 8));
  const movingPosition = remainder(first + second, 6);
  const baseLines = [...lower.lines, ...upper.lines];
  const changedLines = changeLine(baseLines, movingPosition);
  const body: Trigram = movingPosition <= 3 ? upper : lower;
  const use: Trigram = movingPosition <= 3 ? lower : upper;
  return {
    method: "两数起卦",
    derivation: `上卦：${first} ÷ 8 取余 ${remainder(first, 8)}；下卦：${second} ÷ 8 取余 ${remainder(second, 8)}；动爻：两数和 ÷ 6 取余 ${movingPosition}。余数为 0 时按 8 或 6 计。`,
    base: hexagramFromLines(baseLines),
    changed: hexagramFromLines(changedLines),
    mutual: mutualHexagram(baseLines),
    movingPosition,
    body,
    use,
    relation: elementRelation(body.element, use.element),
    calculationVersion: "meihua-number-v1",
  };
}

export function calculateMeihuaFromTime(castAt: string): MeiHuaResult {
  const date = new Date(castAt);
  if (Number.isNaN(date.getTime())) throw new Error("起卦时间无效");
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hourBranchNumber = Math.floor(((date.getHours() + 1) % 24) / 2) + 1;
  const first = year + month + day;
  const second = first + hourBranchNumber;
  const result = calculateMeihuaFromNumbers(first, second);
  return {
    ...result,
    method: "时间起卦",
    derivation: `取公历年、月、日之和 ${first} 为上卦数，加时辰序数 ${hourBranchNumber} 得 ${second} 为下卦数；${result.derivation}`,
    calculationVersion: "meihua-time-v1",
  };
}
