const sinon = require('sinon');
const { expect } = require('chai');
const { Logger: nodeJsLogger } = require('@hmcts/nodejs-logging');
const Logger = require('./Logger');
const sinonStubPromise = require('sinon-stub-promise');

sinonStubPromise(sinon);

describe('logger', () => {
  let fakeLogger = null;
  let passedInLogger = null;

  beforeEach(() => {
    fakeLogger = { error: sinon.stub(), info: sinon.stub() };
    passedInLogger = { exception: sinon.stub(), request: sinon.stub() };

    sinon.stub(nodeJsLogger, 'getLogger').returns(fakeLogger);
  });

  afterEach(() => {
    nodeJsLogger.getLogger.restore();
  });

  describe('error', () => {
    it('calls nodejs-logging if no logger setup', () => {
      const logger = new Logger({});

      const message = 'message';
      logger.error(message);

      expect(fakeLogger.error.calledWith(message)).to.equal(true);
    });

    it('calls logger from args', () => {
      const logger = new Logger({ logger: passedInLogger });

      const message = 'message';
      logger.error(message);

      expect(fakeLogger.error.callCount).to.equal(0);
      expect(passedInLogger.exception.calledWith(message)).to.equal(true);
    });
  });

  describe('info', () => {
    it('calls nodejs-logging if no logger setup', () => {
      const logger = new Logger({});

      const message = 'message';
      logger.info(message);

      expect(fakeLogger.info.calledWith(message)).to.equal(true);
    });

    it('calls logger from args', () => {
      const logger = new Logger({ logger: passedInLogger });

      const message = 'message';
      logger.info(message);

      expect(fakeLogger.info.callCount).to.equal(0);
      expect(passedInLogger.request.calledWith(message)).to.eql(true);
    });
  });
});
