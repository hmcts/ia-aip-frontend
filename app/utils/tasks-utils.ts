import * as _ from 'lodash';

function appealApplicationStatus(appeal: Appeal, drlmSetAsideFlag: Boolean): ApplicationStatus {
  const appealOutOfCountry: boolean = !!_.get(appeal.application, 'appealOutOfCountry');
  const appealType: boolean = !!_.get(appeal.application, 'appealType');
  const typeOfAppeal: Task = {
    saved: appealOutOfCountry || appealType,
    completed: appealOutOfCountry || appealType,
    active: true
  };

  const gwfRefNumber: boolean = !!_.get(appeal.application, 'gwfReferenceNumber');
  const homeOfficeRefNumber: boolean = !!_.get(appeal.application, 'homeOfficeRefNumber');
  const givenNames: boolean = !!_.get(appeal.application, 'personalDetails.givenNames');
  const familyName: boolean = !!_.get(appeal.application, 'personalDetails.familyName');
  const dob: boolean = !!_.get(appeal.application, 'personalDetails.dob');
  const nationality: boolean = !!_.get(appeal.application, 'personalDetails.nationality');
  const dateLetterSent: boolean = !!_.get(appeal.application, 'dateLetterSent');
  const decisionLetterReceived: boolean = !!_.get(appeal.application, 'decisionLetterReceivedDate');
  const homeOfficeLetter: boolean = appeal.application.homeOfficeLetter && appeal.application.homeOfficeLetter.length > 0 || false;
  const homeOfficeDetails: Task = {
    saved: gwfRefNumber || homeOfficeRefNumber || givenNames || familyName || dob || nationality || decisionLetterReceived || homeOfficeLetter,
    completed: homeOfficeLetter && givenNames && familyName && dob && nationality && ((homeOfficeRefNumber && dateLetterSent) || (gwfRefNumber && decisionLetterReceived) || (homeOfficeRefNumber && decisionLetterReceived)),
    active: typeOfAppeal.completed
  };
  const homeOfficeDetailsOOC: Task = {
    saved: gwfRefNumber || homeOfficeRefNumber || givenNames || familyName || dob || nationality || decisionLetterReceived || homeOfficeLetter,
    completed: homeOfficeLetter && givenNames && familyName && dob && nationality && ((homeOfficeRefNumber && dateLetterSent) || (gwfRefNumber && decisionLetterReceived) || (homeOfficeRefNumber && decisionLetterReceived)),
    active: typeOfAppeal.completed
  };

  const email: boolean = !!_.get(appeal.application, 'contactDetails.email');
  const wantsEmail: boolean = !!_.get(appeal.application, 'contactDetails.wantsEmail');
  const phone: boolean = !!_.get(appeal.application, 'contactDetails.phone');
  const wantsSms: boolean = !!_.get(appeal.application, 'contactDetails.wantsSms');
  const appellantOutOfCountryAddress: boolean = !!_.get(appeal.application, 'appellantOutOfCountryAddress');
  const postcode: boolean = !!_.get(appeal.application, 'personalDetails.address.postcode');
  const line1: boolean = !!_.get(appeal.application, 'personalDetails.address.line1');
  const hasSponsor: boolean = appeal.application.hasSponsor === 'Yes';
  const sponsorEmail: boolean = !!_.get(appeal.application, 'sponsorContactDetails.email');
  const sponsorWantsEmail: boolean = !!_.get(appeal.application, 'sponsorContactDetails.wantsEmail');
  const sponsorPhone: boolean = !!_.get(appeal.application, 'sponsorContactDetails.phone');
  const sponsorWantsSms: boolean = !!_.get(appeal.application, 'sponsorContactDetails.wantsSms');
  const sponsorGivenNames: boolean = !!_.get(appeal.application, 'sponsorGivenNames');
  const sponsorFamilyName: boolean = !!_.get(appeal.application, 'sponsorFamilyName');
  const sponsorAddress: boolean = !!_.get(appeal.application, 'sponsorAddress');
  const sponsorAuthorisation: boolean = !!_.get(appeal.application, 'sponsorAuthorisation');
  const appellantContactDetails: boolean = (email && wantsEmail || phone && wantsSms) && (line1 || appellantOutOfCountryAddress);
  const sponsorContactDetails: boolean = sponsorEmail && sponsorWantsEmail || sponsorPhone && sponsorWantsSms;
  const sponsorDetailsComplete: boolean = sponsorGivenNames && sponsorFamilyName && sponsorAddress && sponsorContactDetails && sponsorAuthorisation;
  const hasSponsorOrNlrComplete: boolean = !!_.get(appeal.application, 'hasNonLegalRep') && !!_.get(appeal.application, 'hasSponsor');
  const hasNlr: boolean = appeal.application.hasNonLegalRep === 'Yes';
  const nlrGivenNames: boolean = !!_.get(appeal.nlrDetails, 'givenNames');
  const nlrFamilyName: boolean = !!_.get(appeal.nlrDetails, 'familyName');
  const nlrPhoneNumber: boolean = !!_.get(appeal.nlrDetails, 'phoneNumber');
  const nlrEmailAddress: boolean = !!_.get(appeal.nlrDetails, 'emailAddress');
  const nlrAddress: boolean = !!_.get(appeal.nlrDetails, 'address');
  const isSponsorSameAsNlrYes: boolean = appeal?.application?.isSponsorSameAsNlr === 'Yes' || false;
  const isSponsorSameAsNlrNo: boolean = appeal?.application?.isSponsorSameAsNlr === 'No' || false;
  const nlrLine1: boolean = !!_.get(appeal.nlrDetails, 'addressUk.line1');
  const nlrCity: boolean = !!_.get(appeal.nlrDetails, 'addressUk.city');
  const nlrPostcode: boolean = !!_.get(appeal.nlrDetails, 'addressUk.postcode');
  const nlrAddressComplete: boolean = isSponsorSameAsNlrYes ? nlrLine1 && nlrCity && nlrPostcode : nlrAddress;
  const nlrDetailsComplete: boolean = nlrGivenNames && nlrFamilyName && nlrPhoneNumber && nlrEmailAddress && nlrAddressComplete;

  const sponsorDetailsRequired = hasSponsor && (!hasNlr || isSponsorSameAsNlrNo);
  const sponsorNlrDetailsComplete =
    (!sponsorDetailsRequired || sponsorDetailsComplete) &&
    (!hasNlr || nlrDetailsComplete);

  const contactDetails: Task = {
    saved: (email && wantsEmail) || (phone && wantsSms) || postcode || line1 || appellantOutOfCountryAddress,
    completed: appellantContactDetails && hasSponsorOrNlrComplete && sponsorNlrDetailsComplete,
    active: homeOfficeDetails.completed || homeOfficeDetailsOOC.completed
  };

  let decisionTypePage: boolean;
  let appealTypeHasFee: boolean = false;
  if (['revocationOfProtection', 'deprivation'].includes(appeal.application.appealType)) {
    decisionTypePage = !!_.get(appeal.application, 'rpDcAppealHearingOption');
  } else if (['protection', 'refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'].includes(appeal.application.appealType)) {
    decisionTypePage = !!_.get(appeal.application, 'decisionHearingFeeOption');
    appealTypeHasFee = true;
  }
  const payNow = _.get(appeal.application, 'appealType') === 'protection' && !!_.get(appeal, 'paAppealTypeAipPaymentOption');
  const decisionType: Task = {
    saved: decisionTypePage || payNow,
    completed: _.get(appeal.application, 'appealType') === 'protection' ? appealType && decisionTypePage && payNow : appealType && decisionTypePage,
    active: contactDetails.completed
  };

  if (!homeOfficeDetails.completed && !homeOfficeDetailsOOC.completed) {
    resetFeeSupportSectionStatusAndValues(appeal.application);
  }

  const feeSupport: Task = {
    saved: false,
    completed: (appeal.application.feeSupportPersisted ? true : false) && decisionType.completed,
    active: decisionType.completed
  };

  const checkAndSend: Task = {
    saved: false,
    completed: false,
    active: decisionType.completed
  };

  const checkAndSendDlrmSetAsideFlag: Task = {
    saved: false,
    completed: false,
    active: feeSupport.completed
  };

  const checkAndSendWithPayments: Task = {
    saved: false,
    completed: false,
    active: decisionType.completed
  };

  const checkAndSendWithPaymentsDlrmSetAsideFlag: Task = {
    saved: false,
    completed: false,
    active:
      homeOfficeDetails.completed
      && homeOfficeDetailsOOC.completed
      && contactDetails.completed
      && typeOfAppeal.completed
      && decisionType.completed
      && feeSupport.completed
  };

  return drlmSetAsideFlag && appealTypeHasFee ? {
    homeOfficeDetails,
    homeOfficeDetailsOOC,
    contactDetails,
    typeOfAppeal,
    decisionType,
    feeSupport,
    checkAndSendDlrmSetAsideFlag,
    checkAndSendWithPaymentsDlrmSetAsideFlag
  } : {
    homeOfficeDetails,
    homeOfficeDetailsOOC,
    contactDetails,
    typeOfAppeal,
    decisionType,
    checkAndSend,
    checkAndSendWithPayments
  };

}

