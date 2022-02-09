import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { dateLetterSentValidation, homeOfficeNumberValidation } from '../../utils/validations/fields-validations';

function getHomeOfficeDetails(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { homeOfficeRefNumber } = req.session.appeal.application || null;
    res.render('appeal-application/home-office/details.njk', {
      homeOfficeRefNumber,
      previousPage: paths.appealStarted.taskList
    });
  } catch (e) {
    next(e);
  }
}

function postHomeOfficeDetails(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'homeOfficeRefNumber')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview);
      }
      const validation = homeOfficeNumberValidation(req.body);
      if (validation) {
        return res.render('appeal-application/home-office/details.njk',
          {
            errors: validation,
            errorList: Object.values(validation),
            homeOfficeRefNumber: req.body.homeOfficeRefNumber,
            previousPage: paths.appealStarted.taskList
          }
        );
      }
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          homeOfficeRefNumber: req.body.homeOfficeRefNumber,
          appellantInUk: 'No'
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.letterSent);
      return res.redirect(redirectPage);
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
      previousPage: paths.appealStarted.details
    });
  } catch (e) {
    next(e);
  }
}

function postDateLetterSent(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'day', 'month', 'year')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = dateLetterSentValidation(req.body);
      if (validation) {
        return res.render('appeal-application/home-office/letter-sent.njk', {
          error: validation,
          errorList: Object.values(validation),
          dateLetterSent: {
            ...req.body
          },
          previousPage: paths.appealStarted.details
        });
      }

      const { day, month, year } = req.body;
      const diffInDays = moment().diff(moment(`${year} ${month} ${day}`, 'YYYY MM DD'), 'days');
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: diffInDays <= 14 ? false : true,
          dateLetterSent: {
            day,
            month,
            year
          }
        }
      };
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.homeOfficeDecisionLetter);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function setupHomeOfficeDetailsController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.details, middleware, getHomeOfficeDetails);
  router.post(paths.appealStarted.details, middleware, postHomeOfficeDetails(updateAppealService));
  router.get(paths.appealStarted.letterSent, middleware, getDateLetterSent);
  router.post(paths.appealStarted.letterSent, middleware, postDateLetterSent(updateAppealService));
  return router;
}

export {
  getDateLetterSent,
  getHomeOfficeDetails,
  postDateLetterSent,
  postHomeOfficeDetails,
  setupHomeOfficeDetailsController
};
