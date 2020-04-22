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
  const date = new Date(`${appealDate.year}-${appealDate.month}-${appealDate.day}`);
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
