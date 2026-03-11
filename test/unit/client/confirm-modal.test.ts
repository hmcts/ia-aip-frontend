import ConfirmModal from '../../../client/confirm-modal';
import { expect, sinon } from '../../utils/testUtils';

describe('ConfirmModal', () => {
  let sandbox: sinon.SinonSandbox;
  let confirmModal: ConfirmModal;

  let modalElement: HTMLElement;
  let overlayElement: HTMLElement;
  let confirmButton: HTMLElement;
  let cancelButton: HTMLElement;
  let linkToModal: HTMLElement;
  let body: HTMLElement;
  let focusableElements: NodeListOf<Element>;
  let firstFocusable: HTMLElement;
  let lastFocusable: HTMLElement;

  before(() => {
    document.body.innerHTML = `
      <a id="test-link">linkToModal</a>
      <div id="test-modal" aria-hidden="true">
        <button id="confirm">Confirm</button>
        <button id="cancel">Cancel</button>
      </div>
      <div id="test-modal-overlay" aria-hidden="true"></div>
    `;

    modalElement = document.querySelector('#test-modal');
    overlayElement = document.querySelector('#test-modal-overlay');
    linkToModal = document.querySelector('#test-link');
    confirmButton = document.querySelector('#confirm');
    cancelButton = document.querySelector('#cancel');
    body = document.querySelector('body');

    focusableElements = modalElement.querySelectorAll('button');
    firstFocusable = focusableElements[0] as HTMLElement;
    lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    confirmModal = new ConfirmModal();
    (confirmModal as any).modalElement = modalElement;
    (confirmModal as any).modalOverlayElement = overlayElement;
    (confirmModal as any).confirmButtonElement = confirmButton;
    (confirmModal as any).cancelButtonElement = cancelButton;
    (confirmModal as any).linkToModalElement = linkToModal;

    (confirmModal as any).setupModal();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('linkListeners', () => {
    it('should trigger openModal when link clicked', () => {
      const openStub = sandbox.stub(confirmModal, 'openModal');
      linkToModal.dispatchEvent(new MouseEvent('click'));

      expect(openStub.called).to.equal(false);

      confirmModal.addLinkListeners();
      linkToModal.dispatchEvent(new MouseEvent('click'));

      expect(openStub.called).to.equal(true);
      expect(openStub.callCount).to.equal(1);

      confirmModal.removeLinkListeners();
      linkToModal.dispatchEvent(new MouseEvent('click'));

      expect(openStub.callCount).to.equal(1);

    });
  });

  describe('openModal', () => {
    it('should open modal', () => {
      const disableScrollStub = sandbox.stub(confirmModal, 'disableScroll');
      const focusStub = sandbox.stub(lastFocusable, 'focus');
      const bodyListenerStub = sandbox.stub(body, 'addEventListener');

      confirmModal.openModal();

      expect(modalElement.getAttribute('aria-hidden')).to.equal(null);
      expect(overlayElement.getAttribute('aria-hidden')).to.equal(null);
      expect(focusStub.calledOnce).to.equal(true);
      expect(disableScrollStub.calledOnce).to.equal(true);
      expect(bodyListenerStub.calledOnce).to.equal(true);
    });
  });

  describe('closeModal', () => {
    it('should close modal', () => {
      const enableScrollStub = sandbox.stub(confirmModal, 'enableScroll');
      const removeListenerStub = sandbox.stub(body, 'removeEventListener');

      confirmModal.closeModal();

      expect(modalElement.getAttribute('aria-hidden')).to.equal('true');
      expect(overlayElement.getAttribute('aria-hidden')).to.equal('true');
      expect(enableScrollStub.calledOnce).to.equal(true);
      expect(removeListenerStub.calledOnce).to.equal(true);
    });
  });

  describe('keydown focus trap', () => {
    it('should cycle focus forward', () => {
      lastFocusable.focus();

      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      const preventStub = sandbox.stub(event, 'preventDefault');
      const focusStub = sandbox.stub(firstFocusable, 'focus');

      confirmModal.keyDownEventListener(event);

      expect(preventStub.calledOnce).to.equal(true);
      expect(focusStub.calledOnce).to.equal(true);
    });

    it('should cycle focus backwards', () => {
      firstFocusable.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true
      });

      const preventStub = sandbox.stub(event, 'preventDefault');
      const focusStub = sandbox.stub(lastFocusable, 'focus');

      confirmModal.keyDownEventListener(event);

      expect(preventStub.calledOnce).to.equal(true);
      expect(focusStub.calledOnce).to.equal(true);
    });

    it('should return if not tab', () => {
      lastFocusable.focus();

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventStub = sandbox.stub(event, 'preventDefault');
      const focusStub = sandbox.stub(firstFocusable, 'focus');

      confirmModal.keyDownEventListener(event);

      expect(preventStub.calledOnce).to.equal(false);
      expect(focusStub.calledOnce).to.equal(false);
    });
  });

  describe('disableScroll / enableScroll', () => {
    it('should disable scroll', () => {
      confirmModal.disableScroll();

      expect(body.style.getPropertyValue('overflow')).to.equal('hidden');
      expect(body.style.getPropertyValue('position')).to.equal('fixed');
    });

    it('should enable scroll', () => {
      const scrollStub = sandbox.stub(window, 'scrollTo');

      confirmModal.enableScroll();

      expect(scrollStub.calledOnce).to.equal(true);
    });
  });
});
