import * as DateFNS from 'date-fns';

const ISO_DATE_REGEXP =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export enum DateTimeFormat {
  NumericShort = 'yyyy-MM-dd',
  NumericLong = 'yyyy-MM-dd, HH:mm:ss',
  Timestamp = 'yyyyMMddHHmmss',
}

export const $DateTime = {
  compareTimestampsLt: (timestamp1: string, timestamp2: string): number => {
    if (timestamp1 < timestamp2) return -1;
    if (timestamp1 > timestamp2) return 1;
    return 0;
  },

  compareTimestampsGt: (timestamp1: string, timestamp2: string): number => {
    if (timestamp1 < timestamp2) return 1;
    if (timestamp1 > timestamp2) return -1;
    return 0;
  },

  isISODate: (date: unknown): boolean => {
    return typeof date === 'string' && ISO_DATE_REGEXP.test(date);
  },

  isTimestamp: (maybeTimestamp: string): boolean => {
    const date = DateFNS.parse(
      maybeTimestamp,
      DateTimeFormat.Timestamp,
      new Date(),
    );
    return !isNaN(date.getTime());
  },

  timestamp: () => {
    return DateFNS.format(new Date(), DateTimeFormat.Timestamp);
  },

  formatDate: (date: Date, format: DateTimeFormat) => {
    return DateFNS.format(date, format);
  },

  formatTimestamp: (timestamp: string, format: DateTimeFormat) => {
    const date = DateFNS.parse(timestamp, DateTimeFormat.Timestamp, new Date());
    return isNaN(date.getTime()) ? '-' : DateFNS.format(date, format);
  },

  fromTimestamp: (timestamp: string): Date => {
    return DateFNS.parse(timestamp, DateTimeFormat.Timestamp, new Date());
  },
};
