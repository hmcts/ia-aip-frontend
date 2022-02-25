import * as _ from 'lodash';

function appealApplicationStatus(appeal: Appeal): ApplicationStatus {
  const appealOutOfCountry: boolean = !!_.get(appeal.application, 'appealOutOfCountry');
  const appealType: boolean = !!_.get(appeal.application, 'appealType');
  const typeOfAppeal: Task = {
    saved: appealOutOfCountry || appealType,
    completed: appealOutOfCountry || appealType,
    active: true
  };

  const homeOfficeRefNumber: boolean = !!_.get(appeal.application, 'homeOfficeRefNumber');
  const dateLetterSent: boolean = !!_.get(appeal.application, 'dateLetterSent');
  const homeOfficeLetter: boolean = appeal.application.homeOfficeLetter && appeal.application.homeOfficeLetter.length > 0 || false;
  const homeOfficeDetails: Task = {
    saved: homeOfficeRefNumber || dateLetterSent || homeOfficeLetter,
    completed: homeOfficeRefNumber && dateLetterSent && homeOfficeLetter,
    active: typeOfAppeal.completed
  };

  const givenNames: boolean = !!_.get(appeal.application, 'personalDetails.givenNames');
  const familyName: boolean = !!_.get(appeal.application, 'personalDetails.familyName');
  const dob: boolean = !!_.get(appeal.application, 'personalDetails.dob');
  const nationality: boolean = !!_.get(appeal.application, 'personalDetails.nationality');
  const appellantOutOfCountryAddress: boolean = !!_.get(appeal.application, 'appellantOutOfCountryAddress');
  const postcode: boolean = !!_.get(appeal.application, 'personalDetails.address.postcode');
  const line1: boolean = !!_.get(appeal.application, 'personalDetails.address.line1');
  const personalDetails: Task = {
    saved: givenNames || familyName || dob || nationality || postcode || line1,
    completed: givenNames && familyName && dob && nationality && (line1 || appellantOutOfCountryAddress),
    active: homeOfficeDetails.completed
  };

  const email: boolean = !!_.get(appeal.application, 'contactDetails.email');
  const wantsEmail: boolean = !!_.get(appeal.application, 'contactDetails.wantsEmail');
  const phone: boolean = !!_.get(appeal.application, 'contactDetails.phone');
  const wantsSms: boolean = !!_.get(appeal.application, 'contactDetails.wantsSms');
  const hasSponsorNo: boolean = appeal.application.hasSponsor && appeal.application.hasSponsor === 'No' || false;
  const hasSponsorYes: boolean = appeal.application.hasSponsor && appeal.application.hasSponsor === 'Yes' || false;
  const sponsorEmail: boolean = !!_.get(appeal.application, 'sponsorContactDetails.email');
  const sponsorWantsEmail: boolean = !!_.get(appeal.application, 'sponsorContactDetails.wantsEmail');
  const sponsorPhone: boolean = !!_.get(appeal.application, 'sponsorContactDetails.phone');
  const sponsorWantsSms: boolean = !!_.get(appeal.application, 'sponsorContactDetails.wantsSms');
  const sponsorGivenNames: boolean = !!_.get(appeal.application, 'sponsorGivenNames');
  const sponsorFamilyName: boolean = !!_.get(appeal.application, 'sponsorFamilyName');
  const sponsorAddress: boolean = !!_.get(appeal.application, 'sponsorAddress');
  const sponsorAuthorisation: boolean = !!_.get(appeal.application, 'sponsorAuthorisation');
  const appellantContactDetails: boolean = email && wantsEmail || phone && wantsSms;
  const sponsorContactDetails: boolean = sponsorEmail && sponsorWantsEmail || sponsorPhone && sponsorWantsSms;
  const outUkContactDetailsComplete: boolean = (appellantContactDetails && hasSponsorNo) ||
      (appellantContactDetails && hasSponsorYes && sponsorGivenNames && sponsorFamilyName && sponsorAddress && sponsorContactDetails && sponsorAuthorisation);
  const contactDetails: Task = {
    saved: email && wantsEmail || phone && wantsSms,
    completed: _.get(appeal.application, 'appellantInUk') === 'Yes' ? appellantContactDetails : outUkContactDetailsComplete,
    active: personalDetails.completed
  };

  let decisionTypePage: boolean;
  if (['revocationOfProtection', 'deprivation'].includes(appeal.application.appealType)) {
    decisionTypePage = !!_.get(appeal.application, 'rpDcAppealHearingOption');
  } else if (['protection', 'refusalOfHumanRights', 'refusalOfEu'].includes(appeal.application.appealType)) {
    decisionTypePage = !!_.get(appeal.application, 'decisionHearingFeeOption');
  }
  const payNow = _.get(appeal.application, 'appealType') === 'protection' && !!_.get(appeal, 'paAppealTypeAipPaymentOption');
  const decisionType: Task = {
    saved: decisionTypePage || payNow,
    completed: _.get(appeal.application, 'appealType') === 'protection' ? appealType && decisionTypePage && payNow : appealType && decisionTypePage,
    active: contactDetails.completed
  };

  const typeOfAppealAndDecision: Task = {
    saved: appealType || decisionTypePage || payNow,
    completed: _.get(appeal.application, 'appealType') === 'protection' ? appealType && decisionTypePage && payNow : appealType && decisionTypePage,
    active: contactDetails.completed
  };

  const checkAndSend: Task = {
    saved: false,
    completed: false,
    active: typeOfAppealAndDecision.completed
  };

  const checkAndSendWithPayments: Task = {
    saved: false,
    completed: false,
    active: typeOfAppealAndDecision.completed
  };

  return {
    homeOfficeDetails,
    personalDetails,
    contactDetails,
    typeOfAppeal,
    decisionType,
    typeOfAppealAndDecision,
    checkAndSend,
    checkAndSendWithPayments
  };
}

function submitHearingRequirementsStatus(appeal: Appeal) {

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
  const otherNeeds: boolean = !!_.get(appeal, 'hearingRequirements.otherNeeds');

  const otherNeedsTask: Task = {
    saved: otherNeeds,
    completed: _.has(appeal, 'hearingRequirements.otherNeeds.anythingElse'),
    active: accessNeedsTask.completed
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

  return {
    witnesses: witnessesTask,
    accessNeeds: accessNeedsTask,
    otherNeeds: otherNeedsTask,
    datesToAvoid: datesToAvoidTask,
    checkAndSend
  };
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

export {
  appealApplicationStatus,
  buildSectionObject,
  cmaRequirementsStatus,
  submitHearingRequirementsStatus
};
