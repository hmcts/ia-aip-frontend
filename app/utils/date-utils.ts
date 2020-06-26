import moment from 'moment';

/**
 * Main format used within the app should format the date to: "21 April 2020"
 */
const dayMonthYearFormat = 'DD MMMM YYYY';

export const addDaysToDate = (days: number) => {
  return moment().add(days,'days').format(dayMonthYearFormat);
};

const formatDate = (date: string) => {
  return moment(date).format(dayMonthYearFormat);
};

export {
  dayMonthYearFormat,
  formatDate
};
