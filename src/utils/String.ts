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
};
