function addBackLinkEventListener() {
  document.querySelectorAll<HTMLAnchorElement>('.govuk-back-link').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      history.go(-1);
    });
  });
}

export {
  addBackLinkEventListener
};
