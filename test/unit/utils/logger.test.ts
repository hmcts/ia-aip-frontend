// const applicationInsights = require('applicationinsights');
import * as applicationInsights from 'applicationinsights';
import { expect, sinon } from '../../utils/testUtils';
import Logger from '../../../app/utils/Logger';
import { SinonStub, SinonSpy } from 'sinon';

describe('Utils logger', () => {
  let sandbox: sinon.SinonSandbox;
  let appInsightsSetupStub: SinonStub;
  let appInsightsStartStub: SinonStub;
  let consoleLogStub: SinonSpy;
  let consoleInfoStub: SinonSpy;
  let consoleWarnStub: SinonSpy;
  const message: string = 'Original';
  const label: string = 'logger.test.ts';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    consoleLogStub = sandbox.stub(console, 'log');
    consoleInfoStub = sandbox.stub(console, 'info');
    consoleWarnStub = sandbox.stub(console, 'warn');
    appInsightsSetupStub = sandbox.stub(applicationInsights, 'setup');
    appInsightsStartStub = sandbox.stub(applicationInsights, 'start');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('creates a logger instance without an appInsights key', () => {
    const logger: Logger = new Logger('');
    logger.trace(message, label);

    expect(appInsightsStartStub).to.not.have.been.calledOnce;
    expect(consoleWarnStub).to.have.been.calledOnce;
  });

  it('creates a logger instance WITH an appInsight key', () => {
    const logger: Logger = new Logger('ikey');
    logger.trace(message, label);

    expect(appInsightsStartStub).to.have.been.called;
    expect(consoleWarnStub).to.have.been.calledOnce;
  });
});
