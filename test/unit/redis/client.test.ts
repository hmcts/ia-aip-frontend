import { createRedisClient, redisClient, toNewRedisUrl } from '../../../app/redis/client';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';
const proxyquire = require('proxyquire').noCallThru();

describe('redis client', () => {
  let sandbox: sinon.SinonSandbox;
  let traceStub: sinon.SinonStub;
  let exceptionStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    traceStub = sandbox.stub(Logger.prototype, 'trace');
    exceptionStub = sandbox.stub(Logger.prototype, 'exception');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('redisClient', () => {
    it('should be undefined when session.useRedis is not enabled', () => {
      expect(redisClient).to.equal(undefined);
    });

    it('should be created with the default redis factory when session.useRedis is enabled', () => {
      const fakeClient = {
        on: sandbox.stub(),
        connect: sandbox.stub().resolves()
      };
      const createClientStub = sandbox.stub().returns(fakeClient);
      const configStub = {
        get: (key: string) => ({
          'session.useRedis': true,
          'session.redis.url': 'redis://secretKey@localhost:6379'
        })[key]
      };

      const clientModule = proxyquire('../../../app/redis/client', {
        config: { default: configStub, ...configStub },
        redis: { createClient: createClientStub }
      });

      expect(clientModule.redisClient).to.equal(fakeClient);
      expect(createClientStub).to.have.been.calledOnceWith({ url: 'redis://:secretKey@localhost:6379' });
    });
  });

  describe('toNewRedisUrl', () => {
    it('should move the username into the password', () => {
      const result = toNewRedisUrl('redis://secretKey@localhost:6379');

      expect(result).to.equal('redis://:secretKey@localhost:6379');
    });

    it('should switch to rediss protocol and remove tls param when tls=true', () => {
      const result = toNewRedisUrl('redis://secretKey@host.redis.cache.windows.net:6380?tls=true');

      expect(result).to.equal('rediss://:secretKey@host.redis.cache.windows.net:6380');
    });

    it('should keep redis protocol and query params when tls is not true', () => {
      const result = toNewRedisUrl('redis://secretKey@localhost:6379?tls=false');

      expect(result).to.equal('redis://:secretKey@localhost:6379?tls=false');
    });

    it('should log the original and parsed urls', () => {
      toNewRedisUrl('redis://secretKey@localhost:6379');

      expect(traceStub).to.have.been.calledWith('REDIS URL: redis://secretKey@localhost:6379');
      expect(traceStub).to.have.been.calledWith('REDIS PARSED: redis://:secretKey@localhost:6379');
    });
  });

  describe('createRedisClient', () => {
    function buildFakeClient(connectResult: Promise<void>) {
      return {
        on: sandbox.stub(),
        connect: sandbox.stub().returns(connectResult)
      };
    }

    it('should create the client with the converted url and connect', async () => {
      const fakeClient = buildFakeClient(Promise.resolve());
      const factory = sandbox.stub().returns(fakeClient);

      const client = createRedisClient('redis://secretKey@localhost:6379?tls=true', factory as any);
      await new Promise(resolve => setImmediate(resolve));

      expect(client).to.equal(fakeClient);
      expect(factory).to.have.been.calledOnceWith({ url: 'rediss://:secretKey@localhost:6379' });
      expect(fakeClient.connect).to.have.been.calledOnce;
      expect(traceStub).to.have.been.calledWith('Connected to Redis client');
    });

    it('should log an exception when the client emits an error', () => {
      const fakeClient = buildFakeClient(Promise.resolve());
      const factory = sandbox.stub().returns(fakeClient);

      createRedisClient('redis://secretKey@localhost:6379', factory as any);
      const errorHandler = fakeClient.on.withArgs('error').firstCall.args[1];
      errorHandler(new Error('boom'));

      expect(exceptionStub).to.have.been.calledWith('Error starting Redis client:boom');
    });

    it('should log an exception when the connection fails', async () => {
      const fakeClient = buildFakeClient(Promise.reject(new Error('refused')));
      const factory = sandbox.stub().returns(fakeClient);

      createRedisClient('redis://secretKey@localhost:6379', factory as any);
      await new Promise(resolve => setImmediate(resolve));

      expect(exceptionStub).to.have.been.calledWith('Cannot connect to Redis client: refused');
    });
  });
});
