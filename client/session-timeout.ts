import axios from 'axios';
import moment from 'moment';
import { paths } from '../app/paths';
import i18n from '../locale/en.json';
import ConfirmModal from './confirm-modal';

export default class SessionTimeout extends ConfirmModal {
  public sessionExpirationTime: string;
  public sessionTimeoutCountdown: number;
  public bufferSessionExtension: number = 2 * 60 * 1000;
  private sessionTimeout: number;
  private modalTimeout: number;
  private modalCountdown: number;
  private modalCountdownElement: HTMLElement = null;

  constructor() {
    super();
    this.init = this.init.bind(this);
    this.modalElement = document.querySelector('#timeout-modal');
    this.modalOverlayElement = document.querySelector('#modal-overlay');
    this.modalCountdownElement = document.querySelector('#dialog-description');
    this.confirmButtonElement = document.querySelector('#extend-session');
    this.body = document.querySelector('body');
    this.setupModal();
  }

  init() {
    this.addButtonListeners();
    void this.doAction();
  }

  addButtonListeners = () => {
    if (this.confirmButtonElement) this.confirmButtonElement.addEventListener('click', this.extendSession);
    if (this.cancelButtonElement) this.cancelButtonElement.addEventListener('click', this.closeModal);
  };

  removeButtonListeners = () => {
    if (this.confirmButtonElement) this.confirmButtonElement.removeEventListener('click', this.extendSession);
    if (this.cancelButtonElement) this.cancelButtonElement.removeEventListener('click', this.closeModal);
  };

  extendSession = (): Promise<void> => {
    return axios.get(paths.common.extendSession).then((response: any): void => {
      this.sessionExpirationTime = response.data.timeout;
      this.restartCounters();
      this.closeModal();
    }).catch((e) => {
      this.removeButtonListeners();
      this.stopCounters();
    });
  };

  startCounter = () => {
    const sessionExpirationTimeMoment = moment(this.sessionExpirationTime);
    this.sessionTimeoutCountdown = sessionExpirationTimeMoment.diff(moment());
    this.sessionTimeout = window.setTimeout(() => {
      this.signOut();
    }, this.sessionTimeoutCountdown);
    this.modalTimeout = window.setTimeout(() => {
      this.openModal();
      this.startModalCountdown();
    }, this.sessionTimeoutCountdown - (this.bufferSessionExtension + 1));
  };

  stopCounters = () => {
    clearTimeout(this.sessionTimeout);
    clearTimeout(this.modalTimeout);
    clearInterval(this.modalCountdown);
  };

  resetModalMessage = () => {
    this.modalCountdownElement.innerHTML = i18n.components.timeoutModal.initialDescription;
  };

  restartCounters = () => {
    this.stopCounters();
    this.startCounter();
    this.resetModalMessage();
  };

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
  };

  signOut() {
    window.location.assign(paths.common.sessionExpired);
  }
}
