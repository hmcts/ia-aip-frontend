import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { handleFileUploadErrors, uploadConfiguration } from '../../middleware/file-upload-validation-middleware';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getNextPage } from '../../utils/save-for-later-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { formatTextForCYA, getRedirectPage } from '../../utils/utils';
import { askForMoreTimeValidation } from '../../utils/validations/fields-validations';
import {
  EvidenceUploadConfig,
  getEvidenceYesNo,
  getSupportingEvidenceDeleteFile,
  getUploadPage,
  postEvidenceYesNo,
  postSupportingEvidence,
  postUploadFile
} from '../upload-evidence/upload-evidence-controller';

const askForMoreTimeEvidenceUploadConfig: EvidenceUploadConfig = {
  evidenceYesNoPath: paths.common.askForMoreTime.evidenceYesNo,
  evidenceUploadPath: paths.common.askForMoreTime.supportingEvidenceUpload,
  evidenceDeletePath: paths.common.askForMoreTime.supportingEvidenceDelete,
  evidenceSubmitPath: paths.common.askForMoreTime.supportingEvidenceSubmit,
  cancelPath: paths.common.askForMoreTime.cancel,
  nextPath: paths.common.askForMoreTime.checkAndSend,
  askForMoreTimeFeatureEnabled: false,
  updateCcdEvent: Events.EDIT_TIME_EXTENSION,
  addEvidenceToSessionFunction: function (evidences, req: Request) {
    if (!req.session.appeal.askForMoreTime.evidence) {
      req.session.appeal.askForMoreTime.evidence = [];
    }
    req.session.appeal.askForMoreTime.evidence.push(evidences);
  },
  getEvidenceFromSessionFunction: function (req) {
    return req.session.appeal.askForMoreTime.evidence || [];
  },
  removeEvidenceFromSessionFunction: function (fileId: string, req: Request) {
    req.session.appeal.askForMoreTime.evidence = req.session.appeal.askForMoreTime.evidence
      .filter((evidence: Evidence) => evidence.fileId !== fileId);
  }
};

function getAskForMoreTimePage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('./ask-for-more-time/ask-for-more-time.njk', {
      previousPage: paths.common.overview,
      askForMoreTime: req.session.appeal.askForMoreTime.reason
    });
  } catch (e) {
    next(e);
  }
}

function getCancelAskForMoreTime(req: Request, res: Response) {
  req.session.appeal.askForMoreTime = {};
  const nextPage = getNextPage(req.body, paths.common.overview);
  return getConditionalRedirectUrl(req, res, nextPage);
}

function postAskForMoreTimePage(updateAppealService: UpdateAppealService) {
  return async function(req: Request, res: Response, next: NextFunction) {
    try {
      const { askForMoreTime } = req.body;
      const validation = askForMoreTimeValidation(req.body);
      if (validation) {
        return res.render('./ask-for-more-time/ask-for-more-time.njk',
          {
            errors: validation,
            errorList: Object.values(validation),
            askForMoreTime: askForMoreTime,
            previousPage: paths.common.overview
          }
        );
      }
      const appeal: Appeal = {
        ...req.session.appeal,
        askForMoreTime: {
          ...req.session.appeal.askForMoreTime,
          reason: req.body.askForMoreTime
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const updatedCase: CcdCaseDetails = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      const appealUpdated: Appeal = updateAppealService.mapCcdCaseToAppeal(updatedCase);
      req.session.appeal = appealUpdated;
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.common.askForMoreTime.evidenceYesNo);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getAskForMoreTimeEvidence(req: Request, res: Response, next: NextFunction) {
  getEvidenceYesNo(paths.common.askForMoreTime.reason, {}, res, next);
}

function postAdditionalSupportingEvidenceQuestionPage(req: Request, res: Response, next: NextFunction) {
  postEvidenceYesNo(
    paths.common.askForMoreTime.reason,
    {},
    askForMoreTimeEvidenceUploadConfig,
    req,
    res,
    next
  );
}

function getUploadEvidence(req: Request, res: Response, next: NextFunction) {
  getUploadPage(askForMoreTimeEvidenceUploadConfig,
    req,
    res,
    next
  );
}

function postUploadEvidence(documentManagementService: DocumentManagementService, updateAppealService: UpdateAppealService) {
  return postUploadFile(documentManagementService, updateAppealService, askForMoreTimeEvidenceUploadConfig);
}

function getDeleteEvidence(documentManagementService: DocumentManagementService) {
  return getSupportingEvidenceDeleteFile(documentManagementService, askForMoreTimeEvidenceUploadConfig);
}

function postSubmitEvidence(updateAppealService: UpdateAppealService) {
  return postSupportingEvidence(updateAppealService, askForMoreTimeEvidenceUploadConfig);
}

function getCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    const reasonFormattingPreserved = formatTextForCYA(req.session.appeal.askForMoreTime.reason);
    const summaryRows = [
      addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.askForMoreTimePage.textAreaText], null),
      addSummaryRow(i18n.common.cya.answerRowTitle, [ reasonFormattingPreserved ], paths.common.askForMoreTime.reason)
    ];
    let previousPage = paths.common.askForMoreTime.evidenceYesNo;

    if (askForMoreTimeEvidenceUploadConfig.getEvidenceFromSessionFunction(req)) {
      const evidences: Evidence[] = askForMoreTimeEvidenceUploadConfig.getEvidenceFromSessionFunction(req);
      const evidenceNames: string[] = evidences.map((evidence) => evidence.name);
      if (evidenceNames.length) {
        const evidenceText = evidences.map((evidence) => {
          return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.detailsViewers.document}/${evidence.fileId}'>${evidence.name}</a>`;
        });

        summaryRows.push(addSummaryRow(i18n.common.cya.supportingEvidenceRowTitle, evidenceText, paths.common.askForMoreTime.supportingEvidenceUpload, Delimiter.BREAK_LINE));
        previousPage = paths.common.askForMoreTime.evidenceYesNo;
      }
    }

    res.render('./ask-for-more-time/check-and-send.njk', {
      previousPage: previousPage,
      summaryRows: summaryRows
    });
  } catch (e) {
    next(e);
  }
}

