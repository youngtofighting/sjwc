import { astro } from "iztro";
import type { BirthInput, ZiweiPalace, ZiweiResult } from "@/lib/types";

const palaceNames = ["命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄", "迁移", "交友", "官禄", "田宅", "福德", "父母"];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const stars = ["紫微", "天机", "太阳", "武曲", "天同", "廉贞", "天府", "太阴", "贪狼", "巨门", "天相", "天梁"];

function fallbackZiwei(input: BirthInput): ZiweiResult {
  const seed = [...input.date.replaceAll("-", ""), ...(input.time ?? "00:00").replace(":", "")]
    .reduce((sum, char) => sum + Number(char || 0), 0);
  const palaces: ZiweiPalace[] = palaceNames.map((name, index) => {
    const starIndex = (seed + index * 3) % stars.length;
    return {
      name,
      branch: branches[(seed + index) % 12],
      majorStars: [stars[starIndex], stars[(starIndex + 5) % stars.length]],
      minorStars: ["左辅", "右弼", "文昌", "文曲"].filter((_, minorIndex) => (seed + index + minorIndex) % 3 === 0),
      transformations: index < 4 ? ["禄", "权", "科", "忌"][index] ? [`化${["禄", "权", "科", "忌"][index]}`] : [] : [],
      decadalRange: `${Math.floor(index / 2) * 10 + 3}–${Math.floor(index / 2) * 10 + 12}岁`,
    };
  });
  const life = palaces[0];
  return {
    source: "fallback",
    summary: [
      { label: "命宫", value: `${life.branch}宫 · ${life.majorStars.join("、")}` },
      { label: "身宫", value: `${palaces[6].branch}宫 · ${palaces[6].majorStars[0]}` },
      { label: "五行局", value: ["水二局", "木三局", "金四局", "土五局", "火六局"][seed % 5] },
      { label: "规则集", value: "紫微十二宫基础布局（MVP）" },
    ],
    palaces,
    calculationVersion: "ziwei-fallback-v1",
    warning: "当前为稳定可展示的十二宫 MVP 布局。正式商用前应接入并验证完整紫微排盘库（如 iztro），并公开采用的流派规则。",
  };
}

function timeIndex(time: string): number {
  const hour = Number(time.slice(0, 2));
  if (hour === 0) return 0;
  if (hour === 23) return 12;
  return Math.floor((hour + 1) / 2);
}

// 将 iztro 的完整星盘归一化为前端稳定的数据结构；异常时再使用明确标注的 fallback。
export function calculateZiwei(input: BirthInput): ZiweiResult {
  try {
    const chart = astro.bySolar(input.date, timeIndex(input.time ?? "12:00"), input.genderRule === "male" ? "男" : "女", true, "zh-CN");
    const palaces = chart.palaces.map((palace) => {
      const allStars = [...palace.majorStars, ...palace.minorStars];
      return {
        name: palace.name,
        branch: palace.earthlyBranch,
        majorStars: palace.majorStars.map((star) => star.name),
        minorStars: palace.minorStars.map((star) => star.name),
        transformations: allStars.filter((star) => star.mutagen).map((star) => `${star.name}化${star.mutagen}`),
        decadalRange: `${palace.decadal.range[0]}–${palace.decadal.range[1]}岁`,
      };
    });
    return {
      source: "iztro",
      summary: [
        { label: "命宫", value: `${chart.earthlyBranchOfSoulPalace}宫` },
        { label: "身宫", value: `${chart.earthlyBranchOfBodyPalace}宫` },
        { label: "五行局", value: chart.fiveElementsClass },
        { label: "命主 / 身主", value: `${chart.soul} / ${chart.body}` },
        { label: "规则集", value: "iztro 默认算法 · 公历排盘 · 闰月修正" },
      ],
      palaces,
      calculationVersion: "iztro-v2-default",
    };
  } catch {
    return fallbackZiwei(input);
  }
}
