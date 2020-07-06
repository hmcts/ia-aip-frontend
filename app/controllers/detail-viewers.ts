import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import moment from 'moment';
import i18n from '../../locale/en.json';
import { countryList } from '../data/country-list';
import { serverErrorHandler } from '../handlers/error-handler';
import { paths } from '../paths';
import {
  docStoreUrlToHtmlLink,
  documentIdToDocStoreUrl,
  DocumentManagementService,
  documentToHtmlLink,
  toHtmlLink
} from '../service/document-management-service';
import { dayMonthYearFormat } from '../utils/date-utils';
import { addSummaryRow, Delimiter } from '../utils/summary-list';
import { timeExtensionIdToTimeExtensionData } from '../utils/timeline-utils';
import { boolToYesNo } from '../utils/utils';

const getAppealApplicationData = (eventId: string, req: Request) => {
  const history: HistoryEvent[] = req.session.appeal.history;
  return history.filter(h => h.id === eventId);
};

const formatDateLongDate = (date: string) => {
  return moment(date).format(dayMonthYearFormat);
};

function setupAppealDetails(req: Request): Array<any> {
  const array = [];
  const appealData = getAppealApplicationData('submitAppeal', req);
  const { data } = appealData[0];
  const appealTypeNames: string[] = data.appealType.split(',').map(appealType => {
    return i18n.appealTypes[appealType].name;
  });
  if (_.has(data, 'homeOfficeReferenceNumber')) {
    array.push(addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.homeOfficeRefNumber, [ data.homeOfficeReferenceNumber ], null));
  }
  if (_.has(data, 'homeOfficeDecisionDate')) {
    array.push(addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.dateLetterSent, [ formatDateLongDate(data.homeOfficeDecisionDate) ], null));
  }
  if (_.has(data, 'appellantNameForDisplay')) {
    array.push(addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.name, [ data.appellantNameForDisplay ], null));
  }
  if (_.has(data, 'appellantDateOfBirth')) {
    array.push(addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.dob, [ formatDateLongDate(data.appellantDateOfBirth) ], null));
  }
  if (_.has(data, 'appellantNationalities[0].value.code')) {
    const nation = countryList.find(country => country.value === appealData[0].data.appellantNationalities[0].value.code).name;
    array.push(addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nationality, [ nation ], null));
  }
  if (_.has(data, 'appellantAddress')) {
    array.push(addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.addressDetails, [ ...Object.values(data.appellantAddress) ], null, Delimiter.BREAK_LINE));
  }
  if (_.has(data, 'subscriptions[0].value')) {
    array.push(addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.contactDetails, [ data.subscriptions[0].value.email, data.subscriptions[0].value.mobileNumber ], null, Delimiter.BREAK_LINE));
  }
  if (_.has(data, 'appealType')) {
    array.push(addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealType, [ appealTypeNames ], null));
  }
  if (_.has(data, 'applicationOutOfTimeExplanation')) {
    array.push(addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealLate, [ data.applicationOutOfTimeExplanation ], null));
  }
  if (_.has(data, 'applicationOutOfTimeDocument')) {
    const evidence = data.applicationOutOfTimeDocument;
    const htmlLink = docStoreUrlToHtmlLink(paths.common.detailsViewers.document, evidence.document_filename, evidence.document_url, req);
    const urlHtml = `<p class="govuk-!-font-weight-bold">${i18n.pages.checkYourAnswers.rowTitles.supportingEvidence}</p>${htmlLink}`;
    array.push(addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.supportingEvidence, [ urlHtml ], null));
  }
  return array;
}

function setupAnswersReasonsForAppeal(req: Request): Array<any> {
  const array = [];
  const reasonsForAppeal = getAppealApplicationData('submitReasonsForAppeal', req);
  const { data } = reasonsForAppeal[0];
  if (_.has(data, 'reasonsForAppealDocuments')) {
    const listOfDocuments: string[] = data.reasonsForAppealDocuments.map(evidence => {
      return docStoreUrlToHtmlLink(paths.common.detailsViewers.document, evidence.value.document_filename, evidence.value.document_url, req);
    });
    array.push(addSummaryRow(i18n.pages.detailViewers.reasonsForAppealCheckAnswersHistory.whyYouThinkHomeOfficeIsWrong, [ data.reasonsForAppealDecision ], null));
    array.push(addSummaryRow(i18n.pages.reasonsForAppealUpload.title, [ ...Object.values(listOfDocuments) ], null, Delimiter.BREAK_LINE));
  }
  return array;
}

