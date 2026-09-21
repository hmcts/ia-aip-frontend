import i18n from '../locale/en.json';
import ConfirmModal from './confirm-modal';

export default class CreateModal extends ConfirmModal {
  protected navLinkToModalElement: HTMLElement = null;
  constructor() {
    super();
    const modalId = i18n.pages.casesList.createAppealModal.id;
    this.modalElement = document.querySelector(`#${modalId}`);
    this.modalOverlayElement = document.querySelector(`#${modalId}-overlay`);
    this.confirmButtonElement = document.querySelector(`#${modalId}-confirm`);
    this.cancelButtonElement = document.querySelector(`#${modalId}-cancel`);
    this.linkToModalElement = document.querySelector(`#${i18n.pages.casesList.createNewAppealId}`);
    this.navLinkToModalElement = document.querySelector(`#${i18n.components.header.createNewAppealNavId}`);
    this.setupModal();
  }

  addLinkListeners = () => {
    if (this.linkToModalElement) this.linkToModalElement.addEventListener('click', this.openModal);
    if (this.navLinkToModalElement) this.navLinkToModalElement.addEventListener('click', this.openModal);
  };

  removeLinkListeners = () => {
    if (this.linkToModalElement) this.linkToModalElement.removeEventListener('click', this.openModal);
    if (this.navLinkToModalElement) this.navLinkToModalElement.removeEventListener('click', this.openModal);
  };
}