function submitHearingRequirementsStatus(appeal: Appeal, hasNonLegalRep: boolean) {

  const witnessesOnHearing: boolean = _.has(appeal, 'hearingRequirements.witnessesOnHearing');
  const witnessesOutsideUK: boolean = _.has(appeal, 'hearingRequirements.witnessesOutsideUK');
  const witnessNames: boolean = !!_.get(appeal, 'hearingRequirements.witnessNames');

  const witnessesTask: Task = {
    saved: witnessesOnHearing || witnessesOutsideUK || witnessNames,
    completed: witnessesOnHearing && witnessesOutsideUK,
    active: true
  };

  const isHearingLoopNeeded: boolean = _.has(appeal, 'hearingRequirements.isHearingLoopNeeded');
  const isHearingRoomNeeded: boolean = _.has(appeal, 'hearingRequirements.isHearingRoomNeeded');
  const isInterpreterServicesNeeded: boolean = !!_.get(appeal, 'hearingRequirements.isInterpreterServicesNeeded');

  const accessNeedsTask: Task = {
    saved: isHearingLoopNeeded || isHearingRoomNeeded || isInterpreterServicesNeeded,
    completed: isHearingLoopNeeded,
    active: witnessesTask.completed
  };

  const isNlrAttending: boolean = appeal?.hearingRequirements?.nlrAttending === 'Yes';
  const isnlrAttendingOutsideUk: boolean = appeal?.hearingRequirements?.nlrAttendingOutsideUk === 'Yes';
  const areNlrRequirementsNeeded: boolean = isNlrAttending || isnlrAttendingOutsideUk;
  const nlrAttendingTask: Task = {
    saved: !!_.get(appeal, 'hearingRequirements.nlrAttending'),
    completed: _.has(appeal, isNlrAttending ? 'hearingRequirements.nlrAttending' : 'hearingRequirements.nlrAttendingOutsideUk'),
    active: hasNonLegalRep && accessNeedsTask.completed
  };

  const nlrNeeds: boolean = !!_.get(appeal, 'hearingRequirements.nlrNeeds');
  const nlrNeedsTask: Task = {
    saved: nlrNeeds,
    completed: _.has(appeal, 'hearingRequirements.nlrNeedsHearingLoop'),
    active: areNlrRequirementsNeeded && hasNonLegalRep && nlrAttendingTask.completed
  };

  const otherNeeds: boolean = !!_.get(appeal, 'hearingRequirements.otherNeeds');

  const otherNeedsNonLegalRep: boolean = areNlrRequirementsNeeded ? nlrNeedsTask.completed : nlrAttendingTask.completed;
  const otherNeedsTask: Task = {
    saved: otherNeeds,
    completed: _.has(appeal, 'hearingRequirements.otherNeeds.anythingElse'),
    active: hasNonLegalRep ? otherNeedsNonLegalRep : accessNeedsTask.completed
  };

  let datesToAvoidCompleted: boolean = !!_.get(appeal, 'hearingRequirements.datesToAvoid');
  if (_.has(appeal, 'hearingRequirements.datesToAvoid')) {
    const { datesToAvoid } = appeal.hearingRequirements;
    if (_.has(datesToAvoid, 'isDateCannotAttend')) {
      if (datesToAvoid.isDateCannotAttend && (!datesToAvoid.dates || datesToAvoid.dates.length === 0)) {
        datesToAvoidCompleted = false;
      }
    }
  }

  const datesToAvoidTask: Task = {
    saved: !!_.get(appeal, 'hearingRequirements.datesToAvoid'),
    completed: datesToAvoidCompleted,
    active: otherNeedsTask.completed
  };

  const checkAndSend: Task = {
    saved: false,
    completed: false,
    active: datesToAvoidCompleted
  };

  const returnObject = {
    witnesses: witnessesTask,
    accessNeeds: accessNeedsTask,
    nlrAttending: nlrAttendingTask,
    otherNeeds: otherNeedsTask,
    datesToAvoid: datesToAvoidTask,
    checkAndSend
  };
  if (areNlrRequirementsNeeded) returnObject['nlrNeeds'] = nlrNeedsTask;

  return returnObject;
}

