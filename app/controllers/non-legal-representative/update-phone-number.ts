import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { nonLegalRepPhoneNumberValidation } from '../../utils/validations/fields-validations';

function getUpdatePhoneNumber(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('non-legal-rep/update-phone-number.njk', {
      previousPage: paths.common.overview
    });
  } catch (error) {
    next(error);
  }
}

function postUpdatePhoneNumber(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = nonLegalRepPhoneNumberValidation(req.body);
      if (validation) {
        return res.render('non-legal-rep/update-phone-number.njk', {
          nlrPhoneNumber: req.body.phoneNumber,
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.common.overview
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        nlrDetails: {
          ...req.session.appeal?.nlrDetails,
          phoneNumber: req.body.phoneNumber
        }
      };

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.NLR_PHONE_NUMBER_SUBMITTED, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      return res.redirect(paths.nonLegalRep.updatePhoneNumberConfirmation);
    } catch (error) {
      next(error);
    }
  };
}

function getUpdatePhoneNumberConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('templates/confirmation-page.njk', {
      title: i18n.pages.updatePhoneNumber.confirmation.title,
      whatNextListItems: i18n.pages.updatePhoneNumber.confirmation.whatNextListItems
    });
  } catch (e) {
    next(e);
  }
}

function setupNlrUpdatePhoneNumberControllers(middleware: Middleware[], updateAppealService: UpdateAppealService,): Router {
  const router = Router();
  router.get(paths.nonLegalRep.updatePhoneNumber, middleware, getUpdatePhoneNumber);
  router.post(paths.nonLegalRep.updatePhoneNumber, middleware, postUpdatePhoneNumber(updateAppealService));
  router.get(paths.nonLegalRep.updatePhoneNumberConfirmation, middleware, getUpdatePhoneNumberConfirmation);
  return router;
}

export {
  setupNlrUpdatePhoneNumberControllers,
  getUpdatePhoneNumber,
  postUpdatePhoneNumber,
  getUpdatePhoneNumberConfirmation
};
