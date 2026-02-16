import * as applicationInsights from 'applicationinsights';
import { describe } from 'mocha';
import { SinonSpy, SinonStub } from 'sinon';
import Logger, { getLogLabel } from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Utils logger', () => {
  let sandbox: sinon.SinonSandbox;
  let applicationInsightsSetupSpy: SinonSpy;
  let applicationInsightsStartSpy: SinonStub;
  let applicationInsightsTraceSpy: SinonStub;
  let applicationInsightsExceptionSpy: SinonStub;
  let consoleLogStub: SinonStub;
  let consoleErrorStub: SinonStub;
  let consoleWarnStub: SinonStub;
  const message: string = 'Original';
  const label: string = 'test.ts';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    const instance = new Logger();
    instance.setIkey('ikey');
    applicationInsightsSetupSpy = sandbox.spy(applicationInsights, 'setup');
    applicationInsightsStartSpy = sandbox.stub(applicationInsights, 'start');
    applicationInsightsTraceSpy = sandbox.stub(applicationInsights.defaultClient, 'trackTrace');
    applicationInsightsExceptionSpy = sandbox.stub(applicationInsights.defaultClient, 'trackException');
    consoleWarnStub = sandbox.stub(console, 'warn');
    consoleErrorStub = sandbox.stub(console, 'error');
    consoleLogStub = sandbox.stub(console, 'log');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('creates a logger instance without an appInsights key', () => {
    const logger: Logger = new Logger();
    expect(applicationInsightsStartSpy.called).to.equal(false);
  });

  it('creates a logger instance WITH an appInsight key', () => {
    const logger: Logger = new Logger('lakey');
    expect(applicationInsightsSetupSpy.callCount).to.equal(1);
  });

  it('tracks a trace only on console', () => {
    const logger: Logger = new Logger();
    logger.trace(message, label);

    expect(applicationInsightsStartSpy.called).to.equal(false);
    expect(applicationInsightsTraceSpy.called).to.equal(false);
    expect(consoleWarnStub.callCount).to.equal(1);
  });

  it('tracks a traceWorker only on console', () => {
    const logger: Logger = new Logger();
    logger.traceWorker(message, label);

    expect(applicationInsightsStartSpy.called).to.equal(false);
    expect(applicationInsightsTraceSpy.called).to.equal(false);
    expect(consoleWarnStub.callCount).to.equal(1);
  });

  it('tracks a trace both on console and appInights', () => {
    const logger: Logger = new Logger('lakey');
    expect(applicationInsightsSetupSpy.callCount).to.equal(1);

    logger.trace(message, label);
    expect(applicationInsightsTraceSpy.callCount).to.equal(1);
    expect(consoleWarnStub.callCount).to.equal(1);
  });

  it('tracks a request only on console', () => {
    const logger: Logger = new Logger();
    logger.request(message, label);

    expect(applicationInsightsStartSpy.called).to.equal(false);
    expect(consoleLogStub.callCount).to.equal(1);
  });

  it('tracks a request only on console', () => {
    const logger: Logger = new Logger('key');
    expect(applicationInsightsSetupSpy.callCount).to.equal(1);

    logger.request(message, label);
    expect(applicationInsightsTraceSpy.callCount).to.equal(1);
    expect(consoleLogStub.callCount).to.equal(1);
  });

  it('tracks a exception only on console', () => {
    const logger: Logger = new Logger();
    logger.exception(message, label);

    expect(applicationInsightsStartSpy.called).to.equal(false);
    expect(consoleErrorStub.callCount).to.equal(1);
  });

  it('tracks a request only on console', () => {
    const logger: Logger = new Logger('key');
    expect(applicationInsightsSetupSpy.callCount).to.equal(1);

    logger.exception(message, label);
    expect(applicationInsightsExceptionSpy.callCount).to.equal(1);
    expect(consoleErrorStub.callCount).to.equal(1);
  });

  it('correctly gets path', () => {
    const path: string = '/ia-aip-frontend/test/unit/utils/logger.test.ts';
    const pathReturned = getLogLabel(path);
    expect(pathReturned).to.eq('utils/logger.test.ts');
  });

  it('correctly gets path and discards backslashes', () => {
    const path: string = 'something:\\ia-aip-frontend/test/unit/utils/logger.test.ts';
    const pathReturned = getLogLabel(path);
    expect(pathReturned).to.eq('utils/logger.test.ts');
  });
});
