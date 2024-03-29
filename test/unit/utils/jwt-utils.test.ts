import { jwtRepack } from '../../../app/utils/jwt-repack';
import { isJWTExpired } from '../../../app/utils/jwt-utils';
import { expect, sinon } from '../../utils/testUtils';

function currentDateInSeconds() {
  return Math.round((new Date().getTime()) / 1000);
}

describe('JWT Utils', () => {
  let sandbox: sinon.SinonSandbox;
  const token = 'someExpiredToken';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('checks that a token is expired', () => {
    const dateInSeconds = currentDateInSeconds() - (24 * 60 * 60) * 7;

    const mockedDecodedToken = {
      'sub': 'someSubject',
      'exp': dateInSeconds
    };

    const stub = sandbox.stub(jwtRepack, 'decode').withArgs(token).callsFake(() => {
      return mockedDecodedToken;
    });

    const result = isJWTExpired(token);
    expect(stub).has.been.calledOnce;
    expect(result).eq(true);
  });

  it('checks that a token is expired taking into account the 5 minute offset', () => {
    const dateInSeconds = currentDateInSeconds() - 30;

    const mockedDecodedToken = {
      'sub': 'someSubject',
      'exp': dateInSeconds
    };

    const stub = sandbox.stub(jwtRepack, 'decode').withArgs(token).callsFake(() => {
      return mockedDecodedToken;
    });

    const result = isJWTExpired(token);
    expect(stub).has.been.calledOnce;
    expect(result).eq(true);
  });

  it('checks that a token is valid taking into account the 5 minute offset', () => {
    const justOverFiveMinutesInSeconds = 5 * 60 + 10;
    const dateInSeconds = currentDateInSeconds() + justOverFiveMinutesInSeconds;

    const mockedDecodedToken = {
      'sub': 'someSubject',
      'exp': dateInSeconds
    };

    const stub = sandbox.stub(jwtRepack, 'decode').withArgs(token).callsFake(() => {
      return mockedDecodedToken;
    });

    const result = isJWTExpired(token);
    expect(stub).has.been.calledOnce;
    expect(result).eq(false);
  });

  it('throws an exception if the token is not valid', () => {

    const token = 'someIncorrectToken';

    sandbox.stub(jwtRepack, 'decode').withArgs(token).callsFake(() => {
      throw new Error('Could not decode token decoding token');
    });

    expect(() => isJWTExpired(token)).to.throw(Error, 'Could not decode token decoding token');
  });

});
