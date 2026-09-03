export type Mode = "lifelong" | "question";
export type GenderRule = "male" | "female";
export type DayBoundaryRule = "zi_hour" | "midnight";
export type CoinValue = 2 | 3;

export interface BirthInput {
  date: string;
  time?: string;
  timezone: string;
  birthplace?: string;
  genderRule?: GenderRule;
  dayBoundaryRule: DayBoundaryRule;
}

export interface QuestionInput {
  question: string;
  category: string;
  castAt: string;
  timezone: string;
  liuYaoMethod: "three_coins_auto" | "three_coins_manual";
  coinThrows?: CoinValue[][];
  meiHuaMethod: "time" | "two_numbers";
  numbers?: [number, number];
}

export interface CalendarInfo {
  gregorian: string;
  lunar: string;
  lunarYear: string;
  lunarMonth: string;
  lunarDay: string;
  isLeapMonth: boolean;
  zodiac: string;
  solarTerm?: string;
  hourBranch?: string;
  timezone: string;
  ruleSet: string;
}

export interface Pillar {
  label: "年柱" | "月柱" | "日柱" | "时柱";
  value: string;
  stem: string;
  branch: string;
  hiddenStems: string[];
  element: string;
  yinYang: string;
  tenGod?: string;
  naYin?: string;
}

export interface BaziResult {
  calendar: CalendarInfo;
  pillars: Pillar[];
  elementCounts: Record<string, number>;
  luckCycles: Array<{ ganZhi: string; startAge: number; endAge: number; startYear: number; endYear: number }>;
  calculationVersion: string;
  warnings: string[];
}

export interface ZiweiPalace {
  name: string;
  branch: string;
  majorStars: string[];
  minorStars: string[];
  transformations: string[];
  decadalRange: string;
}

export interface ZiweiResult {
  source: "iztro" | "fallback";
  summary: Array<{ label: string; value: string }>;
  palaces: ZiweiPalace[];
  calculationVersion: string;
  warning?: string;
}

export interface Hexagram {
  name: string;
  upper: Trigram;
  lower: Trigram;
  lines: boolean[];
}

export interface Trigram {
  id: number;
  name: string;
  symbol: string;
  element: string;
  lines: boolean[];
}

export interface LiuYaoLine {
  position: number;
  label: string;
  coinTotal: number;
  nature: "阴" | "阳";
  moving: boolean;
  relative: string;
  branch: string;
  element: string;
  spirit: string;
  shiYing: "世" | "应" | "";
  changedNature: "阴" | "阳";
}

export interface LiuYaoResult {
  castRecord: CoinValue[][];
  base: Hexagram;
  changed: Hexagram;
  mutual: Hexagram;
  lines: LiuYaoLine[];
  movingPositions: number[];
  shiPosition: number;
  yingPosition: number;
  calculationVersion: string;
}

export interface MeiHuaResult {
  method: string;
  derivation: string;
  base: Hexagram;
  changed: Hexagram;
  mutual: Hexagram;
  movingPosition: number;
  body: Trigram;
  use: Trigram;
  relation: string;
  calculationVersion: string;
}

export interface DivinationResponse {
  mode: Mode;
  requestId: string;
  calculatedFacts: { bazi?: BaziResult; ziwei?: ZiweiResult; liuyao?: LiuYaoResult; meihua?: MeiHuaResult };
  interpretationNotice?: string;
}
