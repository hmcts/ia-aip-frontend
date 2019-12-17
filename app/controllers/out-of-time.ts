import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { paths } from '../paths';
import { Events } from '../service/ccd-service';
import UpdateAppealService from '../service/update-appeal-service';
import { textAreaValidation } from '../utils/fields-validations';
import { getConditionalRedirectUrl } from '../utils/url-utils';

function getAppealLate(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const appealLateReason: string = application.lateAppeal && application.lateAppeal.reason || null;
    const evidences: Evidences = application.lateAppeal && application.lateAppeal.evidences || {};
    res.render('appeal-application/home-office/appeal-late.njk',{
      appealLateReason,
      evidences: Object.values(evidences),
      evidenceCTA: paths.homeOffice.deleteEvidence,
      previousPage: paths.homeOffice.letterSent
    });
  } catch (e) {
    next(e);
  }
}

function postAppealLate(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = textAreaValidation(req.body['appeal-late'], 'appeal-late');
      const { application } = req.session.appeal;
      if (validation) {
        const evidences = application.lateAppeal && application.lateAppeal.evidences || {};
        return res.render('appeal-application/home-office/appeal-late.njk', {
          appealLate: req.body['appeal-late'],
          evidences: Object.values(evidences),
          error: validation,
          errorList: Object.values(validation),
          previousPage: paths.homeOffice.letterSent
        });
      }
      application.lateAppeal = {
        ...application.lateAppeal,
        reason: req.body['appeal-late']
      };
      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);
      return getConditionalRedirectUrl(req, res, paths.taskList);
    } catch (e) {
      next(e);
    }
  };
}

function postUploadEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.file) {
      const fileDescription: string = req.body['file-description'];
      const validation = textAreaValidation(fileDescription, 'file-description');
      const { application } = req.session.appeal;
      if (validation) {
        const evidences = application.lateAppeal && application.lateAppeal.evidences || {};
        return res.render('appeal-application/home-office/appeal-late.njk', {
          appealLate: application.lateAppeal && application.lateAppeal.reason || null,
          evidences: Object.values(evidences),
          error: validation,
          errorList: Object.values(validation),
          previousPage: paths.homeOffice.letterSent
        });
      }
      application.lateAppeal = {
        ...application.lateAppeal,
        evidences: {
          ...(application.lateAppeal && application.lateAppeal.evidences || {}),
          [req.file.originalname]: {
            url: req.file.originalname,
            name: req.file.originalname,
            description: fileDescription
          },
          ...(application.lateAppeal && application.lateAppeal.evidences || {})
        }
      };
    }
    return res.redirect(paths.homeOffice.appealLate);
  } catch (e) {
    next(e);
  }
}

function postDeleteEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.body.delete) {
      const fileId = Object.keys(req.body.delete)[0];
      delete req.session.appeal.application.lateAppeal.evidences[fileId];
    }
    return res.redirect(paths.homeOffice.appealLate);
  } catch (e) {
    next(e);
  }
}

function setupHomeOfficeDetailsController(updateAppealService: UpdateAppealService): Router {
  const upload = multer().single('file-upload');
  const router = Router();
  router.get(paths.homeOffice.appealLate, getAppealLate);
  router.post(paths.homeOffice.appealLate, upload, postAppealLate(updateAppealService));
  router.post(paths.homeOffice.uploadEvidence, upload, postUploadEvidence);
  router.post(paths.homeOffice.deleteEvidence, upload, postDeleteEvidence);
  return router;
}

export {
  getAppealLate,
  postAppealLate,
  postUploadEvidence,
  postDeleteEvidence,
  setupHomeOfficeDetailsController
};
