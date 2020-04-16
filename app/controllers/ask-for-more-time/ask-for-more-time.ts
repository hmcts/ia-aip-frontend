import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { handleFileUploadErrors, uploadConfiguration } from '../../middleware/file-upload-validation-middleware';
import { paths } from '../../paths';
import { Events } from '../../service/ccd-service';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getNextPage } from '../../utils/save-for-later-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { nowIsoDate } from '../../utils/utils';
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
  evidenceYesNoPath: paths.askForMoreTime.evidenceYesNo,
  evidenceUploadPath: paths.askForMoreTime.supportingEvidenceUpload,
  evidenceDeletePath: paths.askForMoreTime.supportingEvidenceDelete,
  evidenceSubmitPath: paths.askForMoreTime.supportingEvidenceSubmit,
  cancelPath: paths.askForMoreTime.cancel,
  nextPath: paths.askForMoreTime.checkAndSend,
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
      previousPage: paths.overview,
      askForMoreTime: req.session.appeal.askForMoreTime.reason
    });
  } catch (e) {
    next(e);
  }
}

function getCancelAskForMoreTime(req: Request, res: Response) {
  req.session.appeal.askForMoreTime = {};
  const nextPage = getNextPage(req.body, paths.overview);
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
            previousPage: paths.overview
          }
      );
      }

      req.session.appeal.askForMoreTime = {
        reason: req.body.askForMoreTime,
        evidence: req.session.appeal.askForMoreTime.evidence,
        status: 'inProgress',
        state: req.session.appeal.appealStatus
      };

      await updateAppealService.submitEvent(Events.EDIT_TIME_EXTENSION, req);

      const nextPage = getNextPage(req.body, paths.askForMoreTime.evidenceYesNo);
      return getConditionalRedirectUrl(req, res, nextPage);
    } catch (e) {
      next(e);
    }
  };
}

function getAskForMoreTimeEvidence(req: Request, res: Response, next: NextFunction) {
  getEvidenceYesNo(paths.askForMoreTime.reason, {}, res, next);
}

function postAdditionalSupportingEvidenceQuestionPage(req: Request, res: Response, next: NextFunction) {
  postEvidenceYesNo(
    paths.askForMoreTime.reason,
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
    const reasonFormattingPreserved = `<span class='answer'>${req.session.appeal.askForMoreTime.reason}</span>`;
    const summaryRows = [
      addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.askForMoreTimePage.textAreaText], null),
      addSummaryRow(i18n.common.cya.answerRowTitle, [ reasonFormattingPreserved ], paths.askForMoreTime.reason)
    ];
    let previousPage = paths.askForMoreTime.evidenceYesNo;

    if (askForMoreTimeEvidenceUploadConfig.getEvidenceFromSessionFunction(req)) {
      const evidences: Evidence[] = askForMoreTimeEvidenceUploadConfig.getEvidenceFromSessionFunction(req);
      const evidenceNames: string[] = evidences.map((evidence) => evidence.name);
      if (evidenceNames.length) {
        summaryRows.push(addSummaryRow(i18n.common.cya.supportingEvidenceRowTitle, evidenceNames, paths.askForMoreTime.supportingEvidenceUpload, Delimiter.BREAK_LINE));
        previousPage = paths.askForMoreTime.evidenceYesNo;
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
      req.session.appeal.askForMoreTime.status = 'submitted';
      req.session.appeal.askForMoreTime.requestedDate = nowIsoDate();
      req.session.appeal.askForMoreTime.reviewTimeExtensionRequired = 'Yes';
      req.session.appeal.previousAskForMoreTime.push({ ...req.session.appeal.askForMoreTime });
      req.session.appeal.askForMoreTime = {};
      await updateAppealService.submitEvent(Events.SUBMIT_TIME_EXTENSION, req);

      res.redirect(paths.overview);
    } catch (e) {
      next(e);
    }
  };
}

function setupAskForMoreTimeController(deps?: any): Router {
  const router = Router();
  router.get(paths.askForMoreTime.reason, getAskForMoreTimePage);
  router.get(paths.askForMoreTime.cancel, getCancelAskForMoreTime);
  router.post(paths.askForMoreTime.reason, postAskForMoreTimePage(deps.updateAppealService));
  router.get(paths.askForMoreTime.evidenceYesNo, getAskForMoreTimeEvidence);
  router.post(paths.askForMoreTime.evidenceYesNo, postAdditionalSupportingEvidenceQuestionPage);
  router.get(paths.askForMoreTime.supportingEvidenceUpload, getUploadEvidence);
  router.post(paths.askForMoreTime.supportingEvidenceUpload, uploadConfiguration, handleFileUploadErrors, postUploadEvidence(deps.documentManagementService, deps.updateAppealService));
  router.get(paths.askForMoreTime.supportingEvidenceDelete, getDeleteEvidence(deps.documentManagementService));
  router.post(paths.askForMoreTime.supportingEvidenceSubmit, postSubmitEvidence(deps.updateAppealService));
  router.get(paths.askForMoreTime.checkAndSend, getCheckAndSend);
  router.post(paths.askForMoreTime.checkAndSend, postCheckAndSend(deps.updateAppealService));

  return router;
}

export {
  setupAskForMoreTimeController,
  getAskForMoreTimePage,
  getCancelAskForMoreTime,
  postAskForMoreTimePage,
  getCheckAndSend,
  postCheckAndSend
};
