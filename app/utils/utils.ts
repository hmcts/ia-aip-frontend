import _ from 'lodash';
import nl2br from 'nl2br';

/**
 * Translate primitive values to Boolean value
 * @param value the primitive value to be translated into a boolean
 */
export function asBooleanValue(value: string | number | boolean | null | undefined): boolean | undefined {
  if (typeof value === 'string') {
    const lowerCasedValue: string = value.toLowerCase();
    if (lowerCasedValue === 'true' || lowerCasedValue === 'yes' || lowerCasedValue === 'on') {
      return true;
    }
    return !!+value;
  }
  return !!value;
}

export function toIsoDate(appealDate: AppealDate) {
  const month = appealDate.month.toString().padStart(2, '0');
  const day = appealDate.day.toString().padStart(2, '0');
  const date = new Date(`${appealDate.year}-${month}-${day}`);
  const isoDate = date.toISOString().split('T')[0];
  return isoDate;
}

export function nowIsoDate() {
  return new Date().toISOString().split('T')[0];
}

export function nowAppealDate(): AppealDate {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate()
  } as AppealDate;
}

export function hasInflightTimeExtension(appeal: Appeal): boolean {
  return _.get(appeal, 'askForMoreTime.inFlight', false);
}

export function formatTextForCYA(text: string) {
  return nl2br(text.replace(/ /g, '&nbsp;'));
}

export function boolToYesNo(value: boolean) {
  return value === true ? 'Yes' : 'No';
}

export function yesNoToBool(answer: string): boolean {
  if (answer === 'Yes') {
    return true;
  } else if (answer === 'No') return false;
}
