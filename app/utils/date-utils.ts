import moment from 'moment';

/**
 * Main format used within the app should format the date to: "21 April 2020"
 */
const dayMonthYearFormat = 'DD MMMM YYYY';
const timeFormat = 'h:mm a';
const dateTimeFormat = 'DD MMMM YYYY HH:mm';

const addDaysToDate = (days: number) => {
  return moment().add(days, 'days').format(dayMonthYearFormat);
};

const dateToMoment = (date: string, shouldStrictFormat?: boolean) => {
  if (shouldStrictFormat) {
    return moment(date, ['YYYY-MM-DD', 'DD MMMM YYYY', 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'], true);
  }
  return moment(date);
};

const formatDate = (date: string, shouldStrictFormat?: boolean) => {
  return dateToMoment(date, shouldStrictFormat).format(dayMonthYearFormat);
};

const addDaysAndFormat = (date: string, days: number, shouldStrictFormat?: boolean) => {
  return dateToMoment(date, shouldStrictFormat).add(days, 'days').format(dayMonthYearFormat);

};

export {
  addDaysToDate,
  dayMonthYearFormat,
  formatDate,
  addDaysAndFormat,
  timeFormat,
  dateTimeFormat
};
