import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { addDaysToDate } from '../../utils/date-utils';

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('templates/confirmation-page.njk', {
      title: i18n.pages.clarifyingQuestionsCYA.title,
      whatNextListItems: i18n.pages.clarifyingQuestionsCYA.whatNextListItems,
      date: addDaysToDate(7)
    });
  } catch (e) {
    next(e);
  }
}

function setupClarifyingQuestionsConfirmationPage(middleware: Middleware[]): Router {
  const router: Router = Router();
  router.get(paths.common.clarifyingQuestionsAnswersSentConfirmation, middleware, getConfirmationPage);
  return router;
}

export {
  getConfirmationPage,
  setupClarifyingQuestionsConfirmationPage
};
