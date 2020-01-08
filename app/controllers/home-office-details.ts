import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import { paths } from '../paths';
import { Events } from '../service/ccd-service';
import UpdateAppealService from '../service/update-appeal-service';
import { dateLetterSentValidation, homeOfficeNumberValidation } from '../utils/fields-validations';
import { getNextPage, shouldValidateWhenSaveForLater } from '../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../utils/url-utils';

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
      if (!shouldValidateWhenSaveForLater(req.body, 'homeOfficeRefNumber')) {
        return getConditionalRedirectUrl(req, res, paths.taskList);
      }
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
      const nextPage = getNextPage(req.body, paths.homeOffice.letterSent);
      return getConditionalRedirectUrl(req, res, nextPage);
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
      if (!shouldValidateWhenSaveForLater(req.body, 'day', 'month', 'year')) {
        return getConditionalRedirectUrl(req, res, paths.taskList);
      }
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
      } else {
        req.session.appeal.application.isAppealLate = true;
      }
      return getConditionalRedirectUrl(req, res, paths.taskList);
    } catch (e) {
      next(e);
    }
  };
}

function setupHomeOfficeDetailsController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.homeOffice.details, getHomeOfficeDetails);
  router.post(paths.homeOffice.details, postHomeOfficeDetails(updateAppealService));
  router.get(paths.homeOffice.letterSent, getDateLetterSent);
  router.post(paths.homeOffice.letterSent, postDateLetterSent(updateAppealService));
  return router;
}

export {
  getDateLetterSent,
  getHomeOfficeDetails,
  postDateLetterSent,
  postHomeOfficeDetails,
  setupHomeOfficeDetailsController
};
