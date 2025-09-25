import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import i18n from '../../../locale/en.json';
import { countryList } from '../../data/country-list';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { getNationalitiesOptions } from '../../utils/nationalities';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import {
  appellantNamesValidation,
  dateLetterReceivedValidation,
  dateLetterSentValidation,
  dateOfBirthValidation,
  homeOfficeNumberValidation,
  nationalityValidation
} from '../../utils/validations/fields-validations';

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
          homeOfficeRefNumber: req.body.homeOfficeRefNumber
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.name);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getNamePage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const personalDetails = req.session.appeal.application.personalDetails || null;
    const outsideUkWhenApplicationMade: boolean = (req.session.appeal.application.outsideUkWhenApplicationMade === 'Yes') || false;
    const previousPage = outsideUkWhenApplicationMade ? paths.appealStarted.gwfReference : paths.appealStarted.details;
    return res.render('appeal-application/personal-details/name.njk', {
      personalDetails,
      previousPage
    });
  } catch (e) {
    next(e);
  }
}

function postNamePage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'familyName', 'givenNames')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = appellantNamesValidation(req.body);
      if (validation) {
        const outsideUkWhenApplicationMade: boolean = (req.session.appeal.application.outsideUkWhenApplicationMade === 'Yes') || false;
        let previousPage = outsideUkWhenApplicationMade ? paths.appealStarted.gwfReference : paths.appealStarted.details;
        return res.render('appeal-application/personal-details/name.njk', {
          personalDetails: {
            familyName: req.body.familyName,
            givenNames: req.body.givenNames
          },
          error: validation,
          errorList: Object.values(validation),
          previousPage
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          personalDetails: {
            ...req.session.appeal.application.personalDetails,
            familyName: req.body.familyName,
            givenNames: req.body.givenNames
          }
        }
      };

      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.dob);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getDateOfBirthPage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { application } = req.session.appeal;
    const dob = application.personalDetails && application.personalDetails.dob || null;
    return res.render('appeal-application/personal-details/date-of-birth.njk', {
      dob,
      previousPage: paths.appealStarted.name
    });
  } catch (e) {
    next(e);
  }
}

function postDateOfBirth(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'day', 'month', 'year')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = dateOfBirthValidation(req.body);
      if (validation != null) {
        return res.render('appeal-application/personal-details/date-of-birth.njk', {
          errors: validation,
          errorList: Object.values(validation),
          dob: { ...req.body },
          previousPage: paths.appealStarted.name
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          personalDetails: {
            ...req.session.appeal.application.personalDetails,
            dob: {
              day: req.body.day,
              month: req.body.month,
              year: req.body.year
            }
          }
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.nationality);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getNationalityPage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { application } = req.session.appeal;
    const stateless = application.personalDetails.stateless;
    const nationality = application.personalDetails && application.personalDetails.nationality || null;
    const nationalitiesOptions = getNationalitiesOptions(countryList, nationality, i18n.pages.nationality.defaultNationality);
    return res.render('appeal-application/personal-details/nationality.njk', {
      stateless,
      nationalitiesOptions,
      previousPage: paths.appealStarted.dob
    });
  } catch (e) {
    next(e);
  }
}

function postNationalityPage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'nationality', 'stateless')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = nationalityValidation(req.body);
      if (validation) {
        const nationality = req.body.nationality;
        const nationalitiesOptions = getNationalitiesOptions(countryList, nationality, i18n.pages.nationality.defaultNationality);
        return res.render('appeal-application/personal-details/nationality.njk', {
          nationalitiesOptions,
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.dob
        });
      }
      const { application } = req.session.appeal;
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          personalDetails: {
            ...req.session.appeal.application.personalDetails,
            nationality: req.body.nationality || null,
            stateless: req.body.stateless || 'hasNationality'
          }
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      if (['Yes'].includes(appeal.application.appellantInUk)) return res.redirect(paths.appealStarted.letterSent);
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.letterReceived);
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
      previousPage: paths.appealStarted.nationality
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
          previousPage: paths.appealStarted.nationality
        });
      }

      let appealOutOfCountry = req.session.appeal.appealOutOfCountry;
      let noOfDays = (appealOutOfCountry && appealOutOfCountry === 'Yes') ? 28 : 14;
      const { day, month, year } = req.body;
      const diffInDays = moment().diff(moment(`${year} ${month} ${day}`, 'YYYY MM DD'), 'days');
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: diffInDays <= noOfDays ? false : true,
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
      let defaultRedirect = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.homeOfficeDecisionLetter);
      return res.redirect(defaultRedirect);
    } catch (e) {
      next(e);
    }
  };
}

function getDateLetterReceived(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { decisionLetterReceivedDate } = req.session.appeal.application;
    res.render('appeal-application/home-office/letter-received.njk', {
      decisionLetterReceivedDate,
      previousPage: paths.appealStarted.nationality
    });
  } catch (e) {
    next(e);
  }
}

function postDateLetterReceived(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'day', 'month', 'year')) { return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved'); }
      const validation = dateLetterReceivedValidation(req.body);
      if (validation) {
        return res.render('appeal-application/home-office/letter-received.njk', {
          error: validation,
          errorList: Object.values(validation),
          decisionLetterReceivedDate: {
            ...req.body
          },
          previousPage: paths.appealStarted.nationality
        });
      }

      let appealOutOfCountry = req.session.appeal.appealOutOfCountry;
      let noOfDays = (appealOutOfCountry && appealOutOfCountry === 'No') ? 14 : 28;
      const { day, month, year } = req.body;
      const diffInDays = moment().diff(moment(`${year} ${month} ${day}`, 'YYYY MM DD'), 'days');
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: diffInDays <= noOfDays ? false : true,
          decisionLetterReceivedDate: {
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
  router.get(paths.appealStarted.name, middleware, getNamePage);
  router.post(paths.appealStarted.name, middleware, postNamePage(updateAppealService));
  router.get(paths.appealStarted.dob, middleware, getDateOfBirthPage);
  router.post(paths.appealStarted.dob, middleware, postDateOfBirth(updateAppealService));
  router.get(paths.appealStarted.nationality, middleware, getNationalityPage);
  router.post(paths.appealStarted.nationality, middleware, postNationalityPage(updateAppealService));
  router.get(paths.appealStarted.letterSent, middleware, getDateLetterSent);
  router.post(paths.appealStarted.letterSent, middleware, postDateLetterSent(updateAppealService));
  router.get(paths.appealStarted.letterReceived, middleware, getDateLetterReceived);
  router.post(paths.appealStarted.letterReceived, middleware, postDateLetterReceived(updateAppealService));
  return router;
}

export {
  getDateLetterSent,
  getHomeOfficeDetails,
  getNamePage,
  postNamePage,
  getDateOfBirthPage,
  postDateOfBirth,
  postNationalityPage,
  getNationalityPage,
  postDateLetterSent,
  postHomeOfficeDetails,
  getDateLetterReceived,
  postDateLetterReceived,
  setupHomeOfficeDetailsController
};
