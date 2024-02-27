import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { createStructuredError, textAreaValidation } from '../../utils/validations/fields-validations';

async function getAppealLate(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const appealLateReason: string = application.lateAppeal && application.lateAppeal.reason || null;
    const evidence: Evidence = application.lateAppeal && application.lateAppeal.evidence || null;
    const dlrmFeeRemissionFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
    let appealOutOfCountry = (req.session.appeal.appealOutOfCountry === 'Yes');
    res.render('appeal-application/home-office/appeal-late.njk', {
      appealLateReason,
      evidence: evidence,
      evidenceCTA: paths.appealStarted.deleteEvidence,
      evidenceUploadAction: paths.appealStarted.appealLateUploadEvidence,
      previousPage: paths.appealStarted.taskList,
      appealOutOfCountry: appealOutOfCountry,
      dlrmFeeRemissionFlag: dlrmFeeRemissionFlag
    });
  } catch (e) {
    next(e);
  }
}

function postAppealLate(documentManagementService: DocumentManagementService, updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'appeal-late')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview);
      }

      const { application } = req.session.appeal;
      const dlrmFeeRemissionFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
      let validationError = textAreaValidation(req.body['appeal-late'], 'appeal-late');
      let appealOutOfCountry = (req.session.appeal.appealOutOfCountry === 'Yes');

      if (res.locals.multerError) {
        validationError = {
          ...validationError,
          uploadFile: createStructuredError('uploadFile', res.locals.multerError)
        };
      }

      if (validationError) {
        let evidence = null;
        if (_.has(application, 'lateAppeal.evidence')) {
          evidence = application.lateAppeal.evidence;
        }

        return res.render('appeal-application/home-office/appeal-late.njk', {
          appealLateReason: req.body['appeal-late'],
          evidence,
          error: validationError,
          errorList: Object.values(validationError),
          previousPage: paths.appealStarted.taskList,
          appealOutOfCountry: appealOutOfCountry
        });
      }
      let lateAppeal: LateAppeal = req.session.appeal.application.lateAppeal;
      if (!dlrmFeeRemissionFlag) {
        if (req.file) {
          if (_.has(application.lateAppeal, 'evidence.fileId')) {
            await documentManagementService.deleteFile(req, application.lateAppeal.evidence.fileId);
          }
          const evidenceStored: DocumentUploadResponse = await documentManagementService.uploadFile(req);
          lateAppeal = {
            ...req.session.appeal.application.lateAppeal,
            evidence: {
              fileId: evidenceStored.fileId,
              name: evidenceStored.name
            }
          };
        }
      }
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          lateAppeal: {
            ...lateAppeal,
            reason: req.body['appeal-late']
          }
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.checkAndSend);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function postAppealLateUploadFile(documentManagementService: DocumentManagementService, updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { application } = req.session.appeal;
      let lateAppeal: LateAppeal;
      if (req.file) {
        if (_.has(application.lateAppeal, 'evidence.fileId')) {
          await documentManagementService.deleteFile(req, application.lateAppeal.evidence.fileId);
        }
        const evidenceStored: DocumentUploadResponse = await documentManagementService.uploadFile(req);
        lateAppeal = {
          ...req.session.appeal.application.lateAppeal,
          evidence: {
            fileId: evidenceStored.fileId,
            name: evidenceStored.name
          }
        };
      }
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          lateAppeal: {
            ...lateAppeal
          }
        }
      };
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      return res.redirect(paths.appealStarted.appealLate);
    } catch (e) {
      next(e);
    }
  };
}

function postAppealLateDeleteFile(documentManagementService: DocumentManagementService, updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const evidence: Evidence = req.session.appeal.application.lateAppeal.evidence;
      await documentManagementService.deleteFile(req, evidence.fileId);
      delete req.session.appeal.application.lateAppeal.evidence;
      const validationError = textAreaValidation(req.body['appeal-late'], 'appeal-late');
      let appealOutOfCountry = (req.session.appeal.appealOutOfCountry === 'Yes');

      if (validationError) {
        return res.render('appeal-application/home-office/appeal-late.njk', {
          appealLateReason: req.body['appeal-late'],
          error: validationError,
          errorList: Object.values(validationError),
          previousPage: paths.appealStarted.taskList,
          appealOutOfCountry: appealOutOfCountry
        });
      }
      const lateAppeal: LateAppeal = {
        reason: req.body['appeal-late']
      };
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          lateAppeal
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.appealLate);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function setupOutOfTimeController(middleware: Middleware[], deps?: any): Router {
  const router = Router();
  router.get(paths.appealStarted.appealLate, middleware, getAppealLate);
  router.post(paths.appealStarted.appealLate, middleware, postAppealLate(deps.documentManagementService, deps.updateAppealService));
  router.post(paths.appealStarted.appealLateUploadEvidence, middleware, postAppealLateUploadFile(deps.documentManagementService, deps.updateAppealService));
  router.post(paths.appealStarted.deleteEvidence, middleware, postAppealLateDeleteFile(deps.documentManagementService, deps.updateAppealService));
  return router;
}

export {
  getAppealLate,
  postAppealLate,
  postAppealLateDeleteFile,
  postAppealLateUploadFile,
  setupOutOfTimeController
};
