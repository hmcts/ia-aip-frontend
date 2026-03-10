import { paths } from '../../../app/paths';
import DeleteModal from '../../../client/delete-modal';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('DeleteModal', () => {
  let sandbox: sinon.SinonSandbox;
  let deleteModal: DeleteModal;

  let deleteLink: HTMLElement;
  let description: HTMLElement;

  before(() => {
    document.body.innerHTML = `
      <a class="${i18n.pages.casesList.deleteLinkClass}" data-case-id="123"></a>

      <div id="delete-draft-modal">
        <p id="delete-draft-modal-description"></p>
        <button id="delete-draft-modal-confirm"></button>
        <button id="delete-draft-modal-cancel"></button>
      </div>

      <div id="delete-draft-modal-overlay"></div>
    `;

    deleteLink = document.querySelector(`.${i18n.pages.casesList.deleteLinkClass}`);
    description = document.querySelector('#delete-draft-modal-description');
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    deleteModal = new DeleteModal();
    deleteModal.init();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('addLinkListeners', () => {
    it('should open modal on click', () => {
      const openStub = sandbox.stub(deleteModal, 'openModal');

      deleteModal.addLinkListeners();

      deleteLink.dispatchEvent(new MouseEvent('click'));

      expect(openStub.calledOnce).to.equal(true);
    });

    it('should open modal on enter key', () => {
      const openStub = sandbox.stub(deleteModal, 'openModal');

      deleteModal.addLinkListeners();

      deleteLink.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(openStub.calledOnce).to.equal(true);
    });
  });

  describe('removeLinkListeners', () => {
    it('should remove listeners', () => {
      const openStub = sandbox.stub(deleteModal, 'openModal');

      deleteModal.removeLinkListeners();

      deleteLink.dispatchEvent(new MouseEvent('click'));

      expect(openStub.called).to.equal(false);
    });
  });

  describe('openModalWithContent', () => {
    it('should populate description and open modal', () => {
      const openStub = sandbox.stub(deleteModal, 'openModal');

      deleteLink.dispatchEvent(new MouseEvent('click'));

      expect(description.textContent).to.contain('123');
      expect(openStub.calledOnce).to.equal(true);
    });

    it('should ignore non-enter keydown', () => {
      const openStub = sandbox.stub(deleteModal, 'openModal');

      deleteLink.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(openStub.called).to.equal(false);
    });
  });

  describe('getDeleteUrl', () => {
    it('should have to delete path with case id', () => {
      (deleteModal as any).currentCaseId = '123';

      deleteModal.getDeleteUrl();

      expect(deleteModal.getDeleteUrl())
        .to.equal(paths.common.deleteDraftAppeal.replace(':id', '123'));
    });
  });
});
