import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import multer from 'multer';
import { paths } from '../../paths';
import { Events } from '../../service/ccd-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { dateLetterSentValidation, homeOfficeNumberValidation, textAreaValidation } from '../../utils/validations/fields-validations';

function getHomeOfficeDetails(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { homeOfficeRefNumber } = req.session.appeal.application || null;
    res.render('appeal-application/home-office/details.njk', {
      homeOfficeRefNumber,
      previousPage: paths.taskList
    });
  } catch (e) {
    next(e);
  }
}

function postHomeOfficeDetails(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = homeOfficeNumberValidation(req.body);
      if (validation) {
        return res.render('appeal-application/home-office/details.njk',
          {
            errors: validation,
            errorList: Object.values(validation),
            homeOfficeRefNumber: req.body.homeOfficeRefNumber,
            previousPage: paths.taskList
          }
        );
      }
      req.session.appeal.application.homeOfficeRefNumber = req.body.homeOfficeRefNumber;
      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);
      return getConditionalRedirectUrl(req, res, paths.homeOffice.letterSent);
    } catch (e) {
      next(e);
    }
  };
}

function getDateLetterSent(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { dateLetterSent } = req.session.appeal.application;
    res.render('appeal-application/home-office/letter-sent.njk', {
      dateLetterSent,
      previousPage: paths.homeOffice.details
    });
  } catch (e) {
    next(e);
  }
}

function postDateLetterSent(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = dateLetterSentValidation(req.body);
      if (validation) {
        return res.render('appeal-application/home-office/letter-sent.njk', {
          error: validation,
          errorList: Object.values(validation),
          dateLetterSent: {
            ...req.body
          },
          previousPage: paths.homeOffice.details
        });
      }
      const { day, month, year } = req.body;
      const diffInDays = moment().diff(moment(`${year} ${month} ${day}`, 'YYYY MM DD'), 'days');

      req.session.appeal.application['dateLetterSent'] = {
        day,
        month,
        year
      };

      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);

      if (diffInDays <= 14) {
        req.session.appeal.application.isAppealLate = false;
        return getConditionalRedirectUrl(req, res, paths.taskList);

      }
      req.session.appeal.application.isAppealLate = true;
      res.redirect(paths.homeOffice.appealLate);
    } catch (e) {
      next(e);
    }
  };
}

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

const upload = multer().single('file-upload');

function setupHomeOfficeDetailsController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.homeOffice.details, getHomeOfficeDetails);
  router.post(paths.homeOffice.details, postHomeOfficeDetails(updateAppealService));
  router.get(paths.homeOffice.letterSent, getDateLetterSent);
  router.post(paths.homeOffice.letterSent, postDateLetterSent(updateAppealService));
  router.get(paths.homeOffice.appealLate, getAppealLate);
  router.post(paths.homeOffice.appealLate, upload, postAppealLate(updateAppealService));
  router.post(paths.homeOffice.uploadEvidence, upload, postUploadEvidence);
  router.post(paths.homeOffice.deleteEvidence, upload, postDeleteEvidence);
  return router;
}

export {
  getDateLetterSent,
  getHomeOfficeDetails,
  postDateLetterSent,
  postHomeOfficeDetails,
  getAppealLate,
  postAppealLate,
  postDeleteEvidence,
  postUploadEvidence,
  setupHomeOfficeDetailsController
};
