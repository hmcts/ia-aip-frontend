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
      detail.setAttribute('aria-expanded', detail.open ? 'true': 'false');
    });
  });
}

export {
  addAriaExpandedAttribute,
  addAriaExpandedEventListener
};
