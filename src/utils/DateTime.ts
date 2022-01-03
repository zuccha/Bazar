import format from 'date-fns/format';

const ISO_DATE_REGEXP =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export const $DateTime = {
  isISODate: (date: unknown): boolean => {
    return typeof date === 'string' && ISO_DATE_REGEXP.test(date);
  },

  timestamp: () => {
    return format(new Date(), 'yyyyMMddHHmmss');
  },
};
