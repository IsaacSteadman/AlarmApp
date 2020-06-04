import { addDays, endOfMonth, subDays, differenceInDays, endOfDay, startOfDay, isAfter } from "date-fns";
import { Action } from "./Action";

export type AlarmType = 'basic' | 'date-condition';

interface BaseAlarm {
  name: string;
  type: AlarmType;
  action: Action | { name: string };
  priority: number;
  negateAction: boolean;
}

interface BaseDayGroupSelector {
  type: string;
}

export interface WeekDayGroupSelector extends BaseDayGroupSelector {
  type: 'dow';
  daysOfWeek: [boolean, boolean, boolean, boolean, boolean, boolean, boolean] // Sunday @ index 0 to Monday @ index 1 to Saturday @ index 6
}

export interface CustomDayGroupSelector extends BaseDayGroupSelector {
  type: 'day-group';
  group: DayGroup | { name: string };
}

export interface DayGroup {
  name: string;
  days: (BaseDaySelector | { name: string })[];
}

interface BaseDaySelector {
  name: string;
  type: string;
}

export interface ExactDateDaySelector extends BaseDaySelector {
  type: 'exact-date';
  month: number;
  day: number;
}

// the first week of the month is the first complete week of the month
// a complete week of a month is a week in which all of its days starting from sunday and ending in saturday reside in that month
export interface DayOfNthWeekOfMonthSelector extends BaseDaySelector {
  type: 'donwom';
  month: number;
  dayOfWeek: number;
  n: number;
  // if n is negative then it is assumed that n indicates which last week
  // examples:
  //   n=-1 is the last complete week
  //   n=-2 is the second to the last complete week
}

export interface NthDayOfWeekOfMonthSelector extends BaseDaySelector {
  type: 'ndowom';
  month: number;
  dayOfWeek: number;
  n: number;
  // if n is negative then it is assumed that n indicates which last week
  // examples (assuming dayOfWeek = 1 or monday):
  //   n=-1 is the last monday of the month
  //   n=-2 is the second to the last monday
}

// the day must be observed on a week day (not weekend)
// the day will be observed on the Friday of the week if the date falls on the Saturday of that week
// the day will be observed on the Monday of the week if the date falls on the Sunday of that week
export interface DayMustBeObservedOnWeekDaySelector extends BaseDaySelector {
  type: 'dmboowd';
  month: number;
  day: number;
}

export interface DayOfWeekAfterFullMoonAfterDayOfMonthSelector extends BaseDaySelector {
  type: 'dowafmadom';
  startMonth: number;
  startDay: number;
  dayOfWeekAfterFullMoon: number;
}

export interface DayRelativeToOtherDaySelector extends BaseDaySelector {
  type: 'drtod';
  relativeDay: DaySelector | { name: string };
  daysRelative: number; // 0 is the day of, 1 is the day after, -1 is the day before
}

export type DaySelector = ExactDateDaySelector | DayOfNthWeekOfMonthSelector | NthDayOfWeekOfMonthSelector | DayMustBeObservedOnWeekDaySelector | DayOfWeekAfterFullMoonAfterDayOfMonthSelector | DayRelativeToOtherDaySelector;

export type DayGroupSelector = WeekDayGroupSelector | CustomDayGroupSelector;

export interface BasicAlarm extends BaseAlarm {
  type: 'basic';
  days: DayGroupSelector;
  hour: number;
  minute: number;
  isPM: boolean;
}

export type Alarm = BasicAlarm;

export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export function dayNumberToNth(n: number): string {
  n += 1;
  if (n === 11 || n === 12 || n === 13) {
    return `${n}th`;
  } else if (n % 10 === 1) {
    return `${n}st`;
  } else if (n % 10 === 2) {
    return `${n}nd`;
  } else if (n % 10 === 3) {
    return `${n}rd`;
  } else {
    return `${n}th`;
  }
}

function donwomToString(day: DayOfNthWeekOfMonthSelector): string {
  if (day.n >= 0) {
    return `The ${dayNames[day.dayOfWeek]} of the ${dayNumberToNth(day.n)} complete week of ${monthNames[day.month]}`;
  } else if (day.n === -1) {
    return `The ${dayNames[day.dayOfWeek]} of the last complete week of ${monthNames[day.month]}`;
  } else {
    return `The ${dayNames[day.dayOfWeek]} of the ${dayNumberToNth(-day.n - 1)} to last complete week of ${monthNames[day.month]}`;
  }
}

function ndowomToString(day: NthDayOfWeekOfMonthSelector): string {
  if (day.n >= 0) {
    return `The ${dayNumberToNth(day.n)} ${dayNames[day.dayOfWeek]} of ${monthNames[day.month]}`;
  } else if (day.n === -1) {
    return `The last ${dayNames[day.dayOfWeek]} of ${monthNames[day.month]}`;
  } else {
    return `The ${dayNumberToNth(-day.n - 1)} to last ${dayNames[day.dayOfWeek]} of ${monthNames[day.month]}`;
  }
}

function exactDateToString(day: ExactDateDaySelector): string {
  return `The ${dayNumberToNth(day.day)} of ${monthNames[day.month]}`;
}

