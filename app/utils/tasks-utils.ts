import * as _ from 'lodash';

function appealApplicationStatus(appeal: Appeal) {
  const homeOfficeRefNumber: boolean = !!_.get(appeal.application, 'homeOfficeRefNumber');
  const dateLetterSent: boolean = !!_.get(appeal.application, 'dateLetterSent');
  const isAppealLate: boolean = _.get(appeal.application, 'isAppealLate');
  const apppealLateReason: boolean = !!_.get(appeal.application, 'lateAppeal.reason');

  const homeOfficeDetails = {
    saved: homeOfficeRefNumber || dateLetterSent || apppealLateReason,
    completed: homeOfficeRefNumber && dateLetterSent && (!isAppealLate || (isAppealLate && apppealLateReason))
  };

  const givenNames: boolean = !!_.get(appeal.application, 'personalDetails.givenNames');
  const familyName: boolean = !!_.get(appeal.application, 'personalDetails.familyName');
  const dob: boolean = !!_.get(appeal.application, 'personalDetails.dob');
  const nationality: boolean = !!_.get(appeal.application, 'personalDetails.nationality');
  const postcode: boolean = !!_.get(appeal.application, 'contactDetails.address.postcode');
  const line1: boolean = !!_.get(appeal.application, 'contactDetails.address.line1');
  const personalDetails = {
    saved: givenNames || familyName || dob || nationality || postcode || line1,
    completed: givenNames && familyName && dob && nationality && postcode && line1
  };

  const email: boolean = !!_.get(appeal.application, 'contactDetails.email');
  const phone: boolean = !!_.get(appeal.application, 'contactDetails.phone');
  const contactDetails = {
    saved: email || phone,
    completed: email || phone
  };

  const typeOfAppeal = {
    saved: !!_.get(appeal.application, 'appealType'),
    completed: !!_.get(appeal.application, 'appealType')
  };

  const checkAndSend = {
    saved: false,
    completed: false
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
