import * as redis from 'redis';
import * as loggerModule from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('redis client', () => {
  let sandbox: sinon.SinonSandbox;
  let onStub: sinon.SinonStub;
  let exceptionStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    onStub = sandbox.stub();
    exceptionStub = sandbox.stub();

    sandbox.stub(redis, 'createClient').returns({
      on: onStub
    } as any);

    sandbox.stub(loggerModule.default.prototype, 'exception').callsFake(exceptionStub);
  });

  afterEach(() => {
    sandbox.restore();
    delete require.cache[require.resolve('../../../app/redisClient')];
  });

  it('registers error handler', () => {
    require('../../../app/redisClient');

    expect(onStub.calledWith('error')).to.equal(true);
  });

  it('logs exception when redis emits error', () => {
    require('../../../app/redisClient');

    const errorHandler = onStub.firstCall.args[1];

    const error = new Error('boom');

    errorHandler(error);

    expect(exceptionStub.calledOnce).to.equal(true);
    expect(exceptionStub.firstCall.args[0]).to.contain('boom');
  });
});
