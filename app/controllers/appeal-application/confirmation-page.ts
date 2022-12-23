import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { addDaysToDate } from '../../utils/date-utils';
import { payLaterForApplicationNeeded } from '../../utils/payments-utils';

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  req.app.locals.logger.trace(`Successful AIP appeal submission for ccd id ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Confirmation appeal submission');

  try {
    const { application } = req.session.appeal;
    const isLate = () => application.isAppealLate;
    const payLater = payLaterForApplicationNeeded(req);
    const payLaterEaEuHuAppeal = payLater && application.appealType !== 'protection';
    const daysToWait: number = payLaterEaEuHuAppeal ? config.get('daysToWait.pendingPayment') : config.get('daysToWait.afterSubmission');

    res.render('confirmation-page.njk', {
      date: addDaysToDate(daysToWait),
      late: isLate(),
      payLater,
      payLaterEaEuHuAppeal
    });
  } catch (e) {
    next(e);
  }
}

function getConfirmationPayLaterPage(req: Request, res: Response, next: NextFunction) {
  req.app.locals.logger.trace(`Successful AIP pay later submission for ccd id ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Confirmation appeal submission');

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
