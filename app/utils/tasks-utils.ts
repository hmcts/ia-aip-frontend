import * as _ from 'lodash';

function appealApplicationStatus(appeal: Appeal): ApplicationStatus {
  const homeOfficeRefNumber: boolean = !!_.get(appeal.application, 'homeOfficeRefNumber');
  const dateLetterSent: boolean = !!_.get(appeal.application, 'dateLetterSent');
  const homeOfficeLetter: boolean = appeal.application.homeOfficeLetter && appeal.application.homeOfficeLetter.length > 0 || false;

  const homeOfficeDetails: Task = {
    saved: homeOfficeRefNumber || dateLetterSent || homeOfficeLetter,
    completed: homeOfficeRefNumber && dateLetterSent && homeOfficeLetter,
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

  const appealType: boolean = !!_.get(appeal.application, 'appealType');
  let decisionType: boolean;
  if (['revocationOfProtection', 'deprivation'].includes(appeal.application.appealType)) {
    decisionType = !!_.get(appeal.application, 'rpDcAppealHearingOption');
  } else if (['protection', 'refusalOfHumanRights', 'refusalOfEu'].includes(appeal.application.appealType)) {
    decisionType = !!_.get(appeal.application, 'decisionHearingFeeOption');
  }
  const payNow = _.get(appeal.application, 'appealType') === 'protection' && !!_.get(appeal, 'paAppealTypeAipPaymentOption');
  const typeOfAppealAndDecision: Task = {
    saved: appealType || decisionType || payNow,
    completed: _.get(appeal.application, 'appealType') === 'protection' ? appealType && decisionType && payNow : appealType && decisionType,
    active: contactDetails.completed
  };

  const checkAndSend: Task = {
    saved: false,
    completed: false,
    active: typeOfAppeal.completed
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
    completed: witnessesOnHearing && witnessesOutsideUK && witnessNames,
    active: true
  };

  const accessNeeds: boolean = !!_.get(appeal, 'hearingRequirements.accessNeeds');

  const accessNeedsTask: Task = {
    saved: accessNeeds,
    completed: _.has(appeal, 'hearingRequirements.accessNeeds.isHearingLoopNeeded'),
    active: false
  };
  const otherNeeds: boolean = !!_.get(appeal, 'hearingRequirements.otherNeeds');

  const otherNeedsTask: Task = {
    saved: otherNeeds,
    completed: _.has(appeal, 'hearingRequirements.otherNeeds.anythingElse'),
    active: accessNeedsTask.completed
  };

  const datesToAvoid: boolean = !!_.get(appeal, 'hearingRequirements.datesToAvoid');

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
