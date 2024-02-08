import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { APPLICANT_TYPE, FEATURE_FLAGS, FTPA_DECISION_OUTCOME_TYPE } from '../data/constants';
import { countryList } from '../data/country-list';
import { paths } from '../paths';
import { DocumentManagementService } from '../service/document-management-service';
import LaunchDarklyService from '../service/launchDarkly-service';
import { getHearingCentreEmail } from '../utils/cma-hearing-details';
import { dayMonthYearFormat, formatDate } from '../utils/date-utils';
import { getFee } from '../utils/payments-utils';
import { addSummaryRow, Delimiter } from '../utils/summary-list';
import {
  boolToYesNo,
  documentIdToDocStoreUrl,
  fileNameFormatter,
  formatTextForCYA,
  getApplicant,
  getApplicationType,
  getFtpaApplicantType,
  toHtmlLink,
  toIsoDate
} from '../utils/utils';

const getAppealApplicationData = (eventId: string, req: Request) => {
  const history: HistoryEvent[] = req.session.appeal.history;
  return history.filter(h => h.id === eventId);
};

async function getAppealDetails(req: Request): Promise<Array<any>> {
  const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, false);
  const { application } = req.session.appeal;
  const nation = application.personalDetails.stateless === 'isStateless' ? 'Stateless' : countryList.find(country => country.value === application.personalDetails.nationality).name;
  const homeOfficeDecisionLetterDocs = req.session.appeal.legalRepresentativeDocuments.filter(doc => doc.tag === 'homeOfficeDecisionLetter').map(doc => {
    return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${doc.fileId}'>${doc.name}</a>`;
  });
  const appellantInUk = application.appellantInUk && application.appellantInUk === 'Yes';
  const hasSponsor = application.appellantInUk && application.appellantInUk === 'No' && application.hasSponsor && application.hasSponsor === 'Yes';
  let rows = [];
  let rowsCont = [];

  if (appellantInUk) {

    rows = [
      application.appellantInUk && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appellantInUk, [application.appellantInUk], null)
    ];

    if (application.gwfReferenceNumber && application.gwfReferenceNumber !== null) {
      const gwfReferenceNumberRow = addSummaryRow(
        i18n.pages.checkYourAnswers.rowTitles.gwfReferenceNumber,
        [application.gwfReferenceNumber], null);
      rows.push(gwfReferenceNumberRow);
    } else {
      const homeOfficeRefNumberRow = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.homeOfficeRefNumber, [application.homeOfficeRefNumber], null);
      rows.push(homeOfficeRefNumberRow);
    }

    const address = application.personalDetails.address
      && _.isEmpty(application.personalDetails.address)
        ? null : application.personalDetails.address;

    rowsCont = [
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.dateLetterSent, [formatDate(toIsoDate(application.dateLetterSent))], null),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.homeOfficeDecisionLetter, homeOfficeDecisionLetterDocs, null, Delimiter.BREAK_LINE),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.name, [application.personalDetails.givenNames, application.personalDetails.familyName], null, Delimiter.SPACE),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.dob, [formatDate(toIsoDate(application.personalDetails.dob))], null),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nationality, [nation], null),
      address && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.addressDetails, [...Object.values(application.personalDetails.address)], null, Delimiter.BREAK_LINE),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.contactDetails, [
        ...(application.contactDetails.wantsEmail ? [application.contactDetails.email] : []),
        ...(application.contactDetails.wantsSms ? [application.contactDetails.phone] : [])
      ], null, Delimiter.BREAK_LINE),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealType, [i18n.appealTypes[application.appealType].name], null),
      application.isAppealLate && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealLate, [application.lateAppeal.reason], null),
      application.isAppealLate && application.lateAppeal.evidence && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.supportingEvidence, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${application.lateAppeal.evidence.fileId}'>${application.lateAppeal.evidence.name}</a>`])
    ];

    rows.push(...rowsCont);
  }

  if (!appellantInUk && hasSponsor) {

    rows = [
      application.appellantInUk && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appellantInUk, [application.appellantInUk], null)
    ];

    if (application.gwfReferenceNumber
      && application.gwfReferenceNumber !== null) {
      const gwfReferenceNumberRow = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.gwfReferenceNumber, [application.gwfReferenceNumber], null);
      rows.push(gwfReferenceNumberRow);
    } else {
      const homeOfficeRefNumberRow = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.homeOfficeRefNumber, [application.homeOfficeRefNumber], null);
      rows.push(homeOfficeRefNumberRow);
    }

    rowsCont = [
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.dateLetterSent, [formatDate(toIsoDate(application.dateLetterSent))], null),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.homeOfficeDecisionLetter, homeOfficeDecisionLetterDocs, null, Delimiter.BREAK_LINE),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.name, [application.personalDetails.givenNames, application.personalDetails.familyName], null, Delimiter.SPACE),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.dob, [formatDate(toIsoDate(application.personalDetails.dob))], null),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nationality, [nation], null),
      application.appellantOutOfCountryAddress && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appellantOutOfCountryAddress, [application.appellantOutOfCountryAddress], null),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.contactDetails, [
        ...(application.contactDetails.wantsEmail ? [application.contactDetails.email] : []), ...(application.contactDetails.wantsSms ? [application.contactDetails.phone] : [])
      ], null, Delimiter.BREAK_LINE),
      application.hasSponsor && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.hasSponsor, [application.hasSponsor], null),
      application.hasSponsor && application.hasSponsor === 'Yes' && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.sponsorNameForDisplay, [application.sponsorNameForDisplay], null),
      application.hasSponsor && application.hasSponsor === 'Yes' && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.sponsorAddressDetails, [...Object.values(application.sponsorAddress)], null, Delimiter.BREAK_LINE),
      application.hasSponsor && application.hasSponsor === 'Yes' && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.sponsorContactDetails, [
        ...(application.sponsorContactDetails.wantsEmail ? [application.sponsorContactDetails.email] : []),
        ...(application.sponsorContactDetails.wantsSms ? [application.sponsorContactDetails.phone] : [])
      ], null, Delimiter.BREAK_LINE),
      application.hasSponsor && application.hasSponsor === 'Yes' && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.sponsorAuthorisation, [application.sponsorAuthorisation], null),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealType, [i18n.appealTypes[application.appealType].name], null),
      application.isAppealLate && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealLate, [application.lateAppeal.reason], null),
      application.isAppealLate && application.lateAppeal.evidence && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.supportingEvidence, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${application.lateAppeal.evidence.fileId}'>${application.lateAppeal.evidence.name}</a>`])
    ];

    rows.push(...rowsCont);
  }

  if (!appellantInUk && !hasSponsor) {

    rows = [
      application.appellantInUk && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appellantInUk, [application.appellantInUk], null),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.homeOfficeRefNumber, [application.homeOfficeRefNumber], null),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.dateLetterSent, [formatDate(toIsoDate(application.dateLetterSent))], null),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.homeOfficeDecisionLetter, homeOfficeDecisionLetterDocs, null, Delimiter.BREAK_LINE),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.name, [application.personalDetails.givenNames, application.personalDetails.familyName], null, Delimiter.SPACE),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.dob, [formatDate(toIsoDate(application.personalDetails.dob))], null),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nationality, [nation], null),
      application.appellantOutOfCountryAddress && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appellantOutOfCountryAddress, [application.appellantOutOfCountryAddress], null),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.contactDetails, [...(application.contactDetails.wantsEmail ? [application.contactDetails.email] : []), ...(application.contactDetails.wantsSms ? [application.contactDetails.phone] : [])], null, Delimiter.BREAK_LINE),
      application.hasSponsor && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.hasSponsor, [application.hasSponsor], null),
      addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealType, [i18n.appealTypes[application.appealType].name], null),
      application.isAppealLate && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealLate, [application.lateAppeal.reason], null),
      application.isAppealLate && application.lateAppeal.evidence && addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.supportingEvidence, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${application.lateAppeal.evidence.fileId}'>${application.lateAppeal.evidence.name}</a>`])
    ];
  }

  if (paymentsFlag) {
    let decisionType: string;
    let feeAmountRow;
    let paymentTypeRow;
    let fee;
    const { paAppealTypeAipPaymentOption = null, paymentStatus = null } = req.session.appeal;
    if (['revocationOfProtection', 'deprivation'].includes(application.appealType)) {
      decisionType = req.session.appeal.application.rpDcAppealHearingOption;
    } else if (['protection', 'refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'].includes(application.appealType)) {
      decisionType = req.session.appeal.application.decisionHearingFeeOption;
      if (paAppealTypeAipPaymentOption === 'payLater' && paymentStatus !== 'Paid') {
        paymentTypeRow = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.paymentType, [i18n.pages.checkYourAnswers.payLater]);
      } else {
        fee = getFee(req.session.appeal);
        feeAmountRow = fee ? addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.feeAmount, [`£${fee.calculated_amount}`]) : null;
      }
    }
    const decisionTypeRow = addSummaryRow(i18n.pages.checkYourAnswers.decisionType, [i18n.pages.checkYourAnswers[decisionType]]);
    if (decisionType) rows.push(decisionTypeRow);
    if (paymentTypeRow) rows.push(paymentTypeRow);
    if (fee) rows.push(feeAmountRow);
  }
  return rows;
}

