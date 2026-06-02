import { paths } from '../app/paths';
import i18n from '../locale/en.json';
import ConfirmModal from './confirm-modal';

export default class DeleteModal extends ConfirmModal{
  private readonly descriptionElement: HTMLElement = null;
  private readonly confirmFormElement: HTMLElement = null;
  private readonly linksToModalElement: NodeListOf<Element> = null;
  constructor() {
    super();
    const modalId = i18n.pages.casesList.deleteDraftModal.id;
    this.modalElement = document.querySelector(`#${modalId}`);
    this.modalOverlayElement = document.querySelector(`#${modalId}-overlay`);
    this.confirmButtonElement = document.querySelector(`#${modalId}-confirm`);
    this.cancelButtonElement = document.querySelector(`#${modalId}-cancel`);
    this.descriptionElement = document.querySelector(`#${modalId}-description`);
    this.linksToModalElement = document.querySelectorAll(`.${i18n.pages.casesList.deleteLinkClass}`);
    this.confirmFormElement = document.querySelector(`#${modalId}-form`);
    this.setupModal();
  }

  addLinkListeners = () => {
    if (this.linksToModalElement) {
      this.linksToModalElement
        .forEach(element => {
          element.addEventListener('click', this.openModalWithContent);
          element.addEventListener('keydown', this.openModalWithContent);
        });
    }
  };

  removeLinkListeners = () => {
    if (this.linksToModalElement) {
      this.linksToModalElement
        .forEach(element => {
          element.removeEventListener('click', this.openModalWithContent);
          element.removeEventListener('keydown', this.openModalWithContent);
        });
    }
  };

  openModalWithContent = (event: Event) => {
    if (event.type === 'keydown' && (event as KeyboardEvent).key !== 'Enter') return;
    if (event.type === 'keydown' && (event as KeyboardEvent).key === 'Enter') {
      event.preventDefault();
    }
    const target = event.currentTarget as HTMLElement;
    const caseId = target.dataset.caseId;

    if (this.descriptionElement) {
      this.descriptionElement.textContent = i18n.pages.casesList.deleteDraftModal.description
        .replace('{{ caseId }}', caseId);
    }
    if (this.confirmFormElement) {
      this.confirmFormElement.setAttribute('action', paths.common.deleteDraftAppeal.replace(':id', caseId));
    }

    this.openModal();
  };
}