function setupTimeExtensionDecision(req: Request, timeExtensionEvent: TimeExtensionCollection) {
  const array = [];
  const data = timeExtensionEvent.value;
  if (_.has(data, 'decision')) {
    array.push(addSummaryRow(i18n.pages.detailViewers.timeExtensionReview.decision, [ data.decision ], null));
  }
  if (_.has(data, 'decisionReason')) {
    array.push(addSummaryRow(i18n.pages.detailViewers.timeExtensionReview.reason, [ data.decisionReason ], null));
  }
  return array;
}

function setupTimeExtension(req: Request, timeExtensionEvent: TimeExtensionCollection) {
  const array = [];
  const data = timeExtensionEvent.value;
  if (_.has(data, 'reason')) {
    array.push(addSummaryRow(i18n.pages.detailViewers.timeExtensionRequest.question, [ data.reason ], null));
  }
  if (_.has(data, 'evidence')) {
    const listOfDocuments: string[] = data.evidence.map(evidence => {
      return documentToHtmlLink(paths.common.detailsViewers.document, evidence, req);
    });
    array.push(addSummaryRow(i18n.pages.detailViewers.timeExtensionRequest.supportingEvidence, [ ...Object.values(listOfDocuments) ], null, Delimiter.BREAK_LINE));
  }
  return array;
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
  if (_.has(data,'isInterpreterServicesNeeded')) {
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
  if (_.has(data,'isHearingRoomNeeded')) {
    stepFree.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.stepFreeAccessTitle], null));
    stepFree.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.isHearingRoomNeeded], null));
  }
  if (_.has(data,'isHearingLoopNeeded')) {
    hearingLoop.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.hearingLoopTitle], null));
    hearingLoop.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.isHearingLoopNeeded], null));
  }
  // // Other NEEDS
  // // MULTIMEDIA
  if (_.has(data,'multimediaEvidence')) {
    multiEvidence.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.MultimediaEvidenceTitle], null));
    multiEvidence.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.multimediaEvidence], null));
  }
  if (_.has(data,'multimediaEvidence')) {
    multiEvidence.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.MultimediaEvidenceBringEquip ], null));
    multiEvidence.push(addSummaryRow(i18n.common.cya.answerRowTitle, [boolToYesNo(cmaRequirements.otherNeeds.bringOwnMultimediaEquipment)], null));
    if ((data.multimediaEvidenceDescription && !_.isEmpty(data.multimediaEvidenceDescription))) {
      multiEvidence.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.MultimediaEvidenceCantBringEquip], null));
      multiEvidence.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.multimediaEvidenceDescription], null));
    }
  }
  // // SAME SEX
  if (_.has(data,'singleSexCourt')) {
    sexAppointment.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.AllFOrMTitle], null));
    sexAppointment.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.singleSexCourt], null));
  }
  if (_.has(data,'singleSexCourt')) {
    sexAppointment.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.AllFOrMQuestion], null));
    sexAppointment.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.singleSexCourtType], null));
    if (data.singleSexCourt === 'Yes') {
      sexAppointment.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.AllFOrMWhy], null));
      sexAppointment.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.singleSexCourtTypeDescription], null));
    }
  }
  // // PRIVATE APPOINTMENT NEEDED
  if (_.has(data,'inCameraCourt')) {
    privateAppointment.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.privateAppointmentTitle], null));
    privateAppointment.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.inCameraCourt], null));
    if (data.inCameraCourt === 'Yes') {
      privateAppointment.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.privateAppointmentQuestion], null));
      privateAppointment.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.inCameraCourtDescription], null));
    }
  }
  // // PHYSICAL EVIDENCE
  if (_.has(data,'physicalOrMentalHealthIssues')) {
    physicalOrMental.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.physicalTitle], null));
    physicalOrMental.push(addSummaryRow(i18n.common.cya.answerRowTitle,[data.physicalOrMentalHealthIssues], null));

    if (data.physicalOrMentalHealthIssues === 'Yes') {
      physicalOrMental.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.physicalQuestion], null));
      physicalOrMental.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.physicalOrMentalHealthIssuesDescription], null));
    }
  }
  // // PRIVATE pastExperiencesTitle
  if (_.has(data,'pastExperiences')) {
    pastExperiences.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.pastExperiencesTitle], null));
    pastExperiences.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.pastExperiences], null));

    if (data.pastExperiences === 'Yes') {
      pastExperiences.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.pastExperienceQuestion], null));
      pastExperiences.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.pastExperiencesDescription], null));
    }
  }
  // // ANYTHING ELSE
  if (_.has(data,'additionalRequests')) {
    anythingElse.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.anythingElseTitle], null));
    anythingElse.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.additionalRequests], null));

    if (data.additionalRequests === 'Yes') {
      anythingElse.push(addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.detailViewers.cmaRequirements.anythingElseQuestion], null));
      anythingElse.push(addSummaryRow(i18n.common.cya.answerRowTitle, [data.additionalRequestsDescription], null));
    }
  }

  // // dates to avoid
  if (_.has(data,'datesToAvoidYesNo')) {
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

function getAppealDetailsViewer(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    const data = setupAppealDetails(req);
    return res.render('detail-viewers/appeal-details-viewer.njk', {
      previousPage: previousPage,
      data: data
    });
  } catch (error) {
    next(error);
  }
}

