import CookieBanner from '../../../client/cookies-banner';
import CreateModal from '../../../client/create-modal';
import SessionTimeout from '../../../client/session-timeout';
import { initialize, ready } from '../../../client/utils';
import { expect, sinon } from '../../utils/testUtils';
const govUK = require('govuk-frontend');

describe('Client Utils', () => {
  let sandbox: sinon.SinonSandbox;

  let cookieInitStub: sinon.SinonStub;
  let sessionInitStub: sinon.SinonStub;
  let modalInitStub: sinon.SinonStub;
  let govInitStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    cookieInitStub = sandbox.stub(CookieBanner.prototype, 'init');
    sessionInitStub = sandbox.stub(SessionTimeout.prototype, 'init');
    modalInitStub = sandbox.stub(CreateModal.prototype, 'init');

    govInitStub = sandbox.stub(govUK, 'initAll');

    document.body.innerHTML = `
      <div id="confirm-create-modal"></div>
      <div id="confirm-create-modal-overlay"></div>
      <div id="confirm-delete-modal"></div>
      <div id="confirm-delete-modal-overlay"></div>
      <div id="timeout-modal"></div>
      <div id="modal-overlay"></div>
    `;
  });


  afterEach(() => {
    sandbox.restore();
  });

  describe('ready', () => {
    it('should call callback immediately when DOM ready', () => {
      const cb = sandbox.stub();
      Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
      ready(cb);
      expect(cb.calledOnce).to.equal(true);
    });

    it('should register DOMContentLoaded listener when loading', () => {
      const cb = sandbox.stub();
      const addEventStub = sandbox.stub(document, 'addEventListener');
      Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true });
      ready(cb);

      expect(addEventStub).calledWith('DOMContentLoaded', cb);
    });
  });

  describe('initialize', () => {
    it('should initialize client libraries', () => {
      initialize();
      expect(cookieInitStub.calledOnce).to.equal(true);
      expect(sessionInitStub.calledOnce).to.equal(true);
      expect(govInitStub.calledOnce).to.equal(true);
      expect(modalInitStub.calledOnce).to.equal(false);
      expect(modalInitStub.calledTwice).to.equal(true);
    });
  });
});
