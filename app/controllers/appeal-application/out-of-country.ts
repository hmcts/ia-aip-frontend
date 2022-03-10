import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { appellantInUkValidation, dateLeftUkValidation, gwfReferenceNumberValidation, oocHrEeaValidation } from '../../utils/validations/fields-validations';

async function getAppellantInUk(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const answer = req.session.appeal.application.appellantInUk;

    return res.render('appeal-application/appeal-out-of-country.njk', {
      question: i18n.pages.OOC.title,
      description: undefined,
      modal: undefined,
      questionId: undefined,
      previousPage: paths.appealStarted.taskList,
      answer: answer,
      errors: undefined,
      errorList: undefined
    });
  } catch (error) {
    next(error);
  }
}

function postAppellantInUk(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = appellantInUkValidation(req.body);

      if (validation) {
        return res.render('appeal-application/appeal-out-of-country.njk', {
          question: i18n.pages.OOC.title,
          description: undefined,
          modal: undefined,
          questionId: undefined,
          previousPage: paths.appealStarted.typeOfAppeal,
          answer: undefined,
          errors: validation,
          errorList: Object.values(validation)
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          appellantInUk: req.body['answer']
        }
      };

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], false);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      let redirectPage = paths.appealStarted.typeOfAppeal;

      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function getOocHrInside(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { dateClientLeaveUk } = req.session.appeal.application;
    res.render('appeal-application/out-of-country/hr-inside.njk', {
      dateClientLeaveUk,
      previousPage: paths.appealStarted.oocHrEea
    });
  } catch (e) {
    next(e);
  }
}

function postOocHrInside(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'day', 'month', 'year')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = dateLeftUkValidation(req.body);
      if (validation) {
        return res.render('appeal-application/out-of-country/hr-inside.njk', {
          error: validation,
          errorList: Object.values(validation),
          dateClientLeaveUk: {
            ...req.body
          },
          previousPage: paths.appealStarted.oocHrEea
        });
      }

      const { day, month, year } = req.body;
      const diffInDays = moment().diff(moment(`${year} ${month} ${day}`, 'YYYY MM DD'), 'days');
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          dateClientLeaveUk: {
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

      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.taskList);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getGwfReference(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { gwfReferenceNumber } = req.session.appeal.application || null;
    res.render('appeal-application/out-of-country/gwf-reference.njk', {
      gwfReferenceNumber,
      previousPage: paths.appealStarted.taskList
    });
  } catch (e) {
    next(e);
  }
}

function postGwfReference(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'gwfReferenceNumber')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview);
      }
      const validation = gwfReferenceNumberValidation(req.body);
      if (validation) {
        return res.render('appeal-application/out-of-country/gwf-reference.njk',
          {
            errors: validation,
            errorList: Object.values(validation),
            gwfReferenceNumber: req.body.gwfReferenceNumber,
            previousPage: paths.appealStarted.taskList
          }
        );
      }
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          gwfReferenceNumber: req.body.gwfReferenceNumber
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.letterReceived);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

async function getOocHrEea(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const answer = req.session.appeal.application.outsideUkWhenApplicationMade;

    return res.render('appeal-application/out-of-country/hr-eea.njk', {
      question: i18n.pages.EEA.title,
      description: undefined,
      modal: undefined,
      questionId: undefined,
      previousPage: paths.appealStarted.typeOfAppeal,
      answer: answer,
      errors: undefined,
      errorList: undefined
    });
  } catch (error) {
    next(error);
  }
}

function postOocHrEea(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = oocHrEeaValidation(req.body);

      if (validation) {
        return res.render('appeal-application/out-of-country/ooc-protection-departure-date.njk', {
          question: i18n.pages.EEA.title,
          description: undefined,
          modal: undefined,
          questionId: undefined,
          previousPage: paths.appealStarted.typeOfAppeal,
          answer: undefined,
          errors: validation,
          errorList: Object.values(validation)
        });
      }

      const answer: string = req.body['answer'];
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          outsideUkWhenApplicationMade: answer
        }
      };

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], false);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      const refusalOfHumanRights: boolean = (req.session.appeal.application.appealType === 'refusalOfHumanRights');
      const outsideUkWhenApplicationMade: boolean = (req.body['answer'] === 'Yes') || false;
      let editingModeRedirect = paths.appealStarted.checkAndSend;
      let redirectPage = (!outsideUkWhenApplicationMade && refusalOfHumanRights) ? paths.appealStarted.oocHrInside : paths.appealStarted.taskList;
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function getOocProtectionDepartureDate(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { dateClientLeaveUk } = req.session.appeal.application;
    res.render('appeal-application/out-of-country/ooc-protection-departure-date.njk', {
      dateClientLeaveUk,
      previousPage: paths.appealStarted.typeOfAppeal
    });
  } catch (e) {
    next(e);
  }
}

function postOocProtectionDepartureDate(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'day', 'month', 'year')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = dateLeftUkValidation(req.body);
      if (validation) {
        return res.render('appeal-application/out-of-country/hr-inside.njk', {
          error: validation,
          errorList: Object.values(validation),
          dateClientLeaveUk: {
            ...req.body
          },
          previousPage: paths.appealStarted.typeOfAppeal
        });
      }

      const { day, month, year } = req.body;
      const diffInDays = moment().diff(moment(`${year} ${month} ${day}`, 'YYYY MM DD'), 'days');
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          dateClientLeaveUk: {
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

      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.taskList);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function setupOutOfCountryController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.appealOutOfCountry, middleware, getAppellantInUk);
  router.post(paths.appealStarted.appealOutOfCountry, middleware, postAppellantInUk(updateAppealService));
  router.get(paths.appealStarted.oocHrInside, middleware, getOocHrInside);
  router.post(paths.appealStarted.oocHrInside, middleware, postOocHrInside(updateAppealService));
  router.get(paths.appealStarted.gwfReference, middleware, getGwfReference);
  router.post(paths.appealStarted.gwfReference, middleware, postGwfReference(updateAppealService));
  router.get(paths.appealStarted.oocHrEea, middleware, getOocHrEea);
  router.post(paths.appealStarted.oocHrEea, middleware, postOocHrEea(updateAppealService));
  router.get(paths.appealStarted.oocProtectionDepartureDate, middleware, getOocProtectionDepartureDate);
  router.post(paths.appealStarted.oocProtectionDepartureDate, middleware, postOocProtectionDepartureDate(updateAppealService));
  return router;
}

export {
  getAppellantInUk,
  postAppellantInUk,
  getOocHrInside,
  getGwfReference,
  setupOutOfCountryController
};
