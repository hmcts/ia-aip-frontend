import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import moment from 'moment';
import * as path from 'path';
import i18n from '../../locale/en.json';
import { countryList } from '../data/country-list';
import { serverErrorHandler } from '../handlers/error-handler';
import { paths } from '../paths';
import {
  addToDocumentMapper,
  docStoreUrlToId,
  documentIdToDocStoreUrl,
  DocumentManagementService
} from '../service/document-management-service';
import { dayMonthYearFormat } from '../utils/date-formats';
import { addSummaryRow, Delimiter } from '../utils/summary-list';
import { timeExtensionIdToTimeExtensionData } from '../utils/timeline-utils';

/**
 * Takes in a fileName and converts it to the correct display format
 * @param fileName the file name e.g Some_file.pdf
 * @return the formatted name as a string e.g Some_File(PDF)
 */
function fileNameFormatter(fileName: string): string {
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  const extName = extension.split('.').join('').toUpperCase();
  return `${baseName}(${extName})`;
}

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
    const fileId = docStoreUrlToId(evidence.document_url, req.session.appeal.documentMap);
    const formattedFileName = fileNameFormatter(evidence.document_filename);
    const urlHtml = `<p class="govuk-!-font-weight-bold">${i18n.pages.checkYourAnswers.rowTitles.supportingEvidence}</p><a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.detailsViewers.document}/${fileId}'>${formattedFileName}</a>`;
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
      const fileId = docStoreUrlToId(evidence.value.document_url, req.session.appeal.documentMap);
      const formattedFileName = fileNameFormatter(evidence.value.document_filename);
      return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.detailsViewers.document}/${fileId}'>${formattedFileName}</a>`;
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
      const fileId = addToDocumentMapper(evidence.value.document_url, req.session.appeal.documentMap);
      const formattedFileName = fileNameFormatter(evidence.value.document_filename);
      return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.detailsViewers.document}/${fileId}'>${formattedFileName}</a>`;
    });
    array.push(addSummaryRow(i18n.pages.detailViewers.timeExtensionRequest.supportingEvidence, [ ...Object.values(listOfDocuments) ], null, Delimiter.BREAK_LINE));
  }
  return array;
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
        const formattedFileName = fileNameFormatter(document.evidence.name);
        const urlHtml = `<a class='govuk-link' target='_blank' rel="noopener noreferrer" href='${paths.common.detailsViewers.document}/${document.evidence.fileId}'>${formattedFileName}</a>`;
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
        if (response) {
          res.setHeader('content-type', response.headers['content-type']);
          return res.send(Buffer.from(response.body, 'binary'));
        }
      }
      return serverErrorHandler;

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

function setupDetailViewersController(middleware: Middleware[], documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.common.detailsViewers.document + '/:documentId', middleware, getDocumentViewer(documentManagementService));
  router.get(paths.common.detailsViewers.homeOfficeDocuments, middleware, getHoEvidenceDetailsViewer);
  router.get(paths.common.detailsViewers.appealDetails, middleware, getAppealDetailsViewer);
  router.get(paths.common.detailsViewers.reasonsForAppeal, middleware, getReasonsForAppealViewer);
  router.get(paths.common.detailsViewers.timeExtension + '/:id', middleware, getTimeExtensionViewer);
  router.get(paths.common.detailsViewers.timeExtensionDecision + '/:id', middleware, getTimeExtensionDecisionViewer);

  return router;
}

export {
  getAppealDetailsViewer,
  getReasonsForAppealViewer,
  getDocumentViewer,
  getHoEvidenceDetailsViewer,
  getTimeExtensionViewer,
  getTimeExtensionDecisionViewer,
  setupDetailViewersController
};
