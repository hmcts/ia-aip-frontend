import axios from 'axios';
import moment from 'moment';
import { paths } from '../app/paths';
import i18n from '../locale/en.json';

export default class SessionTimeout {
  public maxAge: number;
  public bufferSessionExtension: number = 2 * 60 * 1000;
  private sessionTimeout: number;
  private modalTimeout: number;
  private modalCountdown: number;
  private extendSessionElement: HTMLElement = null;
  private modalElement: HTMLElement = null;
  private modalOverlayElement: HTMLElement = null;
  private modalCountdownElement: HTMLElement = null;
  private focusableElements: NodeListOf<Element> = null;
  private firstFocusableElement: HTMLElement = null;
  private lastFocusableElement: HTMLElement = null;
  private previousFocusedElement: HTMLElement = null;
  private scrollPosition: number = null;
  private body: HTMLElement = null;

  constructor() {
    this.init = this.init.bind(this);
    this.modalElement = document.querySelector('#timeout-modal');
    this.modalOverlayElement = document.querySelector('#modal-overlay');
    this.modalCountdownElement = document.querySelector('#modal-countdown');
    this.extendSessionElement = document.querySelector('#extend-session');
    this.body = document.querySelector('body');
    this.focusableElements = this.modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

    this.firstFocusableElement = this.focusableElements[0] as HTMLElement;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] as HTMLElement;
  }

  init() {
    this.addListeners();
    void this.extendSession();
  }

  addListeners = () => {
    if (this.extendSessionElement) this.extendSessionElement.addEventListener('click', this.extendSession);
  }

  removeListeners = () => {
    if (this.extendSessionElement) this.extendSessionElement.removeEventListener('click', this.extendSession);
  }

  startCounter = () => {
    this.sessionTimeout = window.setTimeout(() => {
      this.signOut();
    }, this.maxAge);
    this.modalTimeout = window.setTimeout(() => {
      this.openModal();
      this.startModalCountdown();
    }, this.maxAge - this.bufferSessionExtension);
  }

  stopCounters = () => {
    clearTimeout(this.sessionTimeout);
    clearTimeout(this.modalTimeout);
    clearInterval(this.modalCountdown);
  }

  resetModalMessage = () => {
    this.modalCountdownElement.innerHTML = i18n.components.timeoutModal.initialDescription;
  }

  restartCounters = () => {
    this.stopCounters();
    this.startCounter();
    this.resetModalMessage();
  }

  startModalCountdown = () => {
    let count = 0;
    let minutes: number = 2;
    let seconds: string = '00';
    this.modalCountdown = window.setInterval(() => {
      minutes = moment.duration((this.bufferSessionExtension - count)).minutes();
      seconds = moment.duration((this.bufferSessionExtension - count)).seconds().toLocaleString('en-GB', { minimumIntegerDigits: 2 });
      this.modalCountdownElement.innerHTML = `${i18n.components.timeoutModal.description[0]} ${minutes}:${seconds} ${i18n.components.timeoutModal.description[1]}`;
      count += 1000;
    }, 1000);
  }

  openModal = () => {
    this.modalElement.removeAttribute('aria-hidden');
    this.modalOverlayElement.removeAttribute('aria-hidden');
    this.previousFocusedElement = document.activeElement as HTMLElement;
    this.firstFocusableElement.focus();
    this.disableScroll();
    this.body.addEventListener('keydown', this.keyDownEventListener);
  }

  disableScroll = () => {
    this.scrollPosition = window.pageYOffset;
    this.body.style.overflow = 'hidden';
    this.body.style.position = 'fixed';
    this.body.style.width = '100%';
    this.body.style.top = `-${this.scrollPosition}px`;
  }

  enableScroll = () => {
    this.body.style.removeProperty('overflow');
    this.body.style.removeProperty('position');
    this.body.style.removeProperty('width');
    window.scrollTo(0, this.scrollPosition);
  }

  closeModal = () => {
    this.modalElement.setAttribute('aria-hidden', 'true');
    this.modalOverlayElement.setAttribute('aria-hidden', 'true');

    document.querySelector('body').removeEventListener('keydown', this.keyDownEventListener);
    if (this.previousFocusedElement) this.previousFocusedElement.focus();
    this.enableScroll();
  }

  signOut() {
    window.location.assign(paths.session.sessionExpired);
  }

  extendSession = (): Promise<void> => {
    return axios.get(paths.session.extendSession).then((response: any): void => {
      this.maxAge = response.data.timeout;
      this.restartCounters();
      this.closeModal();
    }).catch((e) => {
      this.removeListeners();
      this.stopCounters();
    });
  }

  keyDownEventListener = (event) => {
    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        if (!this.modalElement.contains(document.activeElement) || this.focusableElements.length === 1) {
          this.firstFocusableElement.focus();
          break;
        }
        if (event.shiftKey) {
          if (document.activeElement === this.firstFocusableElement) {
            this.lastFocusableElement.focus();
          }
        } else {
          if (document.activeElement === this.lastFocusableElement) {
            this.firstFocusableElement.focus();
          }
        }
        break;
      default:
        break;
    }
  }
}
