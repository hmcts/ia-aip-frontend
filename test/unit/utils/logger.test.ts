import * as applicationInsights from 'applicationinsights';
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
  const label: string = 'logger.test.ts';

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
    expect(applicationInsightsStartSpy).to.not.have.been.calledOnce;
  });

  it('creates a logger instance WITH an appInsight key', () => {
    const logger: Logger = new Logger('lakey');
    expect(applicationInsightsSetupSpy).to.have.been.calledOnce;
  });

  it('tracks a trace only on console', () => {
    const logger: Logger = new Logger();
    logger.trace(message, label);

    expect(applicationInsightsStartSpy).to.not.have.been.calledOnce;
    expect(applicationInsightsTraceSpy).to.not.have.been.calledOnce;
    expect(consoleWarnStub).to.have.been.calledOnce;
  });

  it('tracks a trace both on console and appInights', () => {
    const logger: Logger = new Logger('lakey');
    expect(applicationInsightsSetupSpy).to.have.been.calledOnce;

    logger.trace(message, label);
    expect(applicationInsightsTraceSpy).to.have.been.calledOnce;
    expect(consoleWarnStub).to.have.been.calledOnce;
  });

  it('tracks a request only on console', () => {
    const logger: Logger = new Logger();
    logger.request(message, label);

    expect(applicationInsightsStartSpy).to.not.have.been.calledOnce;
    expect(consoleLogStub).to.have.been.calledOnce;
  });

  it('tracks a request only on console', () => {
    const logger: Logger = new Logger('key');
    expect(applicationInsightsSetupSpy).to.have.been.calledOnce;

    logger.request(message, label);
    expect(applicationInsightsTraceSpy).to.have.been.calledOnce;
    expect(consoleLogStub).to.have.been.calledOnce;
  });

  it('tracks a exception only on console', () => {
    const logger: Logger = new Logger();
    logger.exception(message, label);

    expect(applicationInsightsStartSpy).to.not.have.been.calledOnce;
    expect(consoleErrorStub).to.have.been.calledOnce;
  });

  it('tracks a request only on console', () => {
    const logger: Logger = new Logger('key');
    expect(applicationInsightsSetupSpy).to.have.been.calledOnce;

    logger.exception(message, label);
    expect(applicationInsightsExceptionSpy).to.have.been.calledOnce;
    expect(consoleErrorStub).to.have.been.calledOnce;
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
