import * as _ from 'lodash';

function appealApplicationStatus(appeal: Appeal) {
  const homeOfficeRefNumber: boolean = !!_.get(appeal.application, 'homeOfficeRefNumber');
  const dateLetterSent: boolean = !!_.get(appeal.application, 'dateLetterSent');

  const homeOfficeDetails: Task = {
    saved: homeOfficeRefNumber || dateLetterSent,
    completed: homeOfficeRefNumber && dateLetterSent,
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
    completed: givenNames && familyName && dob && nationality && line1,
    active: homeOfficeDetails.completed
  };

  const email: boolean = !!_.get(appeal.application, 'contactDetails.email');
  const wantsEmail: boolean = !!_.get(appeal.application, 'contactDetails.wantsEmail');
  const phone: boolean = !!_.get(appeal.application, 'contactDetails.phone');
  const wantsSms: boolean = !!_.get(appeal.application, 'contactDetails.wantsSms');
  const contactDetails: Task = {
    saved: email && wantsEmail || phone && wantsSms,
    completed: email && wantsEmail || phone && wantsSms,
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

function cmaRequirementsStatus(appeal: Appeal) {
  const accessNeeds: boolean = !!_.get(appeal, 'cmaRequirements.accessNeeds');

  const accessNeedsTask: Task = {
    saved: accessNeeds,
    completed: accessNeeds,
    active: true
  };
  const otherNeeds: boolean = !!_.get(appeal, 'cmaRequirements.otherNeeds');

  const otherNeedsTask: Task = {
    saved: otherNeeds,
    completed: otherNeeds,
    active: accessNeedsTask.completed
  };

  const datesToAvoid: boolean = !!_.get(appeal, 'cmaRequirements.datesToAvoid');

  const datesToAvoidTask: Task = {
    saved: datesToAvoid,
    completed: datesToAvoid,
    active: otherNeedsTask.completed
  };

  const checkAndSend: Task = {
    saved: false,
    completed: false,
    active: datesToAvoidTask.completed
  };

  return {
    accessNeeds: accessNeedsTask,
    otherNeeds: otherNeedsTask,
    datesToAvoid: datesToAvoidTask,
    checkAndSend
  };
}

export {
  appealApplicationStatus,
  cmaRequirementsStatus
};
