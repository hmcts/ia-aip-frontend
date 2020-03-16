import { asBooleanValue } from '../../../app/utils/utils';
import { expect } from '../../utils/testUtils';

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