function setupAnswersReasonsForAppeal(req: Request, fromLegalRep: boolean): Array<any> {
  const array = [];
  const data = req.session.appeal.reasonsForAppeal;
  if (fromLegalRep) {
    array.push(addSummaryRow(i18n.pages.detailViewers.reasonsForAppealCheckAnswersHistory.uploadDateLabel, [data.uploadDate], null));
    if (data.evidences) {
      for (let index = 0; index < data.evidences.length; index++) {
        let label = i18n.pages.detailViewers.reasonsForAppealCheckAnswersHistory.documentLabel;
        const evidence = data.evidences[index];
        if (index > 0) {
          label = i18n.pages.detailViewers.reasonsForAppealCheckAnswersHistory.additionalDocumentLabel;
        }
        const evidenceText = `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`;
        array.push(addSummaryRow(label, [evidenceText], null));
        array.push(addSummaryRow(i18n.pages.detailViewers.reasonsForAppealCheckAnswersHistory.documentDescriptionLabel, [evidence.description], null));
      }
    }
  } else {
    array.push(addSummaryRow(i18n.pages.detailViewers.reasonsForAppealCheckAnswersHistory.whyYouThinkHomeOfficeIsWrong, [data.applicationReason], null));
    if (data.evidences !== null) {
      const evidenceText = data.evidences.map((evidence) => {
        return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`;
      });
      array.push(addSummaryRow(i18n.pages.reasonsForAppealUpload.titleNew, evidenceText, null, Delimiter.BREAK_LINE));
    }
  }

  return array;
}

function getMakeAnApplicationSummaryRows(makeAnApplicationEvent: Collection<Application<Evidence>>) {
  const request = [];
  const data = makeAnApplicationEvent.value;
  request.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.appellant.request.whatYouAskedFor, [getApplicationTitle(data.type)]));
  request.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.appellant.request.reason, [data.details]));
  if (data.evidence.length) {
    const evidenceText = data.evidence.map((evidence) => {
      return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`;
    });
    request.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.appellant.request.evidence, evidenceText, null, Delimiter.BREAK_LINE));
  }
  request.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.appellant.request.date, [moment(data.date).format(dayMonthYearFormat)]));

  if (data.decision !== 'Pending') {
    const response = [];
    response.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.appellant.response.decision, [i18n.pages.detailViewers.makeAnApplication.appellant.response[data.decision]]));
    response.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.appellant.response.reason, [data.decisionReason]));
    response.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.appellant.response.date, [moment(data.decisionDate).format(dayMonthYearFormat)]));
    response.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.appellant.response.maker, [data.decisionMaker]));
    return { request, response };
  }
  return { request };
}

