import { describe, expect, it } from "vitest";
import { calculateLiuYao } from "@/lib/liuyao";

describe("六爻三钱法", () => {
  it("6 为老阴，变为阳；9 为老阳，变为阴", () => {
    const result = calculateLiuYao([[2, 2, 2], [3, 3, 3], [2, 2, 3], [2, 3, 3], [2, 2, 3], [2, 3, 3]]);
    expect(result.lines[0].nature).toBe("阴");
    expect(result.lines[0].changedNature).toBe("阳");
    expect(result.lines[1].nature).toBe("阳");
    expect(result.lines[1].changedNature).toBe("阴");
    expect(result.movingPositions).toEqual([1, 2]);
  });
  it("按初爻到上爻保留六次记录", () => {
    const record = Array.from({ length: 6 }, () => [2, 2, 3] as const);
    expect(calculateLiuYao(record.map((line) => [...line])).castRecord).toHaveLength(6);
  });
});
