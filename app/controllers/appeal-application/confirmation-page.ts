import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { addDaysToDate } from '../../utils/date-utils';

const daysToWaitAfterSubmission: number = config.get('daysToWait.afterSubmission');

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  req.app.locals.logger.trace(`Successful appeal submission ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Confirmation appeal submission');

  try {
    const { application, paAppealTypeAipPaymentOption = null } = req.session.appeal;
    const isLate = () => application.isAppealLate;
    const payLater = paAppealTypeAipPaymentOption === 'payLater';

    res.render('confirmation-page.njk', {
      date: addDaysToDate(daysToWaitAfterSubmission),
      late: isLate(),
      payLater
    });
  } catch (e) {
    next(e);
  }
}

function getConfirmationPayLaterPage(req: Request, res: Response, next: NextFunction) {
  req.app.locals.logger.trace(`Successful pay later submission ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Confirmation appeal submission');

  try {
    res.render('templates/confirmation-page.njk', {
      title: i18n.pages.confirmationPayLater.title,
      whatNextContent: i18n.pages.confirmationPayLater.content
    });
  } catch (e) {
    next(e);
  }
}

function setConfirmationController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.appealSubmitted.confirmation, middleware, getConfirmationPage);
  router.get(paths.common.confirmationPayLater, middleware, getConfirmationPayLaterPage);
  return router;
}

export {
  setConfirmationController,
  getConfirmationPage
};
