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

export const askForMoreTimeEvidenceUploadConfig: EvidenceUploadConfig = {
  evidenceYesNoPath: paths.common.askForMoreTimeSupportingEvidence,
  evidenceUploadPath: paths.common.askForMoreTimeSupportingEvidenceUpload,
  evidenceDeletePath: paths.common.askForMoreTimeSupportingEvidenceDelete,
  evidenceSubmitPath: paths.common.askForMoreTimeSupportingEvidenceSubmit,
  cancelPath: paths.common.askForMoreTimeCancel,
  nextPath: paths.common.askForMoreTimeCheckAndSend,
  askForMoreTimeFeatureEnabled: false,
  updateCcdEvent: Events.MAKE_AN_APPLICATION,
  addEvidenceToSessionFunction: function (evidences, req: Request) {
    if (!req.session.appeal.makeAnApplicationEvidence) {
      req.session.appeal.makeAnApplicationEvidence = [];
    }
    req.session.appeal.makeAnApplicationEvidence.push(evidences);
  },
  getEvidenceFromSessionFunction: function (req) {
    return req.session.appeal.makeAnApplicationEvidence || [];
  },
  removeEvidenceFromSessionFunction: function (fileId: string, req: Request) {
    req.session.appeal.makeAnApplicationEvidence = req.session.appeal.makeAnApplicationEvidence
      .filter((evidence: Evidence) => evidence.fileId !== fileId);
  }
};

function getAskForMoreTimePage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('./ask-for-more-time/ask-for-more-time.njk', {
      previousPage: paths.common.overview,
      askForMoreTime: req.session.appeal.makeAnApplicationDetails
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

// TODO: remove updateAppealService inject if not needed
function postAskForMoreTimePage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
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
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      req.session.appeal = {
        ...req.session.appeal,
        makeAnApplicationTypes: {
          'value': {
            'code': 'timeExtension',
            'label': 'Time extension'
          },
          'list_items': [
            {
              'code': 'judgeReview',
              'label': 'Judge\'s review of application decision'
            },
            {
              'code': 'timeExtension',
              'label': 'Time extension'
            }
          ]
        },
        makeAnApplicationDetails: req.body.askForMoreTime
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.common.askForMoreTimeSupportingEvidence);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getAskForMoreTimeEvidence(req: Request, res: Response, next: NextFunction) {
  getEvidenceYesNo(paths.common.askForMoreTimeReason, {}, res, next);
}

function postAdditionalSupportingEvidenceQuestionPage(req: Request, res: Response, next: NextFunction) {
  postEvidenceYesNo(
    paths.common.askForMoreTimeReason,
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
    const reasonFormattingPreserved = formatTextForCYA(req.session.appeal.makeAnApplicationDetails);
    const summaryRows = [
      addSummaryRow(i18n.common.cya.questionRowTitle, [i18n.pages.askForMoreTimePage.textAreaText], null),
      addSummaryRow(i18n.common.cya.answerRowTitle, [reasonFormattingPreserved], paths.common.askForMoreTimeReason)
    ];
    let previousPage = paths.common.askForMoreTimeSupportingEvidence;

    if (askForMoreTimeEvidenceUploadConfig.getEvidenceFromSessionFunction(req)) {
      const evidences: Evidence[] = askForMoreTimeEvidenceUploadConfig.getEvidenceFromSessionFunction(req);
      const evidenceNames: string[] = evidences.map((evidence) => evidence.name);
      if (evidenceNames.length) {
        const evidenceText = evidences.map((evidence) => {
          return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.documentViewer}/${evidence.fileId}'>${evidence.name}</a>`;
        });

        summaryRows.push(addSummaryRow(i18n.common.cya.supportingEvidenceRowTitle, evidenceText, paths.common.askForMoreTimeSupportingEvidenceUpload, Delimiter.BREAK_LINE));
        previousPage = paths.common.askForMoreTimeSupportingEvidence;
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
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.MAKE_AN_APPLICATION, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated,
        application: {
          ...req.session.appeal.application,
          ...appealUpdated.application
        }
      };
      return res.redirect(paths.common.askForMoreTimeConfirmation);
    } catch (e) {
      next(e);
    }
  };
}

function getConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    const saveAndAskForMoreTime = req.session.appeal.application.saveAndAskForTime || false ? '?save-and-ask-for-more-time' : '?ask-for-more-time';
    req.session.appeal.application.saveAndAskForTime = false;
    res.render('./ask-for-more-time/confirmation.njk', {
      saveAndAskForMoreTime
    });
  } catch (e) {
    next(e);
  }
}

function setupAskForMoreTimeController(middleware, deps?: any): Router {
  const router = Router();
  router.get(paths.common.askForMoreTimeReason, middleware, getAskForMoreTimePage);
  router.get(paths.common.askForMoreTimeCancel, middleware, getCancelAskForMoreTime);
  router.post(paths.common.askForMoreTimeReason, middleware, postAskForMoreTimePage(deps.updateAppealService));
  router.get(paths.common.askForMoreTimeSupportingEvidence, middleware, getAskForMoreTimeEvidence);
  router.post(paths.common.askForMoreTimeSupportingEvidence, middleware, postAdditionalSupportingEvidenceQuestionPage);
  router.get(paths.common.askForMoreTimeSupportingEvidenceUpload, middleware, getUploadEvidence);
  router.post(paths.common.askForMoreTimeSupportingEvidenceUpload, middleware, uploadConfiguration, handleFileUploadErrors, postUploadEvidence(deps.documentManagementService, deps.updateAppealService));
  router.get(paths.common.askForMoreTimeSupportingEvidenceDelete, middleware, getDeleteEvidence(deps.documentManagementService));
  router.post(paths.common.askForMoreTimeSupportingEvidenceSubmit, middleware, postSubmitEvidence(deps.updateAppealService));
  router.get(paths.common.askForMoreTimeCheckAndSend, middleware, getCheckAndSend);
  router.post(paths.common.askForMoreTimeCheckAndSend, middleware, postCheckAndSend(deps.updateAppealService));
  router.get(paths.common.askForMoreTimeConfirmation, getConfirmation);

  return router;
}

export {
  setupAskForMoreTimeController,
  getAskForMoreTimeEvidence,
  getAskForMoreTimePage,
  getCancelAskForMoreTime,
  getConfirmation,
  getUploadEvidence,
  postAdditionalSupportingEvidenceQuestionPage,
  postAskForMoreTimePage,
  getCheckAndSend,
  postCheckAndSend
};
