import jwt from 'jsonwebtoken';
import { isJWTExpired } from '../../../app/utils/jwt-utils';
import { expect, sinon } from '../../utils/testUtils';

describe('JWT Utils', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('checks that a token is expired', () => {

    let dateOffset = (24 * 60 * 60 * 1000) * 7; // 7Days off-set
    let dateInMillis = new Date().getUTCMilliseconds() - dateOffset;

    const token = 'someExpiredToken';
    const mockedDecodedToken = {
      'sub': 'someSubject',
      'exp': dateInMillis
    };

    const stub = sandbox.stub(jwt, 'decode').withArgs(token).callsFake(() => {
      return mockedDecodedToken;
    });

    const result = isJWTExpired(token);
    expect(stub).has.been.calledOnce;
    expect(result).eq(true);
  });

  it('checks that a token is exoired taking into account the 20 seconds offset', () => {

    let dateOffset = (30 * 1000); // 30 seconds offset
    let dateInMillis = new Date().getUTCMilliseconds() - dateOffset;

    const token = 'someExpiredToken';
    const mockedDecodedToken = {
      'sub': 'someSubject',
      'exp': dateInMillis
    };

    const stub = sandbox.stub(jwt, 'decode').withArgs(token).callsFake(() => {
      return mockedDecodedToken;
    });

    const result = isJWTExpired(token);
    expect(stub).has.been.calledOnce;
    expect(result).eq(true);
  });

  it('checks that a token is valid taking into account the 20 seconds offset', () => {

    let dateInMillis = new Date().getUTCMilliseconds();

    const token = 'someExpiredToken';
    const mockedDecodedToken = {
      'sub': 'someSubject',
      'exp': dateInMillis
    };

    const stub = sandbox.stub(jwt, 'decode').withArgs(token).callsFake(() => {
      return mockedDecodedToken;
    });

    const result = isJWTExpired(token);
    expect(stub).has.been.calledOnce;
    expect(result).eq(false);
  });

  it('throws an exception if the token is not valid', () => {

    const token = 'someIncorrectToken';

    sandbox.stub(jwt, 'decode').withArgs(token).callsFake(() => {
      throw new Error('Could not decode token decoding token');
    });

    expect(() => isJWTExpired(token)).to.throw(Error, 'Could not decode token decoding token');

  });

});
