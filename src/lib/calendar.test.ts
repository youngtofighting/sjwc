import { describe, expect, it } from "vitest";
import { calendarFromGregorian, hourBranch } from "@/lib/calendar";

describe("公农历与时辰", () => {
  it("将 2024 年春节转换为正月初一", () => {
    const result = calendarFromGregorian("2024-02-10", "12:00", "Asia/Shanghai");
    expect(result.lunar).toContain("正月初一");
  });
  it("23 点属于子时", () => expect(hourBranch("23:30")).toBe("子"));
});
