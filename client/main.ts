import * as govUK from 'govuk-frontend';

const ready = (callback) => {
  if (document.readyState != "loading") callback();
  else document.addEventListener("DOMContentLoaded", callback);
}

ready(() => {
  try {
    govUK.initAll('a');
  } catch(e) {
    console.log(e.message);
  }
})