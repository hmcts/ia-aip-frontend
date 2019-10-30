const paths = {
  index: '/',
  health: '/health',
  liveness: '/liveness',
  healthLiveness: '/health/liveness',
  taskList: '/task-list',
  login: '/login',
  logout: '/logout',
  start: '/start',
  personalDetails: {
    name: '/personal-details/name',
    nationality: '/personal-details/nationality',
    dob: '/personal-details/date-of-birth',
    enterPostcode: 'personal-details/enter-postcode',
    enterAddress: 'personal-details/enter-address'
  },
  homeOffice: {
    details: '/home-office/details',
    letterSent: '/home-office/letter-sent',
    appealLate: '/home-office/appeal-late'
  },
  typeOfAppeal: '/type-of-appeal',
  devNextPage: '/dev-next-page',
  contactDetails: '/contact-details',
  checkAndSend: '/check-and-send'
};

export {
  paths
};
