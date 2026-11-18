import { addDaysAndFormat, addDaysToDate, formatDate } from '../../../app/utils/date-utils';
import { expect, sinon } from '../../utils/testUtils';

describe('Date utils', () => {
  let sandbox: sinon.SinonSandbox;
  const validDateStringOne = '1969-04-01';
  const validDateStringTwo = '13 July 1969';
  const validDateStringThree = '2000-10-30T18:00:15.124Z';
  const validDateStringExtra = '01-10-2022';
  const formattedStringOne = '01 April 1969';
  const formattedStringTwo = '13 July 1969';
  const formattedStringThree = '30 October 2000';
  const formattedStringExtra = '10 January 2022';
  const invalidDate = 'Invalid date';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('addDaysToDate', () => {
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
      clock = sandbox.useFakeTimers(new Date('2025-03-25'));
    });

    afterEach(() => {
      clock.restore();
    });
    it('addDaysToDate works for positive days and formats', () => {
      expect(addDaysToDate(10)).to.equal('04 April 2025');
    });

    it('addDaysToDate works for negative days and formats', () => {
      expect(addDaysToDate(-10)).to.equal('15 March 2025');
    });

    it('addDaysToDate works for no days and formats', () => {
      expect(addDaysToDate(0)).to.equal('25 March 2025');
    });
  });

  describe('formatDate', () => {
    it('formatDate works for invalid date when strict false', () => {
      expect(formatDate('somedate')).to.equal(invalidDate);
    });

    it('formatDate works for invalid date when strict true', () => {
      expect(formatDate('somedate', true)).to.equal(invalidDate);
    });

    it('formatDate works for good format date one when strict false', () => {
      expect(formatDate(validDateStringOne)).to.equal(formattedStringOne);
    });

    it('formatDate works for good format date two when strict false', () => {
      expect(formatDate(validDateStringTwo)).to.equal(formattedStringTwo);
    });

    it('formatDate works for good format date three when strict false', () => {
      expect(formatDate(validDateStringThree)).to.equal(formattedStringThree);
    });

    it('formatDate works for bad valid format date when strict false', () => {
      expect(formatDate(validDateStringExtra)).to.equal(formattedStringExtra);
    });

    it('formatDate works for good format date one when strict true', () => {
      expect(formatDate(validDateStringOne)).to.equal(formattedStringOne);
    });

    it('formatDate works for good format date two when strict true', () => {
      expect(formatDate(validDateStringTwo, true)).to.equal(formattedStringTwo);
    });

    it('formatDate works for good format date three when strict true', () => {
      expect(formatDate(validDateStringThree, true)).to.equal(formattedStringThree);
    });

    it('formatDate does not work for bad valid format date when strict true', () => {
      expect(formatDate(validDateStringExtra, true)).to.equal(invalidDate);
    });
  });

  describe('addDaysAndFormat', () => {
    it('addDaysAndFormat works for invalid date when strict false', () => {
      expect(addDaysAndFormat('somedate', 0)).to.equal(invalidDate);
    });

    it('addDaysAndFormat works for invalid date when strict true', () => {
      expect(addDaysAndFormat('somedate', 0, true)).to.equal(invalidDate);
    });

    it('addDaysAndFormat works for good format date one when strict false', () => {
      expect(addDaysAndFormat(validDateStringOne, 0)).to.equal(formattedStringOne);
    });

    it('addDaysAndFormat works for good format date two when strict false', () => {
      expect(addDaysAndFormat(validDateStringTwo, 0)).to.equal(formattedStringTwo);
    });

    it('addDaysAndFormat works for good format date three when strict false', () => {
      expect(addDaysAndFormat(validDateStringThree, 0)).to.equal(formattedStringThree);
    });

    it('addDaysAndFormat works for bad valid format date when strict false', () => {
      expect(addDaysAndFormat(validDateStringExtra, 0)).to.equal(formattedStringExtra);
    });

    it('addDaysAndFormat works for good format date one when strict true', () => {
      expect(addDaysAndFormat(validDateStringOne, 0)).to.equal(formattedStringOne);
    });

    it('addDaysAndFormat works for good format date two when strict true', () => {
      expect(addDaysAndFormat(validDateStringTwo, 0, true)).to.equal(formattedStringTwo);
    });

    it('addDaysAndFormat works for good format date three when strict true', () => {
      expect(addDaysAndFormat(validDateStringThree, 0, true)).to.equal(formattedStringThree);
    });

    it('addDaysAndFormat does not work for bad valid format date when strict true', () => {
      expect(addDaysAndFormat(validDateStringExtra, 0, true)).to.equal(invalidDate);
    });

    it('addDaysAndFormat works for positive days', () => {
      expect(addDaysAndFormat(validDateStringOne, 5)).to.equal('06 April 1969');
    });

    it('addDaysAndFormat works for negative days', () => {
      expect(addDaysAndFormat(validDateStringOne, -5)).to.equal('27 March 1969');
    });
  });
});
