import { describe } from 'mocha';
import { SinonSandbox, SinonStub } from 'sinon';

import Logger, { getLogLabel } from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Utils logger', () => {
  let sandbox: SinonSandbox;

  let trackTraceStub: SinonStub;
  let trackExceptionStub: SinonStub;

  let consoleLogStub: SinonStub;
  let consoleErrorStub: SinonStub;
  let consoleWarnStub: SinonStub;

  const message = 'Original';
  const label = 'test.ts';

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    trackTraceStub = sandbox.stub();
    trackExceptionStub = sandbox.stub();

    consoleWarnStub = sandbox.stub(console, 'warn');
    consoleErrorStub = sandbox.stub(console, 'error');
    consoleLogStub = sandbox.stub(console, 'log');
  });

  afterEach(() => {
    sandbox.restore();
  });

  const fakeClient = () =>
    ({
      trackTrace: trackTraceStub,
      trackException: trackExceptionStub
    } as any);

  it('works without telemetry client', () => {
    const logger = new Logger();

    logger.trace(message, label);

    expect(trackTraceStub).to.not.have.been.called;
    expect(consoleWarnStub).to.have.been.calledOnce;
  });

  it('uses injected client', () => {
    const logger = new Logger(null, fakeClient());

    logger.trace(message, label);

    expect(trackTraceStub).to.have.been.calledOnce;
  });

  it('trace logs correctly', () => {
    const logger = new Logger(null, fakeClient());

    logger.trace(message, label);

    expect(trackTraceStub).to.have.been.calledWithMatch({ message });
    expect(consoleWarnStub).to.have.been.calledOnce;
  });

  it('traceWorker logs correctly', () => {
    const logger = new Logger(null, fakeClient());

    logger.traceWorker(message, label);

    expect(trackTraceStub).to.have.been.calledOnce;
    expect(consoleWarnStub).to.have.been.calledOnce;
  });

  it('request logs correctly', () => {
    const logger = new Logger(null, fakeClient());

    logger.request(message, label);

    expect(trackTraceStub).to.have.been.calledOnce;
    expect(consoleLogStub).to.have.been.calledOnce;
  });

  it('exception logs correctly', () => {
    const logger = new Logger(null, fakeClient());

    logger.exception(message, label);

    expect(trackExceptionStub).to.have.been.calledOnce;
    expect(consoleErrorStub).to.have.been.calledOnce;
  });

  it('extracts label from unix path', () => {
    expect(
      getLogLabel('/ia-aip-frontend/test/unit/utils/logger.test.ts')
    ).to.eq('utils/logger.test.ts');
  });

  it('extracts label from windows path', () => {
    expect(
      getLogLabel('something:\\ia-aip-frontend/test/unit/utils/logger.test.ts')
    ).to.eq('utils/logger.test.ts');
  });
});
