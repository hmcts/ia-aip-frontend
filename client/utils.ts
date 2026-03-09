import { paths } from '../app/paths';
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

function createModal(id: string, path: string): ConfirmModal {
  return new ConfirmModal(id, () => window.location.assign(path));
}

function initialize() {
  const cookies: CookiesBanner = new CookiesBanner();
  const sessionTimeout: SessionTimeout = new SessionTimeout();
  const modals = [
    createModal('confirm-create-modal', paths.common.createNewAppeal),
    createModal('confirm-delete-modal', paths.common.deleteDraftAppeal)
  ];
  cookies.init();
  govUK.initAll();
  sessionTimeout.init();
  modals.forEach(modal => modal.init());
  addAriaExpandedAttribute();
  addAriaExpandedEventListener();
  addStatelessEventListener();
  addNationalityEventListener();
}

export {
  initialize,
};
