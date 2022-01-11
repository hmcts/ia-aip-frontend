import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { addDaysToDate } from '../../utils/date-utils';

function getHearingRequirementsConfirmationPage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('templates/confirmation-page.njk', {
      title: i18n.pages.hearingRequirements.confirmation.title,
      whatNextListItems: i18n.pages.hearingRequirements.confirmation.whatNextListItems,
      info: i18n.pages.hearingRequirements.confirmation.info,
      date: addDaysToDate(14)
    });
  } catch (e) {
    next(e);
  }
}

function setupHearingRequirementsConfirmationPage(middleware: Middleware[]): Router {
  const router: Router = Router();
  router.get(paths.submitHearingRequirements.confirmation, middleware, getHearingRequirementsConfirmationPage);
  return router;
}

export {
  setupHearingRequirementsConfirmationPage,
  getHearingRequirementsConfirmationPage
};
