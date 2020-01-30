import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import { handleFileUploadErrors, uploadConfiguration } from '../../middleware/file-upload-validation-middleware';
import { paths } from '../../paths';
import { Events } from '../../service/ccd-service';
import { DocumentManagementService } from '../../service/document-management-service';
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
      const { application } = req.session.appeal;
      let validationError;

      if (!shouldValidateWhenSaveForLater(req.body, 'appeal-late')) {
        return getConditionalRedirectUrl(req, res, paths.taskList);
      } else {

        validationError = textAreaValidation(req.body['appeal-late'], 'appeal-late');

        if (!validationError) {
          if (res.locals.multerError) {
            validationError = { uploadFile: createStructuredError('uploadFile', res.locals.multerError) };
          } else {
            application.lateAppeal = {
              ...application.lateAppeal,
              reason: req.body['appeal-late']
            };
            if (req.file) {
              const evidenceStored: DocumentUploadResponse = await documentManagementService.uploadFile(req);
              application.lateAppeal = {
                ...application.lateAppeal,
                evidence: {
                  id: evidenceStored.id,
                  url: evidenceStored.url,
                  name: evidenceStored.name
                }
              };
            }
            await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);
            return getConditionalRedirectUrl(req, res, getNextPage(req.body, paths.checkAndSend));
          }
        }

        let evidence = null;
        if (_.has(req.session.appeal.application, 'lateAppeal.evidence')) {
          evidence = req.session.appeal.application.lateAppeal.evidence;
        }

        return res.render('appeal-application/home-office/appeal-late.njk', {
          appealLateReason: req.body['appeal-late'],
          evidence: evidence,
          evidenceCTA: paths.homeOffice.deleteEvidence,
          error: validationError,
          errorList: Object.values(validationError),
          previousPage: paths.taskList
        });
      }
    } catch (e) {
      next(e);
    }
  };
}

function getAppealLateDeleteFile(documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const evidence: Evidence = req.session.appeal.application.lateAppeal.evidence;
      await documentManagementService.deleteFile(req, evidence.url);
      delete req.session.appeal.application.lateAppeal.evidence;
      return res.redirect(paths.homeOffice.appealLate);
    } catch (e) {
      next(e);
    }
  };
}

function setupOutOfTimeController(deps?: any): Router {

  const router = Router();
  router.get(paths.homeOffice.appealLate, getAppealLate);
  router.post(paths.homeOffice.appealLate, uploadConfiguration, handleFileUploadErrors, postAppealLate(deps.documentManagementService, deps.updateAppealService));
  router.get(paths.homeOffice.deleteEvidence, getAppealLateDeleteFile(deps.documentManagementService));
  return router;
}

export {
  getAppealLate,
  postAppealLate,
  getAppealLateDeleteFile,
  setupOutOfTimeController
};
