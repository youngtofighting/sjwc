import { Solar } from "lunar-javascript";
import type { CalendarInfo } from "@/lib/types";

const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export function hourBranch(time?: string): string | undefined {
  if (!time) return undefined;
  const hour = Number(time.slice(0, 2));
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return undefined;
  return branches[Math.floor(((hour + 1) % 24) / 2)];
}

export function parseDate(date: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error("请填写有效的公历日期");
  const [year, month, day] = match.slice(1).map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (candidate.getUTCFullYear() !== year || candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) {
    throw new Error("日期不存在");
  }
  return { year, month, day };
}

export function calendarFromGregorian(date: string, time: string | undefined, timezone: string): CalendarInfo {
  const { year, month, day } = parseDate(date);
  const [hour, minute] = (time ?? "12:00").split(":").map(Number);
  const solar = Solar.fromYmdHms(year, month, day, hour || 0, minute || 0, 0);
  const lunar = solar.getLunar();
  const monthNumber = lunar.getMonth();
  const isLeapMonth = monthNumber < 0;
  const solarTerm = lunar.getJieQi?.() || undefined;

  return {
    gregorian: time ? `${date} ${time}` : date,
    lunar: `${lunar.getYearInChinese()}年${isLeapMonth ? "闰" : ""}${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    lunarYear: lunar.getYearInGanZhi(),
    lunarMonth: lunar.getMonthInChinese(),
    lunarDay: lunar.getDayInChinese(),
    isLeapMonth,
    zodiac: lunar.getYearShengXiao(),
    solarTerm,
    hourBranch: hourBranch(time),
    timezone,
    ruleSet: "lunar-javascript + 民用标准时间（v1）",
  };
}
