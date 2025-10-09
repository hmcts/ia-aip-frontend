import { addDaysToDate, dayMonthYearFormat, formatDate } from '../../../app/utils/date-utils';
import { expect, sinon } from '../../utils/testUtils';

describe('date-utils', () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    // Freeze time for consistent test results
    clock = sinon.useFakeTimers(new Date('2023-10-01T00:00:00Z').getTime());
  });

  afterEach(() => {
    clock.restore();
  });

  describe('addDaysToDate', () => {
    it('should add the specified number of days to the current date', () => {
      const result = addDaysToDate(5);
      expect(result).to.equal('06 October 2023');
    });

    it('should handle negative days correctly', () => {
      const result = addDaysToDate(-3);
      expect(result).to.equal('28 September 2023');
    });

    it('should return today\'s date when adding 0 days', () => {
      const result = addDaysToDate(0);
      expect(result).to.equal('01 October 2023');
    });
  });

  describe('formatDate', () => {
    it('should format a valid Date object', () => {
      const date = new Date('2023-10-15T00:00:00Z');
      const result = formatDate(date);
      expect(result).to.equal('15 October 2023');
    });

    it('should format a valid date string', () => {
      const date = '2023-10-20';
      const result = formatDate(date);
      expect(result).to.equal('20 October 2023');
    });

    it('should return an empty string for an invalid date string', () => {
      const date = 'invalid-date';
      const result = formatDate(date);
      expect(result).to.equal('');
    });

    it('should return an empty string for null input', () => {
      const result = formatDate(null);
      expect(result).to.equal('');
    });

    it('should return an empty string for undefined input', () => {
      const result = formatDate(undefined);
      expect(result).to.equal('');
    });

    it('should return an empty string for an empty string input', () => {
      const result = formatDate('');
      expect(result).to.equal('');
    });
  });
});
