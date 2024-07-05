const firstRegexSection = '^\\s*(([Gg][Ii][Rr] 0[Aa]{2})|';
const secondRegexSection = '((([A-Za-z]\\d{1,2})|';
const thirdRegexSection = '([A-Za-z][A-Ha-hJ-Yj-y]\\d{1,2})|';
const fourthRegexSection = '(([A-Za-z]\\d[A-Za-z])|';
const fifthRegexSection = '([A-Za-z][A-Ha-hJ-Yj-y]\\d?[A-Za-z])))';
const sixthRegexSection = '\\s?\\d[A-Za-z]{2}))\\s*$';
const postcodeRegex = new RegExp(firstRegexSection + secondRegexSection + thirdRegexSection
+ fourthRegexSection + fifthRegexSection + sixthRegexSection);

export {
  postcodeRegex
};
