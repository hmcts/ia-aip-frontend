import moment from 'moment';

/**
 * Main format used within the app should format the date to: "21 April 2020"
 */
const dayMonthYearFormat = 'DD MMMM YYYY';
const timeFormat = 'h:mm a';
const dateTimeFormat = 'DD MMMM YYYY HH:mm';

export const addDaysToDate = (days: number) => {
  return moment().add(days,'days').format(dayMonthYearFormat);
};

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  // Handle Date objects directly
  if (date instanceof Date) {
    return moment(date).format(dayMonthYearFormat);
  }

  // For strings, try native Date parsing first to avoid moment fallback errors
  if (typeof date === 'string') {
    const nativeDate = new Date(date);
    if (!isNaN(nativeDate.getTime())) {
      return moment(nativeDate).format(dayMonthYearFormat);
    }
  }

  return '';
};

export {
  dayMonthYearFormat,
  formatDate,
  timeFormat,
  dateTimeFormat
};
