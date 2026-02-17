function addAriaExpandedAttribute() {
  document.querySelectorAll('details').forEach(detail => {
    if (detail.open) {
      detail.setAttribute('aria-expanded', 'true');
    } else {
      detail.setAttribute('aria-expanded', 'false');
    }
  });
}

function addAriaExpandedEventListener() {
  document.querySelectorAll('details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      detail.open ? detail.setAttribute('aria-expanded', 'true') : detail.setAttribute('aria-expanded', 'false');
    });
  });
}

export {
  addAriaExpandedAttribute,
  addAriaExpandedEventListener
};
