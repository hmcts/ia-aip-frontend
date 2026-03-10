import { paths } from '../app/paths';
import i18n from '../locale/en.json';

export default class DeleteModal {
  private confirmButtonElement: HTMLElement = null;
  private cancelButtonElement: HTMLElement = null;
  private linkToModalElement: NodeListOf<HTMLElement> = null;
  private modalElement: HTMLElement = null;
  private modalOverlayElement: HTMLElement = null;
  private descriptionElement: HTMLElement = null;
  private focusableElements: NodeListOf<Element> = null;
  private firstFocusableElement: HTMLElement = null;
  private lastFocusableElement: HTMLElement = null;
  private previousFocusedElement: HTMLElement = null;
  private scrollPosition: number = null;
  private body: HTMLElement = null;
  private currentCaseId: string = null;

  constructor() {
    const modalId = 'delete-draft-modal';
    this.init = this.init.bind(this);
    this.modalElement = document.querySelector(`#${modalId}`);
    this.modalOverlayElement = document.querySelector(`#${modalId}-overlay`);
    this.confirmButtonElement = document.querySelector(`#${modalId}-confirm`);
    this.cancelButtonElement = document.querySelector(`#${modalId}-cancel`);
    this.descriptionElement = document.querySelector(`#${modalId}-description`);
    this.linkToModalElement = document.querySelectorAll(`.${i18n.pages.casesList.deleteLinkClass}`);
    this.body = document.querySelector('body');
    this.focusableElements =
      this.modalElement?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) || ([] as unknown as NodeListOf<Element>);
    this.firstFocusableElement = this.focusableElements[0] as HTMLElement;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] as HTMLElement;
  }

  init() {
    this.addLinkListeners();
  }

  addButtonListeners = () => {
    if (this.confirmButtonElement) this.confirmButtonElement.addEventListener('click', this.doAction);
    if (this.cancelButtonElement) this.cancelButtonElement.addEventListener('click', this.closeModal);
  };

  removeButtonListeners = () => {
    if (this.confirmButtonElement) this.confirmButtonElement.removeEventListener('click', this.doAction);
    if (this.cancelButtonElement) this.cancelButtonElement.removeEventListener('click', this.closeModal);
  };

  doAction = () => {
    window.location.href = paths.common.deleteDraftAppeal.replace(':id', this.currentCaseId);
  };

  addLinkListeners = () => {
    if (this.linkToModalElement) {
      this.linkToModalElement
        .forEach(element => {
          element.addEventListener('click', this.openModal);
          element.addEventListener('keydown', this.openModal);
        });
    }
  };

  removeLinkListeners = () => {
    if (this.linkToModalElement) {
      this.linkToModalElement
        .forEach(element => element.removeEventListener('click', this.openModal));
    }
  };

  openModal = (event: Event) => {
    if (event.type === 'keydown' && (event as KeyboardEvent).key !== 'Enter') return;
    if (event.type === 'keydown' && (event as KeyboardEvent).key === 'Enter') {
      event.preventDefault();
    }
    const target = event.currentTarget as HTMLElement;
    const caseId = target.dataset.caseId;
    this.currentCaseId = caseId;
    this.updateModalContent(caseId);

    this.modalElement.removeAttribute('aria-hidden');
    this.modalOverlayElement.removeAttribute('aria-hidden');
    this.previousFocusedElement = document.activeElement as HTMLElement;
    this.lastFocusableElement.focus();
    this.disableScroll();
    this.body.addEventListener('keydown', this.keyDownEventListener);
    this.addButtonListeners();
    this.removeLinkListeners();
  };

  updateModalContent = (caseId: string) => {
    if (this.descriptionElement) {
      this.descriptionElement.textContent = i18n.pages.casesList.deleteDraftModal.description
        .replace('{{ caseId }}', caseId);
    }
  };

  disableScroll = () => {
    this.scrollPosition = window.pageYOffset;
    this.body.style.overflow = 'hidden';
    this.body.style.position = 'fixed';
    this.body.style.width = '100%';
    this.body.style.top = `-${this.scrollPosition}px`;
  };

  enableScroll = () => {
    this.body.style.removeProperty('overflow');
    this.body.style.removeProperty('position');
    this.body.style.removeProperty('width');
    window.scrollTo(0, this.scrollPosition);
  };

  closeModal = () => {
    this.modalElement.setAttribute('aria-hidden', 'true');
    this.modalOverlayElement.setAttribute('aria-hidden', 'true');

    document.querySelector('body').removeEventListener('keydown', this.keyDownEventListener);
    if (this.previousFocusedElement) this.previousFocusedElement.focus();
    this.enableScroll();
    this.removeButtonListeners();
    this.addLinkListeners();
  };

  keyDownEventListener = (event) => {
    if (event.key !== 'Tab') return;
    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement.focus();
      }
    }
  };
}
