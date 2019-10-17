import * as govUK from 'govuk-frontend';
import CookiesBanner from './cookies-banner';

const ready = (callback) => {
  if (document.readyState !== 'loading') callback();
  else document.addEventListener('DOMContentLoaded', callback);
};

ready(() => {
  const cookies: CookiesBanner = new CookiesBanner();
  cookies.init();
  govUK.initAll();
});

export {
  ready
};
