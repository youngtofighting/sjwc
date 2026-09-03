import { describe, expect, it } from "vitest";
import { hexagramFromLines, mutualHexagram, trigramFromNumber } from "@/lib/trigrams";

describe("八卦与六十四卦", () => {
  it("将余数 0 按八处理", () => expect(trigramFromNumber(8).name).toBe("坤"));
  it("正确识别乾为天", () => expect(hexagramFromLines([true, true, true, true, true, true]).name).toBe("乾为天"));
  it("从六爻生成互卦", () => expect(mutualHexagram([true, false, true, false, true, false]).lines).toHaveLength(6));
});
