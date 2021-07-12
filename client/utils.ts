const govUK = require('govuk-frontend');
import { addAriaExpandedAttribute,addAriaExpandedEventListener } from './aria-utils';
import { CheckCookies } from './check-cookies';
import CookiesBanner from './cookies-banner';
import { CookiePolicy } from './cookies-policy';
import SessionTimeout from './session-timeout';

const ready = (callback) => {
  if (document.readyState !== 'loading') callback();
  else document.addEventListener('DOMContentLoaded', callback);
};

function initialize() {
  const checkCookies = new CheckCookies();
  const cookies: CookiesBanner = new CookiesBanner();
  const sessionTimeout: SessionTimeout = new SessionTimeout();
  const cookiePolicy: CookiePolicy = new CookiePolicy();
  cookies.init();
  checkCookies.init();
  govUK.initAll();
  sessionTimeout.init();
  cookiePolicy.init();
  addAriaExpandedAttribute();
  addAriaExpandedEventListener();
}

export {
  initialize,
  ready
};
