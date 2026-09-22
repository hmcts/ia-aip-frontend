import { addBackLinkEventListener } from '../../../client/back-link';
import { expect, sinon } from '../../utils/testUtils';

describe('back link', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    document.body.innerHTML = `
      <a href="#" class="govuk-back-link" onclick="history.go(-1); return false;">Back</a>
    `;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('addBackLinkEventListener @events', () => {
    it('should add a click event listener to the back link', () => {
      const addEventListenerStub: sinon.SinonStub = sandbox.stub(document.querySelector('.govuk-back-link'), 'addEventListener');
      addBackLinkEventListener();

      expect(addEventListenerStub.calledWith('click')).to.equal(true);
    });

    it('should prevent default and go back in history when clicked', () => {
      const historyGoStub: sinon.SinonStub = sandbox.stub(history, 'go');
      addBackLinkEventListener();

      const link: HTMLAnchorElement = document.querySelector('.govuk-back-link');
      const clickEvent = new MouseEvent('click', { cancelable: true });
      link.dispatchEvent(clickEvent);

      expect(clickEvent.defaultPrevented).to.equal(true);
      expect(historyGoStub.calledWith(-1)).to.equal(true);
    });

    it('should do nothing when there is no back link on the page', () => {
      document.body.innerHTML = '';
      expect(() => addBackLinkEventListener()).to.not.throw();
    });
  });
});
