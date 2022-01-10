import ErrorReport from './ErrorReport';

export const $String = {
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  compareLt: (str1: string, str2: string): number => {
    if (str1 < str2) return -1;
    if (str1 > str2) return 1;
    return 0;
  },

  compareGt: (str1: string, str2: string): number => {
    if (str1 < str2) return 1;
    if (str1 > str2) return -1;
    return 0;
  },

  validateIsNotEmpty: (str: string): ErrorReport | undefined =>
    str == ''
      ? ErrorReport.from('String.validateIsNotEmpty: Cannot be empty')
      : undefined,

  validateIsNotEmptyAsync: async (
    str: string,
  ): Promise<ErrorReport | undefined> =>
    str == ''
      ? ErrorReport.from('String.validateIsNotEmptyAsync: Cannot be empty')
      : undefined,
};
