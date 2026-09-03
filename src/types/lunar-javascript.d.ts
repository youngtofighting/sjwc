declare module "lunar-javascript" {
  interface EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
  }
  interface Lunar {
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getMonth(): number;
    getYearInGanZhi(): string;
    getYearShengXiao(): string;
    getJieQi?(): string;
    getEightChar(): EightChar;
  }
  export const Solar: {
    fromYmd(year: number, month: number, day: number): { getLunar(): Lunar };
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): { getLunar(): Lunar };
  };
}
