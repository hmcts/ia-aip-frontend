import { paths } from '../app/paths';
import i18n from '../locale/en.json';

export default class ConfirmModal {
  protected confirmButtonElement: HTMLElement = null;
  protected cancelButtonElement: HTMLElement = null;
  protected linkToModalElement: HTMLElement = null;
  protected modalElement: HTMLElement = null;
  protected modalOverlayElement: HTMLElement = null;
  protected focusableElements: NodeListOf<Element> = null;
  protected firstFocusableElement: HTMLElement = null;
  protected lastFocusableElement: HTMLElement = null;
  protected previousFocusedElement: HTMLElement = null;
  protected scrollPosition: number = null;
  protected body: HTMLElement = null;
  constructor() {
    this.init = this.init.bind(this);
    this.body = document.querySelector('body');
  }

  init() {
    this.addLinkListeners();
  }

  protected setupModal() {
    this.focusableElements = this.modalElement?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    this.firstFocusableElement = this.focusableElements?.[0] as HTMLElement;
    this.lastFocusableElement =
      this.focusableElements?.[this.focusableElements.length - 1] as HTMLElement;
  }

  addButtonListeners = () => {
    if (this.confirmButtonElement) this.confirmButtonElement.addEventListener('click', this.doAction);
    if (this.cancelButtonElement) this.cancelButtonElement.addEventListener('click', this.closeModal);
  };

  removeButtonListeners = () => {
    if (this.confirmButtonElement) this.confirmButtonElement.removeEventListener('click', this.doAction);
    if (this.cancelButtonElement) this.cancelButtonElement.removeEventListener('click', this.closeModal);
  };

  doAction = () => {};

  addLinkListeners = () => {
    if (this.linkToModalElement) this.linkToModalElement.addEventListener('click', this.openModal);
  };

  removeLinkListeners = () => {
    if (this.linkToModalElement) this.linkToModalElement.removeEventListener('click', this.openModal);
  };

  openModal = () => {
    this.modalElement.removeAttribute('aria-hidden');
    this.modalOverlayElement.removeAttribute('aria-hidden');
    this.previousFocusedElement = document.activeElement as HTMLElement;
    this.lastFocusableElement.focus();
    this.disableScroll();
    this.body.addEventListener('keydown', this.keyDownEventListener);
    this.addButtonListeners();
    this.removeLinkListeners();
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
