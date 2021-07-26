function addStatelessEventListener() {
  const statelessCheckbox: HTMLInputElement = document.querySelector('#stateless');
  const nationality: HTMLInputElement = document.querySelector('#nationality');
  if (statelessCheckbox && nationality) {
    statelessCheckbox.addEventListener('change', function () {
      if (this.checked) nationality.value = '';
    });
  }
}

function addNationalityEventListener() {
  const statelessCheckbox: HTMLInputElement = document.querySelector('#stateless');
  const nationality: HTMLInputElement = document.querySelector('#nationality');
  if (statelessCheckbox && nationality) {
    nationality.addEventListener('change', function () {
      if (this.value !== '') statelessCheckbox.checked = false;
    });
  }
}

export {
  addStatelessEventListener,
  addNationalityEventListener
};
