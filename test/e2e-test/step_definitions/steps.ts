const { checkAndSend } = require('../pages/check-and-send/check-and-send');
const { typeOfAppeal } = require('../pages/type-of-appeal/type-of-appeal');
const { fillInContactDetails } = require('../pages/contact-details/contact-details');
const { fillInPersonalDetails } = require('../pages/personal-details/personal-details');
const { fillInHomeOfficeDetails } = require('../pages/home-office-details/ref-number-page');
const { signIn } = require('../pages/sign-in');
const { common } = require('../pages/common');
const { homeOfficeReferenceNumber } = require('../pages/home-office-details/home-office-reference-number');
const { homeOfficeLetterSent } = require('../pages/home-office-details/home-office-letter-sent');
const { taskList } = require('../pages/task-list');
const { namePage } = require('../pages/personal-details/personal-details-name');
const { dateOfBirth } = require('../pages/personal-details/personal-details-date-of-birth');
const { reasonsForAppeal } = require('../pages/reason-for-appeal/reason-for-appeal');

const { I } = inject();

signIn(I);
fillInHomeOfficeDetails(I);
fillInPersonalDetails(I);
fillInContactDetails(I);
typeOfAppeal(I);
checkAndSend(I);
common(I);
homeOfficeReferenceNumber(I);
homeOfficeLetterSent(I);
taskList(I);
namePage(I);
dateOfBirth(I);
reasonsForAppeal(I);
