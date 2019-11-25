import * as _ from 'lodash';

function appealApplicationStatus(appeal: Appeal) {
  const homeOfficeRefNumber: boolean = !!_.get(appeal.application, 'homeOfficeRefNumber');
  const dateLetterSent: boolean = !!_.get(appeal.application, 'dateLetterSent');
  const isAppealLate: boolean = _.get(appeal.application, 'isAppealLate');
  const apppealLateReason: boolean = !!_.get(appeal.application, 'lateAppeal.reason');

  const homeOfficeDetails: Task = {
    saved: homeOfficeRefNumber || dateLetterSent || apppealLateReason,
    completed: homeOfficeRefNumber && dateLetterSent && (!isAppealLate || (isAppealLate && apppealLateReason)),
    active: true
  };

  const givenNames: boolean = !!_.get(appeal.application, 'personalDetails.givenNames');
  const familyName: boolean = !!_.get(appeal.application, 'personalDetails.familyName');
  const dob: boolean = !!_.get(appeal.application, 'personalDetails.dob');
  const nationality: boolean = !!_.get(appeal.application, 'personalDetails.nationality');
  const postcode: boolean = !!_.get(appeal.application, 'personalDetails.address.postcode');
  const line1: boolean = !!_.get(appeal.application, 'personalDetails.address.line1');
  const personalDetails: Task = {
    saved: givenNames || familyName || dob || nationality || postcode || line1,
    completed: givenNames && familyName && dob && nationality && postcode && line1,
    active: homeOfficeDetails.completed
  };

  const email: boolean = !!_.get(appeal.application, 'contactDetails.email');
  const phone: boolean = !!_.get(appeal.application, 'contactDetails.phone');
  const contactDetails: Task = {
    saved: email || phone,
    completed: email || phone,
    active: personalDetails.completed
  };

  const typeOfAppeal: Task = {
    saved: !!_.get(appeal.application, 'appealType'),
    completed: !!_.get(appeal.application, 'appealType'),
    active: contactDetails.completed
  };

  const checkAndSend: Task = {
    saved: false,
    completed: false,
    active: typeOfAppeal.completed
  };

  return {
    homeOfficeDetails,
    personalDetails,
    contactDetails,
    typeOfAppeal,
    checkAndSend
  };
}

export {
  appealApplicationStatus
};
