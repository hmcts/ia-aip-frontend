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
    const paPayLater = payLaterForApplicationNeeded(req);
    const paPayNow = payNowForApplicationNeeded(req) && application.appealType === 'protection';
    const eaHuEu = ['refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'].includes(application.appealType);
    const daysToWait: number = eaHuEu ? config.get('daysToWait.pendingPayment') : config.get('daysToWait.afterSubmission');
    const appealWithRemissionOption = appealHasRemissionOption(application);
    const noRemissionOption = appealHasNoRemissionOption(application);

    res.render('confirmation-page.njk', {
      date: addDaysToDate(daysToWait),
      late: isLate(),
      paPayLater,
      paPayNow,
      eaHuEu,
      appealWithRemissionOption,
      noRemissionOption
    });
  } catch (e) {
    next(e);
  }
}

function getConfirmationPaidPage(req: Request, res: Response, next: NextFunction) {
  req.app.locals.logger.trace(`Successful AIP paid after submission for ccd id ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Confirmation appeal submission');

  try {
    const { application, paAppealTypeAipPaymentOption = null } = req.session.appeal;
    const { payingImmediately = false } = req.session;
    const isLate = application.isAppealLate;
    const isPaPayNow = application.appealType === 'protection' && paAppealTypeAipPaymentOption === 'payNow';
    const isPaPayLater = application.appealType === 'protection' && paAppealTypeAipPaymentOption === 'payLater';
    const daysToWait: number = config.get('daysToWait.afterSubmission');
    const appealWithRemissionOption = appealHasRemissionOption(application);
    const noRemissionOption = appealHasNoRemissionOption(application);

    if (isPaPayLater) {
      res.render('templates/confirmation-page.njk', {
        date: addDaysToDate(daysToWait),
        title: i18n.pages.confirmationPaid.title,
        whatNextContent: i18n.pages.confirmationPaidLater.content,
        appealWithRemissionOption,
        noRemissionOption
      });
    } else if (isPaPayNow) {
      res.render('templates/confirmation-page.njk', {
        date: addDaysToDate(daysToWait),
        title: (payingImmediately && !isLate) ? i18n.pages.successPage.inTime.panel
          : (payingImmediately && isLate) ? i18n.pages.successPage.outOfTime.panel
            : i18n.pages.confirmationPaidLater.title,
        whatNextListItems: (payingImmediately && isLate) ? i18n.pages.confirmationPaid.contentLate
          : (payingImmediately && !isLate) ? i18n.pages.confirmationPaid.content
            : i18n.pages.confirmationPaidLater.content,
        thingsYouCanDoAfterPaying: i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying,
        appealWithRemissionOption,
        noRemissionOption
      });
    } else {
      res.render('templates/confirmation-page.njk', {
        date: addDaysToDate(daysToWait),
        title: isLate ? i18n.pages.successPage.outOfTime.panel : i18n.pages.successPage.inTime.panel,
        whatNextListItems: isLate ? i18n.pages.confirmationPaid.contentLate : i18n.pages.confirmationPaid.content,
        thingsYouCanDoAfterPaying: i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying,
        appealWithRemissionOption,
        noRemissionOption
      });
    }
  } catch (e) {
    next(e);
  }
}

function appealHasRemissionOption(application: AppealApplication) {
  return [
    'asylumSupportFromHo',
    'feeWaiverFromHo',
    'under18GetSupportFromLocalAuthority',
    'parentGetSupportFromLocalAuthority'
  ].includes(application.remissionOption);
}

function appealHasNoRemissionOption(application: AppealApplication) {
  return 'noneOfTheseStatements' === application.remissionOption && 'willPayForAppeal' === application.helpWithFeesOption;
}

function setConfirmationController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.appealSubmitted.confirmation, middleware, getConfirmationPage);
  router.get(paths.common.confirmationPayment, middleware, getConfirmationPaidPage);
  return router;
}

export {
  setConfirmationController,
  getConfirmationPage,
  getConfirmationPaidPage,
  appealHasRemissionOption,
  appealHasNoRemissionOption
};