function getReasonsForAppealViewer(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.common.overview;
    const data = setupAnswersReasonsForAppeal(req);
    return res.render('detail-viewers/reasons-for-appeal-details-viewer.njk', {
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

        const urlHtml = toHtmlLink(document.evidence.fileId, document.evidence.name, paths.common.detailsViewers.document);
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

function getTimeExtensionViewer(req: Request, res: Response, next: NextFunction) {
  try {
    const timeExtensionId = req.params.id;
    const timeExtensionData: TimeExtensionCollection = timeExtensionIdToTimeExtensionData(timeExtensionId, req.session.appeal.timeExtensionEventsMap);
    if (timeExtensionData) {
      let previousPage: string = paths.common.overview;
      const data = setupTimeExtension(req, timeExtensionData);
      return res.render('detail-viewers/time-extension-details-viewer.njk', {
        previousPage: previousPage,
        data: data
      });
    }
    // SHOULD THROW NOT FOUND
    return serverErrorHandler;
  } catch (error) {
    next(error);
  }
}

function getTimeExtensionDecisionViewer(req: Request, res: Response, next: NextFunction) {
  try {
    const timeExtensionId = req.params.id;
    const timeExtensionData: TimeExtensionCollection = timeExtensionIdToTimeExtensionData(timeExtensionId, req.session.appeal.timeExtensionEventsMap);
    if (timeExtensionData) {
      let previousPage: string = paths.common.overview;
      const data = setupTimeExtensionDecision(req, timeExtensionData);
      return res.render('detail-viewers/time-extension-decision-details-viewer.njk', {
        previousPage: previousPage,
        data: data
      });
    }
    // SHOULD THROW NOT FOUND
    return serverErrorHandler;
  } catch (error) {
    next(error);
  }
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

function setupDetailViewersController(documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.common.detailsViewers.document + '/:documentId', getDocumentViewer(documentManagementService));
  router.get(paths.common.detailsViewers.homeOfficeDocuments, getHoEvidenceDetailsViewer);
  router.get(paths.common.detailsViewers.appealDetails, getAppealDetailsViewer);
  router.get(paths.common.detailsViewers.reasonsForAppeal, getReasonsForAppealViewer);
  router.get(paths.common.detailsViewers.timeExtension + '/:id', getTimeExtensionViewer);
  router.get(paths.common.detailsViewers.timeExtensionDecision + '/:id', getTimeExtensionDecisionViewer);
  router.get(paths.common.detailsViewers.cmaRequirementsAnswer, getCmaRequirementsViewer);

  return router;
}

export {
  getAppealDetailsViewer,
  getReasonsForAppealViewer,
  getDocumentViewer,
  getHoEvidenceDetailsViewer,
  getTimeExtensionViewer,
  getTimeExtensionDecisionViewer,
  setupDetailViewersController,
  setupCmaRequirementsViewer,
  getCmaRequirementsViewer
};
