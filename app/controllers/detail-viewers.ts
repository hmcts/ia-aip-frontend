import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import moment from 'moment';
import * as path from 'path';
import i18n from '../../locale/en.json';
import { countryList } from '../data/country-list';
import { serverErrorHandler } from '../handlers/error-handler';
import { paths } from '../paths';
import {
  docStoreUrlToId,
  documentIdToDocStoreUrl,
  DocumentManagementService
} from '../service/document-management-service';
import { addSummaryRowNoChange, Delimiter } from '../utils/summary-list';

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
  const history = req.session.appeal.history;
  const result = history.find(history => history.id === eventId);
  if (result.length) {
    return result;
  }
  return [ result ];
};

const formatDateLongDate = (date: string) => {
  return moment(date).format('DD MMMM YYYY');
};

function checkIfValueIsInHistory(valueFromHistory: string) {
  return !!valueFromHistory;
}

function setupAppealDetails(req: Request): Array<any> {
  const array = [];
  const appealData = getAppealApplicationData('submitAppeal', req);
  const { data } = appealData[0];
  const appealTypeNames: string[] = data.appealType.split(',').map(appealType => {
    return i18n.appealTypes[appealType].name;
  });
  if (checkIfValueIsInHistory(data.homeOfficeReferenceNumber)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.homeOfficeRefNumber, [ data.homeOfficeReferenceNumber ]));
  }
  if (checkIfValueIsInHistory(data.homeOfficeDecisionDate)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.dateLetterSent, [ formatDateLongDate(data.homeOfficeDecisionDate) ]));
  }
  if (checkIfValueIsInHistory(data.appellantNameForDisplay)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.name, [ data.appellantNameForDisplay ]));
  }
  if (checkIfValueIsInHistory(data.appellantDateOfBirth)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.dob, [ formatDateLongDate(data.appellantDateOfBirth) ]));
  }
  if (checkIfValueIsInHistory(data.appellantNationalities[0].value.code)) {
    const nation = countryList.find(country => country.value === appealData[0].data.appellantNationalities[0].value.code).name;
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.nationality, [ nation ]));
  }
  if (checkIfValueIsInHistory(data.appellantAddress)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.addressDetails, [ ...Object.values(data.appellantAddress) ], Delimiter.BREAK_LINE));
  }
  if (checkIfValueIsInHistory(data.subscriptions[0].value)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.contactDetails, [ data.subscriptions[0].value.email, data.subscriptions[0].value.mobileNumber ], Delimiter.BREAK_LINE));
  }
  if (checkIfValueIsInHistory(data.appealType)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.appealType, [ appealTypeNames ]));
  }
  if (checkIfValueIsInHistory(data.applicationOutOfTimeExplanation)) {
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.appealLate, [ data.applicationOutOfTimeExplanation ]));
  }
  if (checkIfValueIsInHistory(data.applicationOutOfTimeDocument)) {
    const evidence = data.applicationOutOfTimeDocument;
    const fileId = docStoreUrlToId(evidence.document_url, req.session.appeal.documentMap);
    const formattedFileName = fileNameFormatter(evidence.document_filename);
    const urlHtml = `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.detailsViewers.document}/${fileId}'>${formattedFileName}</a>`;
    array.push(addSummaryRowNoChange(i18n.pages.checkYourAnswers.rowTitles.supportingEvidence, [ urlHtml ]));
  }
  return array;
}

function setupAnswersReasonsForAppeal(req: Request): Array<any> {
  const array = [];
  const reasonsForAppeal = getAppealApplicationData('submitReasonsForAppeal', req);
  const { data } = reasonsForAppeal[0];
  const listOfDocuments: string[] = data.respondentDocuments.map(evidence => {
    const fileId = docStoreUrlToId(evidence.value.document.document_url, req.session.appeal.documentMap);
    const formattedFileName = fileNameFormatter(evidence.value.document.document_filename);
    return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.detailsViewers.document}/${fileId}'>${formattedFileName}</a>`;
  });
  array.push(addSummaryRowNoChange(i18n.pages.overviewPage.timeline.reasonsForAppealCheckAnswersHistory.whyYouThinkHomeOfficeIsWrong, [ data.reasonsForAppealDecision ]));
  if (checkIfValueIsInHistory(data.respondentDocuments)) {
    array.push(addSummaryRowNoChange(i18n.pages.reasonsForAppealUpload.title, [ ...Object.values(listOfDocuments) ], Delimiter.BREAK_LINE));
  }
  return array;
}

function getAppealDetailsViewer(req: Request, res: Response, next: NextFunction) {
  try {
    let previousPage: string = paths.overview;
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
    let previousPage: string = paths.overview;
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
    let previousPage: string = paths.overview;
    let documents = [];

    if (_.has(req.session.appeal, 'respondentDocuments')) {
      const respondentDocs = req.session.appeal.respondentDocuments;

      documents = respondentDocs.map(document => {
        const formattedFileName = fileNameFormatter(document.evidence.name);
        const urlHtml = `<a class='govuk-link' target='_blank' href='${paths.detailsViewers.document}/${document.evidence.fileId}'>${formattedFileName}</a>`;
        const formattedDate = moment(document.dateUploaded).format('DD MMMM YYYY');
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

function setupDetailViewersController(documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.detailsViewers.document + '/:documentId', getDocumentViewer(documentManagementService));
  router.get(paths.detailsViewers.homeOfficeDocuments, getHoEvidenceDetailsViewer);
  router.get(paths.detailsViewers.appealDetails, getAppealDetailsViewer);
  router.get(paths.detailsViewers.reasonsForAppeal, getReasonsForAppealViewer);

  return router;
}

export {
  getAppealDetailsViewer,
  getReasonsForAppealViewer,
  getDocumentViewer,
  getHoEvidenceDetailsViewer,
  setupDetailViewersController
};