function getRespondentApplicationSummaryRows(application: Collection<Application<Evidence>>) {
  const request = [];
  const data = application.value;
  const requestType = i18n.pages.detailViewers.makeAnApplication.respondent.request.types[application.value.type];
  request.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.respondent.request.type, [requestType]));
  request.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.respondent.request.reason, [data.details]));
  if (data.evidence.length) {
    const evidenceText = data.evidence.map((evidence) => {
      return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`;
    });
    request.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.respondent.request.evidence, evidenceText, null, Delimiter.BREAK_LINE));
  }
  request.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.respondent.request.date, [moment(data.date).format(dayMonthYearFormat)]));

  if (data.decision !== 'Pending') {
    const response = [];
    response.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.respondent.response.decision, [data.decision]));
    response.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.respondent.response.reason, [data.decisionReason]));
    response.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.respondent.response.date, [moment(data.decisionDate).format(dayMonthYearFormat)]));
    response.push(addSummaryRow(i18n.pages.detailViewers.makeAnApplication.respondent.response.maker, [data.decisionMaker]));
    return { request, response };
  }
  return { request };
}

function getApplicationTitle(type: any): string {
  const applicationType = getApplicationType(type);
  if (applicationType) {
    return i18n.pages.detailViewers.makeAnApplication.appellant.requestTypes[applicationType.code];
  }
}

function setupCmaRequirementsViewer(req: Request) {
  const interpreter = [];
  const stepFree = [];
  const hearingLoop = [];
  const multiEvidence = [];
  const sexAppointment = [];
  const privateAppointment = [];
  const physicalOrMental = [];
  const pastExperiences = [];
  const anythingElse = [];
  const dateToAvoid = [];
  const submitCmaRequirements = getAppealApplicationData('submitCmaRequirements', req);
  const { data } = submitCmaRequirements[0];
  const cmaRequirements: CmaRequirements = req.session.appeal.cmaRequirements;
  if (_.has(data, 'isInterpreterServicesNeeded')) {
    interpreter.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.interpreterTitle], null));
    interpreter.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.isInterpreterServicesNeeded], null));
    if (data.isInterpreterServicesNeeded === 'Yes') {
      const interpreterTitle = i18n.pages.detailViewers.cmaRequirements.language + ' ' + i18n.pages.detailViewers.cmaRequirements.dialect;
      interpreter.push(addSummaryRow(interpreterTitle, [
        `${data.interpreterLanguage[0].value.language}`,
        Delimiter.BREAK_LINE,
        `<pre>${data.interpreterLanguage[0].value.languageDialect || ''}</pre>`,
        Delimiter.BREAK_LINE
      ], null));
    }
  }
  if (_.has(data, 'isHearingRoomNeeded')) {
    stepFree.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.stepFreeAccessTitle], null));
    stepFree.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.isHearingRoomNeeded], null));
  }
  if (_.has(data, 'isHearingLoopNeeded')) {
    hearingLoop.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.hearingLoopTitle], null));
    hearingLoop.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.isHearingLoopNeeded], null));
  }
  // // Other NEEDS
  // // MULTIMEDIA
  if (_.has(data, 'multimediaEvidence')) {
    multiEvidence.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.MultimediaEvidenceTitle], null));
    multiEvidence.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.multimediaEvidence], null));
  }
  if (_.has(data, 'multimediaEvidence')) {
    multiEvidence.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.MultimediaEvidenceBringEquip], null));
    multiEvidence.push(addSummaryRow(i18n.common.cya.answerRowTitle, [boolToYesNo(cmaRequirements.otherNeeds.bringOwnMultimediaEquipment)], null));
    if ((data.multimediaEvidenceDescription && !_.isEmpty(data.multimediaEvidenceDescription))) {
      multiEvidence.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.MultimediaEvidenceCantBringEquip], null));
      multiEvidence.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.multimediaEvidenceDescription], null));
    }
  }
  // // SAME SEX
  if (_.has(data, 'singleSexCourt')) {
    sexAppointment.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.AllFOrMTitle], null));
    sexAppointment.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.singleSexCourt], null));
  }
  if (_.has(data, 'singleSexCourt')) {
    sexAppointment.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.AllFOrMQuestion], null));
    sexAppointment.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.singleSexCourtType], null));
    if (data.singleSexCourt === 'Yes') {
      sexAppointment.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.AllFOrMWhy], null));
      sexAppointment.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.singleSexCourtTypeDescription], null));
    }
  }
  // // PRIVATE APPOINTMENT NEEDED
  if (_.has(data, 'inCameraCourt')) {
    privateAppointment.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.privateAppointmentTitle], null));
    privateAppointment.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.inCameraCourt], null));
    if (data.inCameraCourt === 'Yes') {
      privateAppointment.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.privateAppointmentQuestion], null));
      privateAppointment.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.inCameraCourtDescription], null));
    }
  }
  // // PHYSICAL EVIDENCE
  if (_.has(data, 'physicalOrMentalHealthIssues')) {
    physicalOrMental.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.physicalTitle], null));
    physicalOrMental.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.physicalOrMentalHealthIssues], null));

    if (data.physicalOrMentalHealthIssues === 'Yes') {
      physicalOrMental.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.physicalQuestion], null));
      physicalOrMental.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.physicalOrMentalHealthIssuesDescription], null));
    }
  }
  // // PRIVATE pastExperiencesTitle
  if (_.has(data, 'pastExperiences')) {
    pastExperiences.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.pastExperiencesTitle], null));
    pastExperiences.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.pastExperiences], null));

    if (data.pastExperiences === 'Yes') {
      pastExperiences.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.pastExperienceQuestion], null));
      pastExperiences.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.pastExperiencesDescription], null));
    }
  }
  // // ANYTHING ELSE
  if (_.has(data, 'additionalRequests')) {
    anythingElse.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.anythingElseTitle], null));
    anythingElse.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.additionalRequests], null));

    if (data.additionalRequests === 'Yes') {
      anythingElse.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.anythingElseQuestion], null));
      anythingElse.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.additionalRequestsDescription], null));
    }
  }

  // // dates to avoid
  if (_.has(data, 'datesToAvoidYesNo')) {
    dateToAvoid.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.cmaRequirements.taskList.datesToAvoid.title], null));
    dateToAvoid.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.datesToAvoidYesNo], null));
    // Loop dates
    if (data.datesToAvoidYesNo === 'Yes') {
      data.datesToAvoid.map((date: any, i: number) => {
        dateToAvoid.push(
          addSummaryRow(
            i === 0 ? i18n.pages.cmaRequirements.taskList.sections.datesToAvoid : null,
            [
              `<b>${i18n.common.cya.date}</b>`,
              Delimiter.BREAK_LINE,
              `<pre>${date.value.dateToAvoid}</pre>`,
              Delimiter.BREAK_LINE,
              `<b>${i18n.common.cya.reason}</b>`,
              Delimiter.BREAK_LINE,
              `<pre>${date.value.dateToAvoidReason || ''}</pre>`
            ],
            null));
      });
    }
  }
  return {
    interpreter,
    stepFree,
    hearingLoop,
    multiEvidence,
    sexAppointment,
    privateAppointment,
    physicalOrMental,
    pastExperiences,
    anythingElse,
    dateToAvoid
  };
}

async function getAppealDetailsViewer(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getAppealDetails(req);
    return res.render('templates/details-viewer.njk', {
      title: i18n.pages.detailViewers.appealDetails.title,
      previousPage: paths.common.overview,
      data: data
    });
  } catch (error) {
    next(error);
  }
}

function getReasonsForAppealViewer(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    const data = setupAnswersReasonsForAppeal(req, false);
    return res.render('detail-viewers/reasons-for-appeal-details-viewer.njk', {
      previousPage: previousPage,
      data: data
    });
  } catch (error) {
    next(error);
  }
}

function getLrReasonsForAppealViewer(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    const data = setupAnswersReasonsForAppeal(req, true);
    return res.render('detail-viewers/reasons-for-appeal-details-viewer.njk', {
      hint: i18n.pages.detailViewers.reasonsForAppealCheckAnswersHistory.hint,
      previousPage: previousPage,
      data: data
    });
  } catch (error) {
    next(error);
  }
}

function getHoEvidenceDetailsViewer(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    let documents = [];

    if (_.has(req.session.appeal, 'respondentDocuments')) {
      const respondentDocs = req.session.appeal.respondentDocuments;

      documents = respondentDocs.map(document => {
        const urlHtml = toHtmlLink(document.fileId, document.name, paths.common.documentViewer);
        const formattedDate = moment(document.dateUploaded).format(dayMonthYearFormat);
        return {
          dateUploaded: formattedDate,
          url: urlHtml
        };
      });
    }

    return res.render('detail-viewers/view-ho-details.njk', {
      documents: documents,
      previousPage: previousPage
    });
  } catch (error) {
    next(error);
  }
}

function getDocumentViewer(documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const documentId = req.params.documentId;
      const documentLocationUrl: string = documentIdToDocStoreUrl(documentId, req.session.appeal.documentMap);
      if (documentLocationUrl) {
        const response = await documentManagementService.fetchFile(req, documentLocationUrl);
        if (response.statusCode === 200) {
          res.setHeader('content-type', response.headers['content-type']);
          return res.send(Buffer.from(response.body, 'binary'));
        }
      }
      return res.redirect(paths.common.fileNotFound);

    } catch (error) {
      next(error);
    }
  };
}

function getMakeAnApplicationViewer(req: Request, res: Response, next: NextFunction) {
  try {
    const applicationId = req.params.id;
    const application = req.session.appeal.makeAnApplications.find(application => application.id === applicationId);
    const previousPage: string = paths.common.overview;
    const hearingCentreEmail = getHearingCentreEmail(req);
    const applicant = getApplicant(application.value);
    let options = {
      previousPage: previousPage,
      hearingCentreEmail
    };
    if (applicant === 'Appellant') {
      options = {
        ...options,
        ...getAppellantApplicationDetails(application)
      };
    } else if (applicant === 'Respondent') {
      options = {
        ...options,
        ...getRespondentApplicationDetails(application)
      };
    }
    return res.render('detail-viewers/make-an-application-details-viewer.njk', options);
  } catch (error) {
    next(error);
  }
}

function getRespondentApplicationDetails(application: Collection<Application<Evidence>>) {
  const { request, response = null } = getRespondentApplicationSummaryRows(application);
  const applicationType = application.value.type;
  const decision = application.value.decision;
  const whatNextPending = i18n.pages.detailViewers.makeAnApplication.respondent.request.whatNext[applicationType];
  const whatNextDecided = getMakeAnApplicationDecisionWhatNext(application);
  const options = {
    title: i18n.pages.detailViewers.makeAnApplication.respondent.request.title,
    description: i18n.pages.detailViewers.makeAnApplication.respondent.request.description,
    whatNextTitle: i18n.pages.detailViewers.makeAnApplication.respondent.request.whatNext.title,
    request
  };

  return decision === 'Pending'
      ? {
        ...options,
        whatNextList: whatNextPending
      } : {
        ...options,
        response,
        whatNext: whatNextDecided,
        responseTitle: i18n.pages.detailViewers.makeAnApplication.respondent.response.title,
        responseDescription: i18n.pages.detailViewers.makeAnApplication.respondent.response.description
      };
}

function getAppellantApplicationDetails(application: Collection<Application<Evidence>>) {
  const { request, response = null } = getMakeAnApplicationSummaryRows(application);
  const whatNext = getMakeAnApplicationDecisionWhatNext(application);
  return {
    title: i18n.pages.detailViewers.makeAnApplication.appellant.title,
    whatNextTitle: i18n.pages.detailViewers.makeAnApplication.appellant.whatNext.title,
    request,
    response,
    whatNext
  };
}

function getMakeAnApplicationDecisionWhatNext(makeAnApplicationEvent: Collection<Application<Evidence>>) {
  const data = makeAnApplicationEvent.value;
  const applicationType = getApplicationType(data.type);
  if (applicationType && data.decision !== 'Pending') {
    const questionKey = applicationType.parent ? applicationType.parent : applicationType.code;
    const decisionKey = data.decision.toLowerCase();
    const whatNextSource = data.applicant === 'Respondent'
        ? i18n.pages.detailViewers.makeAnApplication.respondent.response.whatNext
        : i18n.pages.detailViewers.makeAnApplication.appellant.whatNext;
    return whatNextSource[questionKey][decisionKey] ? whatNextSource[questionKey][decisionKey] : whatNextSource.default[decisionKey];
  }
  return null;
}

function getCmaRequirementsViewer(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    const { interpreter, stepFree, hearingLoop, multiEvidence, sexAppointment, privateAppointment, physicalOrMental, pastExperiences, anythingElse, dateToAvoid } = setupCmaRequirementsViewer(req);
    return res.render('detail-viewers/cma-requirements-details-viewer.njk', {
      previousPage: previousPage,
      interpreter: interpreter,
      stepFree,
      hearingLoop,
      multiEvidence,
      sexAppointment,
      privateAppointment,
      physicalOrMental,
      pastExperiences,
      anythingElse,
      dateToAvoid
    });
  } catch (error) {
    next(error);
  }
}

function getNoticeEndedAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    const endedAppealDoc = req.session.appeal.tribunalDocuments.find(doc => ['endAppeal', 'endAppealAutomatically'].includes(doc.tag));
    const fileNameFormatted = fileNameFormatter(endedAppealDoc.name);
    const data = [
      addSummaryRow(i18n.pages.detailViewers.common.dateUploaded, [moment(endedAppealDoc.dateUploaded).format(dayMonthYearFormat)]),
      addSummaryRow(i18n.pages.detailViewers.common.document, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${endedAppealDoc.fileId}'>${fileNameFormatted}</a>`])
    ];
    return res.render('templates/details-viewer.njk', {
      title: i18n.pages.detailViewers.endedAppeal.title,
      data,
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function getHearingNoticeViewer(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    const hearingNoticeDocuments = req.session.appeal.hearingDocuments.filter(doc => doc.tag === 'hearingNotice');
    const data = [];
    hearingNoticeDocuments.forEach(document => {
      const fileNameFormatted = fileNameFormatter(document.name);
      data.push(addSummaryRow(i18n.pages.detailViewers.common.dateUploaded, [moment(document.dateUploaded).format(dayMonthYearFormat)]));
      data.push(addSummaryRow(i18n.pages.detailViewers.common.document, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${document.fileId}'>${fileNameFormatted}</a>`]));
    });

    return res.render('templates/details-viewer.njk', {
      title: i18n.pages.detailViewers.hearingNotice.title,
      data,
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function getDecisionAndReasonsViewer(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    const coverLetterDocument = req.session.appeal.finalDecisionAndReasonsDocuments.find(doc => doc.tag === 'decisionAndReasonsCoverLetter');
    const finalDecisionAndReasonsPdfDoc = req.session.appeal.finalDecisionAndReasonsDocuments.find(doc => doc.tag === 'finalDecisionAndReasonsPdf');

    const data = [];
    let fileNameFormatted = fileNameFormatter(coverLetterDocument.name);
    data.push(addSummaryRow(i18n.pages.detailViewers.common.dateUploaded, [moment(coverLetterDocument.dateUploaded).format(dayMonthYearFormat)]));
    data.push(addSummaryRow(i18n.pages.detailViewers.common.document, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${coverLetterDocument.fileId}'>${fileNameFormatted}</a>`]));

    fileNameFormatted = fileNameFormatter(finalDecisionAndReasonsPdfDoc.name);
    data.push(addSummaryRow(i18n.pages.detailViewers.common.dateUploaded, [moment(finalDecisionAndReasonsPdfDoc.dateUploaded).format(dayMonthYearFormat)]));
    data.push(addSummaryRow(i18n.pages.detailViewers.common.document, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${finalDecisionAndReasonsPdfDoc.fileId}'>${fileNameFormatted}</a>`]));

    return res.render('templates/details-viewer.njk', {
      title: i18n.pages.detailViewers.decisionsAndReasons.title,
      description: i18n.pages.detailViewers.decisionsAndReasons.description,
      data,
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function getOutOfTimeDecisionViewer(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    const recordOutOfTimeDecisionDoc = req.session.appeal.tribunalDocuments.find(doc => doc.tag === 'recordOutOfTimeDecisionDocument');
    const fileNameFormatted = fileNameFormatter(recordOutOfTimeDecisionDoc.name);
    const data = [
      addSummaryRow(i18n.pages.detailViewers.outOfTimeDecision.decision, [i18n.pages.detailViewers.outOfTimeDecision.type[req.session.appeal.outOfTimeDecisionType]]),
      addSummaryRow(i18n.pages.detailViewers.outOfTimeDecision.decisionMaker, [req.session.appeal.outOfTimeDecisionMaker]),
      addSummaryRow(i18n.pages.detailViewers.outOfTimeDecision.reasonForDecision, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${recordOutOfTimeDecisionDoc.fileId}'>${fileNameFormatted}</a>`])
    ];
    return res.render('templates/details-viewer.njk', {
      title: i18n.pages.detailViewers.outOfTimeDecision.title,
      data,
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function getHomeOfficeWithdrawLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const previousPage: string = paths.common.overview;
    const homeOfficeResponseDocuments = req.session.appeal.respondentDocuments.filter(doc => doc.tag === 'appealResponse');

    const homeOfficeLetter = homeOfficeResponseDocuments.shift();
    const data = [
      addSummaryRow(i18n.pages.detailViewers.homeOfficeWithdrawLetter.dateUploaded, [moment(homeOfficeLetter.dateUploaded).format(dayMonthYearFormat)]),
      addSummaryRow(i18n.pages.detailViewers.homeOfficeWithdrawLetter.document, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${homeOfficeLetter.fileId}'>${fileNameFormatter(homeOfficeLetter.name)}</a>`]),
      addSummaryRow(i18n.pages.detailViewers.homeOfficeWithdrawLetter.documentDescription, [homeOfficeLetter.description])
    ];
    homeOfficeResponseDocuments.forEach(document => {
      data.push(addSummaryRow(i18n.pages.detailViewers.homeOfficeWithdrawLetter.additionalEvidence, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${document.fileId}'>${fileNameFormatter(document.name)}</a>`]));
    });
    return res.render('templates/details-viewer.njk', {
      title: i18n.pages.detailViewers.homeOfficeWithdrawLetter.title,
      data,
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function getHomeOfficeResponse(req: Request, res: Response, next: NextFunction) {
  try {
    const previousPage: string = paths.common.overview;
    const homeOfficeResponseDocuments = req.session.appeal.respondentDocuments.filter(doc => doc.tag === 'appealResponse');

    const homeOfficeLetter = homeOfficeResponseDocuments.shift();
    const data = [
      addSummaryRow(i18n.pages.detailViewers.homeOfficeResponse.dateUploaded, [moment(homeOfficeLetter.dateUploaded).format(dayMonthYearFormat)]),
      addSummaryRow(i18n.pages.detailViewers.homeOfficeResponse.document, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${homeOfficeLetter.fileId}'>${fileNameFormatter(homeOfficeLetter.name)}</a>`]),
      addSummaryRow(i18n.pages.detailViewers.homeOfficeResponse.documentDescription, [homeOfficeLetter.description])
    ];
    homeOfficeResponseDocuments.forEach(document => {
      data.push(addSummaryRow(i18n.pages.detailViewers.homeOfficeResponse.additionalEvidence, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${document.fileId}'>${fileNameFormatter(document.name)}</a>`]));
    });
    return res.render('templates/details-viewer.njk', {
      title: i18n.pages.detailViewers.homeOfficeResponse.title,
      data,
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function getHearingBundle(req: Request, res: Response, next: NextFunction) {
  try {
    const previousPage: string = paths.common.overview;
    const hearingBundleDocuments = req.session.appeal.hearingDocuments.filter(doc => doc.tag === 'hearingBundle');

    const hearingBundle = hearingBundleDocuments.shift();
    const data = [
      addSummaryRow(i18n.pages.detailViewers.hearingBundle.dateUploaded, [moment(hearingBundle.dateUploaded).format(dayMonthYearFormat)]),
      addSummaryRow(i18n.pages.detailViewers.hearingBundle.document, [`<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${hearingBundle.fileId}'>${fileNameFormatter(hearingBundle.name)}</a>`])
    ];

    return res.render('templates/details-viewer.njk', {
      title: i18n.pages.detailViewers.hearingBundle.title,
      data,
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function getFtpaAppellantApplication(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    const ftpaGrounds = req.session.appeal.ftpaAppellantGrounds;
    const ftpaEvidenceDocuments = req.session.appeal.ftpaAppellantEvidenceDocuments;
    const ftpaOutOfTimeApplicationReason = req.session.appeal.ftpaAppellantOutOfTimeExplanation;
    const ftpaOutOfTimeApplicationDocuments = req.session.appeal.ftpaAppellantOutOfTimeDocuments;
    const ftpaAppellantApplicationDate = req.session.appeal.ftpaAppellantApplicationDate;

    const data = [];

    if (ftpaGrounds && ftpaGrounds.length) {
      data.push(addSummaryRow(i18n.pages.detailViewers.ftpaApplication.grounds, [ formatTextForCYA(ftpaGrounds) ]));
    }
    attachFtpaDocuments(ftpaEvidenceDocuments, data, i18n.pages.detailViewers.ftpaApplication.evidence);
    if (ftpaAppellantApplicationDate) {
      data.push(addSummaryRow(i18n.pages.detailViewers.ftpaApplication.date, [ formatTextForCYA(moment(ftpaAppellantApplicationDate).format(dayMonthYearFormat)) ]));
    }
    if (ftpaOutOfTimeApplicationReason && ftpaOutOfTimeApplicationReason.length) {
      data.push(addSummaryRow(i18n.pages.detailViewers.ftpaApplication.outOfTimeReason, [ formatTextForCYA(ftpaOutOfTimeApplicationReason) ]));
    }
    attachFtpaDocuments(ftpaOutOfTimeApplicationDocuments, data, i18n.pages.detailViewers.ftpaApplication.outOfTimeEvidence);

    return res.render('templates/details-viewer.njk', {
      title: i18n.pages.detailViewers.ftpaApplication.title.appellant,
      data,
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function getFtpaDecisionDetails(req: Request, res: Response, next: NextFunction) {
  const applicantType = getFtpaApplicantType(req.session.appeal);
  if (APPLICANT_TYPE.APPELLANT === applicantType) {
    return getFtpaAppellantDecisionDetails(req, res, next);
  } else if (APPLICANT_TYPE.RESPONDENT === applicantType) {
    return getFtpaRespondentDecisionDetails(req, res, next);
  }
}

function getFtpaRespondentDecisionDetails(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    const ftpaGroundsDocuments = req.session.appeal.ftpaRespondentGroundsDocuments;
    const ftpaEvidenceDocuments = req.session.appeal.ftpaRespondentEvidenceDocuments;
    const ftpaOutOfTimeApplicationReason = req.session.appeal.ftpaRespondentOutOfTimeExplanation;
    const ftpaOutOfTimeApplicationDocuments = req.session.appeal.ftpaRespondentOutOfTimeDocuments;
    const ftpaApplicationDate = req.session.appeal.ftpaRespondentApplicationDate;
    const ftpaDecision = req.session.appeal.ftpaRespondentDecisionOutcomeType || req.session.appeal.ftpaRespondentRjDecisionOutcomeType;
    const ftpaDecisionAndReasonsDocument = req.session.appeal.ftpaRespondentDecisionDocument;
    const ftpaDecisionDate = req.session.appeal.ftpaRespondentDecisionDate;

    const data = {
      application: [],
      decision: []
    };

    const isGrantedOrPartiallyGranted = [FTPA_DECISION_OUTCOME_TYPE.GRANTED, FTPA_DECISION_OUTCOME_TYPE.PARTIALLY_GRANTED].includes(ftpaDecision);
    if (isGrantedOrPartiallyGranted) {
      attachFtpaDocuments(ftpaGroundsDocuments, data.application, i18n.pages.detailViewers.ftpaApplication.groundsDocument);
      attachFtpaDocuments(ftpaEvidenceDocuments, data.application, i18n.pages.detailViewers.ftpaApplication.evidence);
    }
    if (ftpaApplicationDate) {
      data.application.push(addSummaryRow(i18n.pages.detailViewers.ftpaApplication.date, [ formatTextForCYA(moment(ftpaApplicationDate).format(dayMonthYearFormat)) ]));
    }
    if (ftpaOutOfTimeApplicationReason && ftpaOutOfTimeApplicationReason.length && isGrantedOrPartiallyGranted) {
      data.application.push(addSummaryRow(i18n.pages.detailViewers.ftpaApplication.outOfTimeReason, [ formatTextForCYA(ftpaOutOfTimeApplicationReason) ]));
    }
    if (isGrantedOrPartiallyGranted) {
      attachFtpaDocuments(ftpaOutOfTimeApplicationDocuments, data.application, i18n.pages.detailViewers.ftpaApplication.outOfTimeEvidence);
    }
    if (ftpaDecision && ftpaDecision.length) {
      data.decision.push(addSummaryRow(i18n.pages.detailViewers.ftpaDecision.decision, [ formatTextForCYA(i18n.pages.detailViewers.ftpaDecision.decisionOutcomeType[ftpaDecision]) ]));
    }
    attachFtpaDocuments(ftpaDecisionAndReasonsDocument, data.decision, i18n.pages.detailViewers.ftpaDecision.decisionDocument);
    if (ftpaDecisionDate) {
      data.decision.push(addSummaryRow(i18n.pages.detailViewers.ftpaDecision.date, [ formatTextForCYA(moment(ftpaDecisionDate).format(dayMonthYearFormat)) ]));
    }

    return res.render('ftpa-application/ftpa-decision-details-viewer.njk', {
      title: i18n.pages.detailViewers.ftpaApplication.title.respondent,
      subTitle: i18n.pages.detailViewers.ftpaDecision.title,
      data,
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function getFtpaAppellantDecisionDetails(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    const ftpaGrounds = req.session.appeal.ftpaAppellantGrounds;
    const ftpaEvidenceDocuments = req.session.appeal.ftpaAppellantEvidenceDocuments;
    const ftpaOutOfTimeApplicationReason = req.session.appeal.ftpaAppellantOutOfTimeExplanation;
    const ftpaOutOfTimeApplicationDocuments = req.session.appeal.ftpaAppellantOutOfTimeDocuments;
    const ftpaApplicationDate = req.session.appeal.ftpaAppellantApplicationDate;
    const ftpaDecision = req.session.appeal.ftpaAppellantDecisionOutcomeType || req.session.appeal.ftpaAppellantRjDecisionOutcomeType;
    const ftpaDecisionAndReasonsDocument = req.session.appeal.ftpaAppellantDecisionDocument;
    const ftpaDecisionDate = req.session.appeal.ftpaAppellantDecisionDate;

    const data = {
      application: [],
      decision: []
    };

    if (ftpaGrounds) {
      data.application.push(addSummaryRow(i18n.pages.detailViewers.ftpaApplication.grounds, [ formatTextForCYA(ftpaGrounds) ]));
    }
    attachFtpaDocuments(ftpaEvidenceDocuments, data.application, i18n.pages.detailViewers.ftpaApplication.evidence);
    if (ftpaApplicationDate) {
      data.application.push(addSummaryRow(i18n.pages.detailViewers.ftpaApplication.date, [ formatTextForCYA(moment(ftpaApplicationDate).format(dayMonthYearFormat)) ]));
    }
    if (ftpaOutOfTimeApplicationReason && ftpaOutOfTimeApplicationReason.length) {
      data.application.push(addSummaryRow(i18n.pages.detailViewers.ftpaApplication.outOfTimeReason, [ formatTextForCYA(ftpaOutOfTimeApplicationReason) ]));
    }
    attachFtpaDocuments(ftpaOutOfTimeApplicationDocuments, data.application, i18n.pages.detailViewers.ftpaApplication.outOfTimeEvidence);
    if (ftpaDecision && ftpaDecision.length) {
      data.decision.push(addSummaryRow(i18n.pages.detailViewers.ftpaDecision.decision, [ formatTextForCYA(i18n.pages.detailViewers.ftpaDecision.decisionOutcomeType[ftpaDecision]) ]));
    }
    attachFtpaDocuments(ftpaDecisionAndReasonsDocument, data.decision, i18n.pages.detailViewers.ftpaDecision.decisionDocument);
    if (ftpaDecisionDate) {
      data.decision.push(addSummaryRow(i18n.pages.detailViewers.ftpaDecision.date, [ formatTextForCYA(moment(ftpaDecisionDate).format(dayMonthYearFormat)) ]));
    }

    return res.render('ftpa-application/ftpa-decision-details-viewer.njk', {
      title: i18n.pages.detailViewers.ftpaApplication.title.appellant,
      subTitle: i18n.pages.detailViewers.ftpaDecision.title,
      data,
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function attachFtpaDocuments(documents: Evidence[], documentCollection, docLabel: string) {
  if (documents && documents.length) {
    const evidenceText = documents.map((evidence) => {
      return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`;
    });
    documentCollection.push(addSummaryRow(docLabel, evidenceText, null, Delimiter.BREAK_LINE));
  }
}

function getDirectionHistory(req: Request, res: Response, next: NextFunction) {
  if (req.session.appeal.directions && req.params.id) {
    let direction: Direction = req.session.appeal.directions.find(direction => (req.params.id === direction.uniqueId));
    if (direction && APPLICANT_TYPE.APPELLANT === direction.parties) {
      return getAppellantDirectionHistoryDetails(req, res, next, direction);
    } else if (direction && APPLICANT_TYPE.RESPONDENT === direction.parties) {
      return getRespondentDirectionHistoryDetails(req, res, next, direction);
    }
  }
}

function getAppellantDirectionHistoryDetails(req: Request, res: Response, next: NextFunction, direction: Direction) {
  try {
    let previousPage: string = paths.common.overview;
    const data = [];
    data.push(addSummaryRow(i18n.pages.detailViewers.directionHistory.appellant.explanation, [formatTextForCYA(direction.explanation)]));
    data.push(addSummaryRow(i18n.pages.detailViewers.directionHistory.appellant.dateDue, [formatTextForCYA(moment(direction.dateDue).format(dayMonthYearFormat))]));
    data.push(addSummaryRow(i18n.pages.detailViewers.directionHistory.dateSent, [formatTextForCYA(moment(direction.dateSent).format(dayMonthYearFormat))]));

    return res.render('detail-viewers/direction-history-viewer.njk', {
      title: i18n.pages.detailViewers.directionHistory.title,
      data,
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function getRespondentDirectionHistoryDetails(req: Request, res: Response, next: NextFunction, direction: Direction) {
  try {
    let previousPage: string = paths.common.overview;
    const data = [];
    data.push(addSummaryRow(i18n.pages.detailViewers.directionHistory.respondent.explanation, [formatTextForCYA(direction.explanation)]));
    data.push(addSummaryRow(i18n.pages.detailViewers.directionHistory.respondent.dateDue, [formatTextForCYA(moment(direction.dateDue).format(dayMonthYearFormat))]));
    data.push(addSummaryRow(i18n.pages.detailViewers.directionHistory.dateSent, [formatTextForCYA(moment(direction.dateSent).format(dayMonthYearFormat))]));

    return res.render('detail-viewers/direction-history-viewer.njk', {
      title: i18n.pages.detailViewers.directionHistory.title,
      data,
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function setupDetailViewersController(documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.common.documentViewer + '/:documentId', getDocumentViewer(documentManagementService));
  router.get(paths.common.homeOfficeDocumentsViewer, getHoEvidenceDetailsViewer);
  router.get(paths.common.appealDetailsViewer, getAppealDetailsViewer);
  router.get(paths.common.reasonsForAppealViewer, getReasonsForAppealViewer);
  router.get(paths.common.makeAnApplicationViewer + '/:id', getMakeAnApplicationViewer);
  router.get(paths.common.cmaRequirementsAnswerViewer, getCmaRequirementsViewer);
  router.get(paths.common.noticeEndedAppealViewer, getNoticeEndedAppeal);
  router.get(paths.common.outOfTimeDecisionViewer, getOutOfTimeDecisionViewer);
  router.get(paths.common.homeOfficeWithdrawLetter, getHomeOfficeWithdrawLetter);
  router.get(paths.common.homeOfficeResponse, getHomeOfficeResponse);
  router.get(paths.common.hearingNoticeViewer, getHearingNoticeViewer);
  router.get(paths.common.hearingBundleViewer, getHearingBundle);
  router.get(paths.common.decisionAndReasonsViewer, getDecisionAndReasonsViewer);
  router.get(paths.common.lrReasonsForAppealViewer, getLrReasonsForAppealViewer);
  router.get(paths.common.ftpaAppellantApplicationViewer, getFtpaAppellantApplication);
  router.get(paths.common.ftpaDecisionViewer, getFtpaDecisionDetails);
  router.get(paths.common.directionHistoryViewer, getDirectionHistory);
  return router;
}

export {
  getAppealDetailsViewer,
  getApplicationTitle,
  getReasonsForAppealViewer,
  getDocumentViewer,
  getHoEvidenceDetailsViewer,
  getHomeOfficeWithdrawLetter,
  getNoticeEndedAppeal,
  getMakeAnApplicationSummaryRows,
  getMakeAnApplicationViewer,
  getMakeAnApplicationDecisionWhatNext,
  setupDetailViewersController,
  setupCmaRequirementsViewer,
  getCmaRequirementsViewer,
  getOutOfTimeDecisionViewer,
  getHomeOfficeResponse,
  getHearingNoticeViewer,
  getHearingBundle,
  getDecisionAndReasonsViewer,
  getLrReasonsForAppealViewer,
  getFtpaAppellantApplication,
  getFtpaDecisionDetails,
  getDirectionHistory,
  getRespondentApplicationSummaryRows
};
