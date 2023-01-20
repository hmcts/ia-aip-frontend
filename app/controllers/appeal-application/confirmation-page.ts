import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { addDaysToDate } from '../../utils/date-utils';
import { payLaterForApplicationNeeded, payNowForApplicationNeeded } from '../../utils/payments-utils';

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  req.app.locals.logger.trace(`Successful AIP appeal submission for ccd id ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Confirmation appeal submission');

  try {
    const { application } = req.session.appeal;
    const isLate = () => application.isAppealLate;
    const payLater = payLaterForApplicationNeeded(req);
    const payNow = payNowForApplicationNeeded(req);
    const daysToWait: number = payNow ? config.get('daysToWait.pendingPayment') : config.get('daysToWait.afterSubmission');

    res.render('confirmation-page.njk', {
      date: addDaysToDate(daysToWait),
      late: isLate(),
      payLater,
      payNow
    });
  } catch (e) {
    next(e);
  }
}

function getConfirmationPaidPage(req: Request, res: Response, next: NextFunction) {
  req.app.locals.logger.trace(`Successful AIP pay later submission for ccd id ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Confirmation appeal submission');

  try {
    const { application, paAppealTypeAipPaymentOption = null } = req.session.appeal;
    const isLate = () => application.isAppealLate;
    const payNow = ['refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'].includes(application.appealType) || paAppealTypeAipPaymentOption === 'payNow';
    const isPa = application.appealType === 'protection';
    const daysToWait: number = payNow ? config.get('daysToWait.pendingPayment') : config.get('daysToWait.afterSubmission');

    if (isPa) {
      res.render('templates/confirmation-page.njk', {
        date: addDaysToDate(daysToWait),
        title: i18n.pages.confirmationPaid.title,
        whatNextContent: i18n.pages.confirmationPaidLater.content,
      });
    } else {
      res.render('templates/confirmation-page.njk', {
        date: addDaysToDate(daysToWait),
        title: i18n.pages.confirmationPaid.title,
        whatNextListItems: isLate ? i18n.pages.confirmationPaid.contentLate : i18n.pages.confirmationPaid.content,
        thingsYouCanDoAfterPaying: i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying
      });
    }
  } catch (e) {
    next(e);
  }
}

function setConfirmationController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.appealSubmitted.confirmation, middleware, getConfirmationPage);
  router.get(paths.common.confirmationPayment, middleware, getConfirmationPaidPage);
  return router;
}

export {
  setConfirmationController,
  getConfirmationPage
};
