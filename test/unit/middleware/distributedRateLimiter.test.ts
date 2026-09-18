import {
  keyGenerator,
  skip,
  sendCommand
} from '../../../app/middleware/distributedRateLimiter';
import { redisClient } from '../../../app/redis/client';
import { expect, sinon } from '../../utils/testUtils';

describe('distributedRateLimiter', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('keyGenerator', () => {
    it('should use uid if present', () => {
      const req: any = {
        idam: {
          userDetails: {
            uid: '123'
          }
        }
      };

      const result = keyGenerator(req);

      expect(result).to.equal('rl:uid:123');
    });

    it('should fallback to ipKeyGenerator when uid missing', () => {
      const req: any = { ip: '127.0.0.1' };
      const result = keyGenerator(req);

      expect(result).to.equal('rl:127.0.0.1');
    });

    it('should throw if idam and ip undefined', () => {
      expect(() => keyGenerator({})).to.throw('Unable to generate key for rate limiting: missing user ID and IP address');
    });
  });

  describe('skip', () => {
    it('should not skip when roles empty', () => {
      const req: any = {
        idam: { userDetails: { roles: [] } }
      };

      expect(skip(req)).to.equal(false);
    });

    it('should not skip when user is citizen', () => {
      const req: any = {
        idam: { userDetails: { roles: ['citizen'] } }
      };

      expect(skip(req)).to.equal(false);
    });

    it('should skip when user is not citizen', () => {
      const req: any = {
        idam: { userDetails: { roles: ['caseworker'] } }
      };

      expect(skip(req)).to.equal(true);
    });

    it('should not skip when roles undefined', () => {
      expect(skip({})).to.equal(false);
    });
  });

  describe('sendCommand', () => {
    it('should resolve when redis succeeds', async () => {
      const stub = sandbox
        .stub(redisClient, 'send_command')
        // @ts-expect-error - we want to test error handling, so we need to force an error
        .callsFake((cmd, args, cb) => cb(null, 'OK'));

      const result = await sendCommand('GET', 'key');

      expect(result).to.equal('OK');
      expect(stub.calledOnce).to.be.true;
    });

    it('should reject when redis errors', async () => {
      sandbox
        .stub(redisClient, 'send_command')
        // @ts-expect-error - we want to test error handling, so we need to force an error
        .callsFake((cmd, args, cb) => cb(new Error('fail')));

      try {
        await sendCommand('GET', 'key');
      } catch (err: any) {
        expect(err.message).to.equal('fail');
      }
    });
  });
});
