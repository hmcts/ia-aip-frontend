import { asBooleanValue, hasInflightTimeExtension, nowAppealDate, toIsoDate } from '../../../app/utils/utils';
import { expect } from '../../utils/testUtils';

describe('utils', () => {
  describe('asBooleanValue', () => {
    it('should be true', () => {
      expect(asBooleanValue(1)).to.be.eq(true);
      expect(asBooleanValue('1')).to.be.eq(true);
      expect(asBooleanValue('true')).to.be.eq(true);
      expect(asBooleanValue('True')).to.be.eq(true);
      expect(asBooleanValue('TRUE')).to.be.eq(true);
      expect(asBooleanValue('yes')).to.be.eq(true);
      expect(asBooleanValue('Yes')).to.be.eq(true);
      expect(asBooleanValue('YES')).to.be.eq(true);
      expect(asBooleanValue('on')).to.be.eq(true);
      expect(asBooleanValue('On')).to.be.eq(true);
      expect(asBooleanValue('ON')).to.be.eq(true);
    });
    it('should be false', () => {
      expect(asBooleanValue(0)).to.be.eq(false);
      expect(asBooleanValue('0')).to.be.eq(false);
      expect(asBooleanValue('false')).to.be.eq(false);
      expect(asBooleanValue('False')).to.be.eq(false);
      expect(asBooleanValue('FALSE')).to.be.eq(false);
      expect(asBooleanValue('no')).to.be.eq(false);
      expect(asBooleanValue('No')).to.be.eq(false);
      expect(asBooleanValue('NO')).to.be.eq(false);
      expect(asBooleanValue('off')).to.be.eq(false);
      expect(asBooleanValue('Off')).to.be.eq(false);
      expect(asBooleanValue('OFF')).to.be.eq(false);
    });
    it('should be false if its null or undefined', () => {
      expect(asBooleanValue(null)).to.be.eq(false);
      expect(asBooleanValue(undefined)).to.be.eq(false);
    });

    it('should be false for special cases', () => {
      expect(asBooleanValue('')).to.be.eq(false);
      expect(asBooleanValue('undefined')).to.be.eq(false);
      expect(asBooleanValue('null')).to.be.eq(false);
    });

    it('should not transform booleans', () => {
      expect(asBooleanValue(true)).to.be.eq(true);
      expect(asBooleanValue(false)).to.be.eq(false);
    });
  });

  describe('nowAppealDate', () => {
    it('gets an appeal date for today', () => {
      expect(nowAppealDate().year).to.be.eq(new Date().getFullYear());
      expect(nowAppealDate().month).to.be.eq(new Date().getMonth() + 1);
      expect(nowAppealDate().day).to.be.eq(new Date().getDate());
    });
  });

  describe('toIsoDate', () => {
    it('converts date correctly', () => {
      expect(toIsoDate({ year: 2020, month: 1, day: 1 })).to.be.eq('2020-01-01');
      expect(toIsoDate({ year: 2020, month: 12, day: 30 })).to.be.eq('2020-12-30');
    });

    it('handles leap year', () => {
      expect(toIsoDate({ year: 2020, month: 2, day: 29 })).to.be.eq('2020-02-29');
    });

    it('handles summer time year', () => {
      expect(toIsoDate({ year: 2020, month: 3, day: 30 })).to.be.eq('2020-03-30');
    });
  });

  describe('hasInflightTimeExtension', () => {
    it('does not have inflight appeals if no time extensions', () => {
      const inflightTimeExtension = hasInflightTimeExtension({
        timeExtensions: [],
        appealStatus: 'currentState'
      } as Appeal);
      expect(inflightTimeExtension).to.be.eq(false);
    });

    it('does not have inflight appeals if previous time extension for different state', () => {
      const inflightTimeExtension = hasInflightTimeExtension({
        timeExtensions: [{
          status: 'submitted',
          state: 'oldState'
        }],
        appealStatus: 'currentState'
      } as Appeal);
      expect(inflightTimeExtension).to.be.eq(false);
    });

    it('does not have inflight appeals if previous time extension not submitted', () => {
      const inflightTimeExtension = hasInflightTimeExtension({
        timeExtensions: [{
          status: 'rejected',
          state: 'currentState'
        }],
        appealStatus: 'currentState'
      } as Appeal);
      expect(inflightTimeExtension).to.be.eq(false);
    });

    it('has inflight appeal', () => {
      const inflightTimeExtension = hasInflightTimeExtension({
        timeExtensions: [{
          status: 'submitted',
          state: 'currentState'
        }],
        appealStatus: 'currentState'
      } as Appeal);
      expect(inflightTimeExtension).to.be.eq(true);
    });
  });
});
