import { paths } from '../app/paths';
import i18n from '../locale/en.json';
import { addAriaExpandedAttribute,addAriaExpandedEventListener } from './aria-utils';
import CookiesBanner from './cookies-banner';
import CreateModal from './create-modal';
import DeleteModal from './delete-modal';
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
  const confirmCreateModal: CreateModal = new CreateModal();
  const deleteDraftModal: DeleteModal = new DeleteModal();
  cookies.init();
  govUK.initAll();
  sessionTimeout.init();
  confirmCreateModal.init();
  deleteDraftModal.init();
  addAriaExpandedAttribute();
  addAriaExpandedEventListener();
  addStatelessEventListener();
  addNationalityEventListener();
}

export {
  initialize,
};
