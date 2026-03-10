import { paths } from '../app/paths';
import i18n from '../locale/en.json';
import { addAriaExpandedAttribute,addAriaExpandedEventListener } from './aria-utils';
import ConfirmModal from './confirm-modal';
import CookiesBanner from './cookies-banner';
import { addNationalityEventListener, addStatelessEventListener } from './nationality-utils';
import SessionTimeout from './session-timeout';
const govUK = require('govuk-frontend');

export const ready = (callback: () => void): void => {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
};

function initialize() {
  const cookies: CookiesBanner = new CookiesBanner();
  const sessionTimeout: SessionTimeout = new SessionTimeout();
  const confirmCreateModal: ConfirmModal = new ConfirmModal();
  cookies.init();
  govUK.initAll();
  sessionTimeout.init();
  confirmCreateModal.init();
  addAriaExpandedAttribute();
  addAriaExpandedEventListener();
  addStatelessEventListener();
  addNationalityEventListener();
}

export {
  initialize,
};
