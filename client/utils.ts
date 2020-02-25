const govUK = require('govuk-frontend');
import { addAriaExpandedAttribute,addAriaExpandedEventListener } from './aria-utils';
import CookiesBanner from './cookies-banner';
import SessionTimeout from './session-timeout';

const ready = (callback) => {
  if (document.readyState !== 'loading') callback();
  else document.addEventListener('DOMContentLoaded', callback);
};

function initialize() {
  const cookies: CookiesBanner = new CookiesBanner();
  const sessionTimeout: SessionTimeout = new SessionTimeout();
  cookies.init();
  govUK.initAll();
  sessionTimeout.init();
  addAriaExpandedAttribute();
  addAriaExpandedEventListener();
}

export {
  initialize,
  ready
};
