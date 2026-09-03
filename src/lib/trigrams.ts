import type { Hexagram, Trigram } from "@/lib/types";

export const TRIGRAMS: Trigram[] = [
  { id: 1, name: "乾", symbol: "☰", element: "金", lines: [true, true, true] },
  { id: 2, name: "兑", symbol: "☱", element: "金", lines: [true, true, false] },
  { id: 3, name: "离", symbol: "☲", element: "火", lines: [true, false, true] },
  { id: 4, name: "震", symbol: "☳", element: "木", lines: [true, false, false] },
  { id: 5, name: "巽", symbol: "☴", element: "木", lines: [false, true, true] },
  { id: 6, name: "坎", symbol: "☵", element: "水", lines: [false, true, false] },
  { id: 7, name: "艮", symbol: "☶", element: "土", lines: [false, false, true] },
  { id: 8, name: "坤", symbol: "☷", element: "土", lines: [false, false, false] },
];

const names = [
  ["乾为天", "天泽履", "天火同人", "天雷无妄", "天风姤", "天水讼", "天山遁", "天地否"],
  ["泽天夬", "兑为泽", "泽火革", "泽雷随", "泽风大过", "泽水困", "泽山咸", "泽地萃"],
  ["火天大有", "火泽睽", "离为火", "火雷噬嗑", "火风鼎", "火水未济", "火山旅", "火地晋"],
  ["雷天大壮", "雷泽归妹", "雷火丰", "震为雷", "雷风恒", "雷水解", "雷山小过", "雷地豫"],
  ["风天小畜", "风泽中孚", "风火家人", "风雷益", "巽为风", "风水涣", "风山渐", "风地观"],
  ["水天需", "水泽节", "水火既济", "水雷屯", "水风井", "坎为水", "水山蹇", "水地比"],
  ["山天大畜", "山泽损", "山火贲", "山雷颐", "山风蛊", "山水蒙", "艮为山", "山地剥"],
  ["地天泰", "地泽临", "地火明夷", "地雷复", "地风升", "地水师", "地山谦", "坤为地"],
];

export function trigramFromLines(lines: boolean[]): Trigram {
  const found = TRIGRAMS.find((item) => item.lines.every((line, index) => line === lines[index]));
  if (!found) throw new Error("无法识别三爻卦");
  return found;
}

export function trigramFromNumber(input: number): Trigram {
  const normalized = ((input - 1) % 8 + 8) % 8;
  return TRIGRAMS[normalized];
}

export function hexagramFromLines(lines: boolean[]): Hexagram {
  if (lines.length !== 6) throw new Error("六爻卦必须有六个爻");
  const lower = trigramFromLines(lines.slice(0, 3));
  const upper = trigramFromLines(lines.slice(3, 6));
  return { name: names[upper.id - 1][lower.id - 1], upper, lower, lines };
}

export function mutualHexagram(lines: boolean[]): Hexagram {
  return hexagramFromLines([lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]]);
}

export function elementRelation(body: string, use: string): string {
  const produces: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  if (body === use) return "体用比和：同气相求，宜守住已有条件。";
  if (produces[body] === use) return "体生用：需投入精力与资源，宜量力而为。";
  if (produces[use] === body) return "用生体：外部条件有助力，宜把握支持。";
  if (produces[body] === produces[use]) return "体克用：主动性较强，宜明确推进边界。";
  return "用克体：外部阻力较多，宜放缓节奏、先补足条件。";
}
