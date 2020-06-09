import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { addDaysToDate } from '../../utils/date-utils';

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('templates/confirmation-page.njk', {
      title: i18n.pages.cmaRequirementsConfirmation.title,
      whatNextListItems: i18n.pages.cmaRequirementsConfirmation.whatNextListItems,
      date: addDaysToDate(14)
    });
  } catch (e) {
    next(e);
  }
}

function setupCmaRequirementsConfirmationPage(middleware: Middleware[]): Router {
  const router: Router = Router();
  router.get(paths.cmaRequirementsSubmitted.confirmation, middleware, getConfirmationPage);
  return router;
}

export {
  getConfirmationPage,
  setupCmaRequirementsConfirmationPage
};
