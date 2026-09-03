import { describe, expect, it } from "vitest";
import { calculateMeihuaFromNumbers } from "@/lib/meihua";

describe("梅花易数取数", () => {
  it("余数为 0 时按 8/6 取值", () => {
    const result = calculateMeihuaFromNumbers(8, 4);
    expect(result.base.upper.name).toBe("坤");
    expect(result.movingPosition).toBe(6);
  });
  it("生成本卦、互卦与变卦", () => {
    const result = calculateMeihuaFromNumbers(3, 5);
    expect(result.base.name).toBeTruthy();
    expect(result.changed.name).toBeTruthy();
    expect(result.mutual.name).toBeTruthy();
  });
});
