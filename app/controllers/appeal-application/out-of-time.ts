import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import { documentIdToDocStoreUrl, DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getNextPage, shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { createStructuredError, textAreaValidation } from '../../utils/validations/fields-validations';

function getAppealLate(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const appealLateReason: string = application.lateAppeal && application.lateAppeal.reason || null;
    const evidence: Evidence = application.lateAppeal && application.lateAppeal.evidence || null;
    res.render('appeal-application/home-office/appeal-late.njk', {
      appealLateReason,
      evidence: evidence,
      evidenceCTA: paths.homeOffice.deleteEvidence,
      previousPage: paths.taskList
    });
  } catch (e) {
    next(e);
  }
}

function postAppealLate(documentManagementService: DocumentManagementService, updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'appeal-late')) {
        return getConditionalRedirectUrl(req, res, paths.overview);
      }

      const { application } = req.session.appeal;
      let validationError = textAreaValidation(req.body['appeal-late'], 'appeal-late');

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
          previousPage: paths.taskList
        });
      }

      if (req.file) {
        if (_.has(application.lateAppeal, 'evidence.fileId')) {
          const documentLocationUrl: string = documentIdToDocStoreUrl(application.lateAppeal.evidence.fileId, req.session.appeal.documentMap);
          await documentManagementService.deleteFile(req, documentLocationUrl);
        }
        const evidenceStored: DocumentUploadResponse = await documentManagementService.uploadFile(req);
        application.lateAppeal = {
          ...application.lateAppeal,
          evidence: {
            fileId: evidenceStored.fileId,
            name: evidenceStored.name
          }
        };
      }
      application.lateAppeal = {
        ...application.lateAppeal,
        reason: req.body['appeal-late']
      };
      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);
      return getConditionalRedirectUrl(req, res, getNextPage(req.body, paths.checkAndSend));
    } catch (e) {
      next(e);
    }
  };
}

function postAppealLateDeleteFile(documentManagementService: DocumentManagementService, updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const evidence: Evidence = req.session.appeal.application.lateAppeal.evidence;
      const documentLocationUrl: string = documentIdToDocStoreUrl(evidence.fileId, req.session.appeal.documentMap);
      await documentManagementService.deleteFile(req, documentLocationUrl);
      delete req.session.appeal.application.lateAppeal.evidence;

      const validationError = textAreaValidation(req.body['appeal-late'], 'appeal-late');
      if (validationError) {
        return res.render('appeal-application/home-office/appeal-late.njk', {
          appealLateReason: req.body['appeal-late'],
          error: validationError,
          errorList: Object.values(validationError),
          previousPage: paths.taskList
        });
      }
      req.session.appeal.application.lateAppeal.reason = req.body['appeal-late'];
      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);
      return res.redirect(paths.homeOffice.appealLate);
    } catch (e) {
      next(e);
    }
  };
}

function setupOutOfTimeController(deps?: any): Router {

  const router = Router();
  router.get(paths.homeOffice.appealLate, getAppealLate);
  router.post(paths.homeOffice.appealLate, postAppealLate(deps.documentManagementService, deps.updateAppealService));
  router.post(paths.homeOffice.deleteEvidence, postAppealLateDeleteFile(deps.documentManagementService, deps.updateAppealService));
  return router;
}

export {
  getAppealLate,
  postAppealLate,
  postAppealLateDeleteFile,
  setupOutOfTimeController
};
