import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { paths } from '../paths';
import { Events } from '../service/ccd-service';
import UpdateAppealService from '../service/update-appeal-service';
import { textAreaValidation } from '../utils/fields-validations';
import { getConditionalRedirectUrl } from '../utils/url-utils';

const maxCharacters = config.get('maxCharacters');

function getAppealLate(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const appealLateReason: string = application.lateAppeal && application.lateAppeal.reason || null;
    const evidence: Evidence = application.lateAppeal && application.lateAppeal.evidence || null;
    res.render('appeal-application/home-office/appeal-late.njk',{
      maxCharacters,
      appealLateReason,
      evidence,
      evidenceCTA: paths.homeOffice.deleteEvidence,
      previousPage: paths.taskList
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
        const evidence: Evidence = application.lateAppeal && application.lateAppeal.evidence || null;
        return res.render('appeal-application/home-office/appeal-late.njk', {
          maxCharacters,
          appealLate: req.body['appeal-late'],
          evidence,
          evidenceCTA: paths.homeOffice.deleteEvidence,
          error: validation,
          errorList: Object.values(validation),
          previousPage: paths.taskList
        });
      }
      application.lateAppeal = {
        ...application.lateAppeal,
        reason: req.body['appeal-late']
      };

      if (req.file) {
        application.lateAppeal.evidence = {
          url: req.file.originalname,
          name: req.file.originalname
        };
      }
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
      const { application } = req.session.appeal;
      application.lateAppeal = {
        ...application.lateAppeal,
        evidence: {
          url: req.file.originalname,
          name: req.file.originalname
        }
      };
    }
    return res.redirect(paths.homeOffice.appealLate);
  } catch (e) {
    next(e);
  }
}

function getDeleteEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.lateAppeal.evidence = null;
    return res.redirect(paths.homeOffice.appealLate);
  } catch (e) {
    next(e);
  }
}

function setupOutOfTimeController(updateAppealService: UpdateAppealService): Router {
  const upload = multer().single('file-upload');
  const router = Router();
  router.get(paths.homeOffice.appealLate, getAppealLate);
  router.post(paths.homeOffice.appealLate, upload, postAppealLate(updateAppealService));
  router.post(paths.homeOffice.uploadEvidence, upload, postUploadEvidence);
  router.get(paths.homeOffice.deleteEvidence, upload, getDeleteEvidence);
  return router;
}

export {
  getAppealLate,
  postAppealLate,
  postUploadEvidence,
  getDeleteEvidence,
  setupOutOfTimeController
};
