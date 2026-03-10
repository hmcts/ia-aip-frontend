import { paths } from '../app/paths';
import i18n from '../locale/en.json';
import ConfirmModal from './confirm-modal';

export default class CreateModal extends ConfirmModal{
  constructor() {
    super();
    const modalId = 'confirm-create-modal';
    this.modalElement = document.querySelector(`#${modalId}`);
    this.modalOverlayElement = document.querySelector(`#${modalId}-overlay`);
    this.confirmButtonElement = document.querySelector(`#${modalId}-confirm`);
    this.cancelButtonElement = document.querySelector(`#${modalId}-cancel`);
    this.linkToModalElement = document.querySelector(`#${i18n.pages.casesList.createNewAppealId}`);
    this.setupModal();
  }

  doAction = () => window.location.href = paths.common.createNewAppeal;

  addLinkListeners = () => {
    if (this.linkToModalElement) this.linkToModalElement.addEventListener('click', this.openModal);
  };

  removeLinkListeners = () => {
    if (this.linkToModalElement) this.linkToModalElement.removeEventListener('click', this.openModal);
  };
}
