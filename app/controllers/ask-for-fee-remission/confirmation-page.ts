import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import { addDaysToDate } from '../../utils/date-utils';
import { payLaterForApplicationNeeded } from '../../utils/payments-utils';

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  req.app.locals.logger.trace(`Successful AIP appeal submission for ccd id ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Confirmation appeal submission');

  try {
    const daysToWait: number = config.get('daysToWait.fromRemissionAppliedDate');
    const { application } = req.session.appeal;
    const paPayLater = payLaterForApplicationNeeded(req) && application.appealType === 'protection';
    res.render('ask-for-fee-remission/confirmation-page.njk', {
      date: addDaysToDate(daysToWait),
      paPayLater
    });
  } catch (e) {
    next(e);
  }
}

function setConfirmationRefundController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.appealSubmitted.confirmationRefund, middleware, getConfirmationPage);
  return router;
}

export {
  setConfirmationRefundController,
  getConfirmationPage
};
