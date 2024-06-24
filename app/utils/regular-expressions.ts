const firstRegexSection = '^\\s*([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z]\\d{1,2})|';
const secondRegexSection = '(([A-Za-z][A-Ha-hJ-Yj-y]\\d{1,2})|(([A-Za-z]\\d[A-Za-z])|';
const thirdRegexSection = '([A-Za-z][A-Ha-hJ-Yj-y]\\d?[A-Za-z])))) \\d[A-Za-z]{2})\\s*$';

const postcodeRegex = new RegExp(firstRegexSection + secondRegexSection + thirdRegexSection);

export {
  postcodeRegex
};