function postCheckAndSend(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appeal: Appeal = {
        ...req.session.appeal,
        askForMoreTime: {
          ...req.session.appeal.askForMoreTime,
          reviewTimeExtensionRequired: 'Yes'
        }
      };
      const updatedCase: CcdCaseDetails = await updateAppealService.submitEventRefactored(Events.SUBMIT_TIME_EXTENSION, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      const appealUpdated: Appeal = updateAppealService.mapCcdCaseToAppeal(updatedCase);
      req.session.appeal = appealUpdated;
      return res.redirect(paths.common.askForMoreTime.confirmation);
    } catch (e) {
      next(e);
    }
  };
}

function getConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('./ask-for-more-time/confirmation.njk', {});
  } catch (e) {
    next(e);
  }
}

function setupAskForMoreTimeController(middleware, deps?: any): Router {
  const router = Router();
  router.get(paths.common.askForMoreTime.reason, middleware, getAskForMoreTimePage);
  router.get(paths.common.askForMoreTime.cancel, middleware, getCancelAskForMoreTime);
  router.post(paths.common.askForMoreTime.reason, middleware, postAskForMoreTimePage(deps.updateAppealService));
  router.get(paths.common.askForMoreTime.evidenceYesNo, middleware, getAskForMoreTimeEvidence);
  router.post(paths.common.askForMoreTime.evidenceYesNo, middleware, postAdditionalSupportingEvidenceQuestionPage);
  router.get(paths.common.askForMoreTime.supportingEvidenceUpload, middleware, getUploadEvidence);
  router.post(paths.common.askForMoreTime.supportingEvidenceUpload, middleware, uploadConfiguration, handleFileUploadErrors, postUploadEvidence(deps.documentManagementService, deps.updateAppealService));
  router.get(paths.common.askForMoreTime.supportingEvidenceDelete, middleware, getDeleteEvidence(deps.documentManagementService));
  router.post(paths.common.askForMoreTime.supportingEvidenceSubmit, middleware, postSubmitEvidence(deps.updateAppealService));
  router.get(paths.common.askForMoreTime.checkAndSend, middleware, getCheckAndSend);
  router.post(paths.common.askForMoreTime.checkAndSend, middleware, postCheckAndSend(deps.updateAppealService));
  router.get(paths.common.askForMoreTime.confirmation, getConfirmation);

  return router;
}

export {
  setupAskForMoreTimeController,
  getAskForMoreTimePage,
  getCancelAskForMoreTime,
  getConfirmation,
  postAskForMoreTimePage,
  getCheckAndSend,
  postCheckAndSend
};
