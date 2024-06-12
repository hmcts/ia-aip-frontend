import * as utils from '../../../client/aria-utils';
import { expect, sinon } from '../../utils/testUtils';

describe('aria utils', () => {
  let details: HTMLDetailsElement;
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    document.body.innerHTML =
    `<details class='govuk-details'>
      <p>some content here</p>
    </details>`;
    details = document.querySelector('details');
  });

  describe('addAriaExpandedAttribute', () => {
    it('should add aria-expanded attr to detail when details tag is closed', () => {
      utils.addAriaExpandedAttribute();
      expect(details.getAttribute('aria-expanded')).to.be.eql('false');
    });

    it('should add aria-expanded attr to detail when details tag is open', () => {
      details.toggleAttribute('open');
      utils.addAriaExpandedAttribute();
      expect(details.getAttribute('aria-expanded')).to.be.eql('true');
    });
  });

  describe('addAriaExpandedEventListener', () => {
    it('should add event listeners and set aria-expanded attribute value according to details state when clicking', async () => {
      const addEventListenerStub: sinon.SinonStub = sandbox.stub(document.querySelector('details'), 'addEventListener');
      utils.addAriaExpandedEventListener();

      expect(addEventListenerStub).to.have.been.called.calledWith('toggle');
    });
  });
});