function cmaRequirementsStatus(appeal: Appeal) {
  const accessNeeds: boolean = !!_.get(appeal, 'cmaRequirements.accessNeeds');

  const accessNeedsTask: Task = {
    saved: accessNeeds,
    completed: _.has(appeal, 'cmaRequirements.accessNeeds.isHearingLoopNeeded'),
    active: true
  };
  const otherNeeds: boolean = !!_.get(appeal, 'cmaRequirements.otherNeeds');

  const otherNeedsTask: Task = {
    saved: otherNeeds,
    completed: _.has(appeal, 'cmaRequirements.otherNeeds.anythingElse'),
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

/**
 * Creates a new Section object and determines the current status of the step using the taskIds provided.
 * @param sectionId the sectionId to construct a new Section Object
 * @param taskIds the taskId under the section used to check for saved status and completion status
 * @param req the request Object containing the session
 */
function buildSectionObject(sectionId: string, taskIds: string[], status: ApplicationStatus): Section {
  function isSaved(taskId: string) {
    return status[taskId].saved;
  }

  function isCompleted(taskId: string) {
    return status[taskId].completed;
  }

  function isActive(taskId: string) {
    return status[taskId].active;
  }

  const tasks: Task[] = taskIds.map((taskId): Task => {
    const completed: boolean = isCompleted(taskId);
    const saved: boolean = isSaved(taskId);
    const active: boolean = isActive(taskId);
    return { id: taskId, saved, completed, active };
  });
  return { sectionId, tasks };
}

/**
 * Resets FeeSupport section status and values. When the user changes the appeal type or appeal out of country
 */
function resetFeeSupportSectionStatusAndValues(application: AppealApplication) {
  application.remissionOption = null;
  application.asylumSupportRefNumber = null;
  application.helpWithFeesOption = null;
  application.helpWithFeesRefNumber = null;
  application.localAuthorityLetters = null;
  application.feeSupportPersisted = false;
}

function hasValue(appeal: Appeal, path: string): boolean {
  const value = _.get(appeal, path);
  return value !== null && value !== undefined;
}
function addNonLegalRepStatus(appeal: Appeal): ApplicationStatus {
  const provideNlrEmail: Task = {
    id: 'provideNlrEmail',
    active: !hasValue(appeal, 'nlrDetails.emailAddress'),
    saved: hasValue(appeal, 'nlrDetails.emailAddress'),
    completed: hasValue(appeal, 'nlrDetails.emailAddress')
  };

  const hasSponsor = _.get(appeal, 'application.hasSponsor') === 'Yes';
  const isNlrSameAsSponsor: Task = {
    id: 'isNlrSameAsSponsor',
    active: provideNlrEmail.completed && hasSponsor && !hasValue(appeal, 'application.isSponsorSameAsNlr'),
    saved: !hasSponsor || hasValue(appeal, 'application.isSponsorSameAsNlr'),
    completed: !hasSponsor || hasValue(appeal, 'application.isSponsorSameAsNlr')
  };

  const provideNlrName: Task = {
    id: 'provideNlrName',
    active: provideNlrEmail.completed && !hasValue(appeal, 'nlrDetails.givenNames'),
    saved: hasValue(appeal, 'nlrDetails.givenNames') && hasValue(appeal, 'nlrDetails.familyName'),
    completed: hasValue(appeal, 'nlrDetails.givenNames') && hasValue(appeal, 'nlrDetails.familyName')
  };

  const provideNlrAddress: Task = {
    id: 'provideNlrAddress',
    active: provideNlrEmail.completed && (_.get(appeal, 'application.isSponsorSameAsNlr') === 'Yes' ? !hasValue(appeal, 'nlrDetails.addressUk') : !hasValue(appeal, 'nlrDetails.address')),
    saved: _.get(appeal, 'application.isSponsorSameAsNlr') === 'Yes' ? hasValue(appeal, 'nlrDetails.addressUk.line1') && hasValue(appeal, 'nlrDetails.addressUk.city') && hasValue(appeal, 'nlrDetails.addressUk.postcode') : hasValue(appeal, 'nlrDetails.address'),
    completed: _.get(appeal, 'application.isSponsorSameAsNlr') === 'Yes' ? hasValue(appeal, 'nlrDetails.addressUk.line1') && hasValue(appeal, 'nlrDetails.addressUk.city') && hasValue(appeal, 'nlrDetails.addressUk.postcode') : hasValue(appeal, 'nlrDetails.address')
  };

  const provideNlrPhone: Task = {
    id: 'provideNlrPhone',
    active: provideNlrEmail.completed && !hasValue(appeal, 'nlrDetails.phoneNumber'),
    saved: hasValue(appeal, 'nlrDetails.phoneNumber'),
    completed: hasValue(appeal, 'nlrDetails.phoneNumber')
  };

  const nlrDetailsProvided: boolean = provideNlrEmail.completed && isNlrSameAsSponsor.completed
    && provideNlrName.completed && provideNlrAddress.completed && provideNlrPhone.completed;

  const checkAndSend: Task = {
    id: 'checkAndSend',
    active: nlrDetailsProvided && !hasValue(appeal, 'nlrDetails.idamId'),
    saved: nlrDetailsProvided && hasValue(appeal, 'nlrDetails.idamId'),
    completed: nlrDetailsProvided && hasValue(appeal, 'nlrDetails.idamId')
  };

  return hasSponsor ? {
    provideNlrEmail,
    isNlrSameAsSponsor,
    provideNlrName,
    provideNlrAddress,
    provideNlrPhone,
    checkAndSend
  } : {
    provideNlrEmail,
    provideNlrName,
    provideNlrAddress,
    provideNlrPhone,
    checkAndSend
  };
}

export {
  appealApplicationStatus,
  buildSectionObject,
  cmaRequirementsStatus,
  submitHearingRequirementsStatus,
  addNonLegalRepStatus,
  resetFeeSupportSectionStatusAndValues
};