function dmboowdToString(day: DayMustBeObservedOnWeekDaySelector): string {
  return `The closest weekday to the ${dayNumberToNth(day.day)} of ${monthNames[day.month]}`;
}

function dowafmadomToString(day: DayOfWeekAfterFullMoonAfterDayOfMonthSelector): string {
  return `The ${dayNames[day.dayOfWeekAfterFullMoon]} after the first full moon on or after the ${dayNumberToNth(day.startDay)} of ${monthNames[day.startMonth]}`;
}

function drtodToString(day: DayRelativeToOtherDaySelector): string {
  if (day.daysRelative === 0) {
    return `On ${day.relativeDay.name}`;
  } else if (day.daysRelative === -1) {
    return `The day before ${day.relativeDay.name}`;
  } else if (day.daysRelative === 1) {
    return `The day after ${day.relativeDay.name}`;
  } else if (day.daysRelative < 0) {
    return `${-day.daysRelative} days before ${day.relativeDay.name}`;
  } else {
    return `${day.daysRelative} days after ${day.relativeDay.name}`;
  }
}

const LEN_LUNAR = 29.530588853;

export function dayToString(day: DaySelector): string {
  if (day.type === 'exact-date') {
    return exactDateToString(day);
  } else if (day.type === 'donwom') {
    return donwomToString(day);
  } else if (day.type === 'ndowom') {
    return ndowomToString(day);
  } else if (day.type === 'dmboowd') {
    return dmboowdToString(day);
  } else if (day.type === 'dowafmadom') {
    return dowafmadomToString(day);
  } else if (day.type === 'drtod') {
    return drtodToString(day)
  }
  throw new TypeError(`unrecognized day selector type: ${JSON.stringify(day)}`);
}


const knownNewMoon = new Date(1900, 0, 1);
const knownFullMoon = new Date(2020, 3, 7, 17, 35);

function fullMoonCalc(d: Date) {
  const diff = differenceInDays(d, knownFullMoon);
  return diff % LEN_LUNAR;
}

function fullMoonCalc1(d: Date) {
  let diff = fullMoonCalc(d)
  if (diff >= LEN_LUNAR / 2) {
    diff -= LEN_LUNAR;
  }
  return diff;
}
function fullMoonCalc2(d: Date) {
  const e = endOfDay(d);
  const b = startOfDay(d);
  return Math.abs(fullMoonCalc1(b)) + Math.abs(fullMoonCalc1(e));
}
function isFullMoon(d: Date) {
  return fullMoonCalc2(d) < 1.01;
}

export function findDayInYear(yearNum: number, ds: DaySelector): Date {
  if (ds.type === 'donwom') {
    let d = new Date(yearNum, ds.month, 1);
    if (ds.n >= 0) {
      while (d.getDay() !== 0) {
        d = addDays(d, 1);
      }
    } else {
      d = endOfMonth(d);
      while (d.getDay() !== 6) {
        d = subDays(d, 1);
      }
    }
  } else if (ds.type === 'ndowom') {
    let d = new Date(yearNum, ds.month, 1);
    if (ds.n >= 0) {
      while (d.getDay() !== ds.dayOfWeek) {
        d = addDays(d, 1);
      }
      let i = 0;
      while (i < ds.n) {
        d = addDays(d, 7);
        ++i;
      }
    } else {
      d = endOfMonth(d);
      while (d.getDay() !== ds.dayOfWeek) {
        d = subDays(d, 1);
      }
      let i = 1;
      while (i < -ds.n) {
        d = subDays(d, 7);
        ++i;
      }
    }
    if (d.getMonth() !== ds.month) return null;
    return d;
  } else if (ds.type === 'dmboowd') {
    let d = new Date(yearNum, ds.month, ds.day + 1);
    if (d.getDay() === 0) {
      d = addDays(d, 1);
    } else if (d.getDate() === 6) {
      d = subDays(d, 1);
    }
    return d;
  } else if (ds.type === 'drtod') {
    let d = findDayInYear(yearNum, ds.relativeDay as DaySelector);
    if (d != null) {
      if (ds.daysRelative > 0) {
        d = addDays(d, ds.daysRelative);
      } else if (ds.daysRelative < 0) {
        d = subDays(d, -ds.daysRelative);
      }
    }
    return d;
  } else if (ds.type === 'exact-date') {
    return new Date(yearNum, ds.month, ds.day + 1)
  } else if (ds.type === 'dowafmadom') {
    let d = new Date(yearNum, ds.startMonth, ds.startDay + 1);
    while (!isFullMoon(d)) {
      d = addDays(d, 1);
    }
    d = addDays(d, 1);
    while (d.getDay() !== ds.dayOfWeekAfterFullMoon) {
      d = addDays(d, 1);
    }
    return d;
  }
  throw new TypeError(`unexpected day selector ${JSON.stringify(ds)}`);
}

export function selectNextDay(today: Date, ds: DaySelector): Date {
  let date = findDayInYear(today.getFullYear(), ds);
  if (isAfter(today, date)) {
    date = findDayInYear(today.getFullYear() + 1, ds);
  }
  return startOfDay(date);
}
