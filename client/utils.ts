import { paths } from '../app/paths';
import { addAriaExpandedAttribute,addAriaExpandedEventListener } from './aria-utils';
import ConfirmModal from './confirm-modal';
import CookiesBanner from './cookies-banner';
import { addNationalityEventListener, addStatelessEventListener } from './nationality-utils';
import SessionTimeout from './session-timeout';
const govUK = require('govuk-frontend');

const ready = (callback) => {
  if (document.readyState !== 'loading') callback();
  else document.addEventListener('DOMContentLoaded', callback);
};

function initialize() {
  const cookies: CookiesBanner = new CookiesBanner();
  const sessionTimeout: SessionTimeout = new SessionTimeout();
  const confirmCreateModal: ConfirmModal = new ConfirmModal('confirm-create-modal',
    () => window.location.assign(paths.common.createNewAppeal));
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
  ready
};
