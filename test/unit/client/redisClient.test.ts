import config from 'config';
import * as redis from 'redis';
import LoggerModule, * as LoggerExports from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';
let createRedisClient: any;

describe('createRedisClient', () => {
  let createClientStub: sinon.SinonStub;
  let configStub: sinon.SinonStub;
  let onStub: sinon.SinonStub;
  let exceptionStub: sinon.SinonStub;
  let getLogLabelStub: sinon.SinonStub;

  const fakeClient = {
    // eslint-disable-next-line:no-empty
    on: () => {}
  } as any;

  beforeEach(() => {
    onStub = sinon.stub(fakeClient, 'on');

    createClientStub = sinon.stub(redis, 'createClient').returns(fakeClient);

    configStub = sinon.stub(config, 'get').returns('redis://localhost:6379');

    exceptionStub = sinon.stub();
    sinon.stub(LoggerModule.prototype, 'exception').callsFake(exceptionStub);

    getLogLabelStub = sinon
      .stub(LoggerExports, 'getLogLabel')
      .returns('label');
    createRedisClient = require('../../../app/redisClient').createRedisClient;
  });

  afterEach(() => sinon.restore());

  it('creates redis client with config url', () => {
    createRedisClient();

    expect(createClientStub.calledOnceWithExactly({
      url: 'redis://localhost:6379'
    })).to.equal(true);
  });

  it('registers error handler on client', () => {
    createRedisClient();

    expect(onStub.calledOnceWith('error', sinon.match.func)).to.equal(true);
  });

  it('logs exception when redis emits error', () => {
    createRedisClient();

    const handler = onStub.firstCall.args[1];

    handler(new Error('boom'));

    expect(exceptionStub.calledOnceWith(
      'Redis Client Error because of boom',
      'label'
    )).to.equal(true);
  });

  it('returns the created client', () => {
    const result = createRedisClient();

    expect(result).to.equal(fakeClient);
  });
});
