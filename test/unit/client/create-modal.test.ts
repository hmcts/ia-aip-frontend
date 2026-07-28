import { paths } from '../../../app/paths';
import CreateModal from '../../../client/create-modal';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('CreateModal', () => {
  let sandbox: sinon.SinonSandbox;
  let createModal: CreateModal;
  let link: HTMLElement;

  before(() => {
    document.body.innerHTML = `
      <a id="${i18n.pages.casesList.createNewAppealId}"></a>
      <div id="confirm-create-modal">
        <button id="confirm-create-modal-confirm"></button>
        <button id="confirm-create-modal-cancel"></button>
      </div>
      <div id="confirm-create-modal-overlay"></div>
    `;

    createModal = new CreateModal();
    link = document.querySelector(`#${i18n.pages.casesList.createNewAppealId}`);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('addLinkListeners', () => {
    it('should open modal when clicking link', () => {
      const openStub = sandbox.stub(createModal, 'openModal');

      createModal.addLinkListeners();

      link.dispatchEvent(new MouseEvent('click'));

      expect(openStub.calledOnce).to.equal(true);
    });
  });

  describe('removeLinkListeners', () => {
    it('should remove listener', () => {
      const openStub = sandbox.stub(createModal, 'openModal');

      createModal.removeLinkListeners();

      link.dispatchEvent(new MouseEvent('click'));

      expect(openStub.called).to.equal(false);
    });
  });
});
