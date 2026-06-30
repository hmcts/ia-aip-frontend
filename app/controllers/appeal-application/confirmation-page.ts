import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { addDaysToDate } from '../../utils/date-utils';
import { payLaterForApplicationNeeded, payNowForApplicationNeeded } from '../../utils/payments-utils';
import { appealHasRemissionOption } from '../../utils/remission-utils';

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  req.app.locals.logger.trace(`Successful AIP appeal submission for ccd id ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Confirmation appeal submission');
  try {
    const { application } = req.session.appeal;
    const isLate = () => application.isAppealLate;
    const isOutOfCountry = () => req.session.appeal.appealOutOfCountry === 'Yes';
    const paPayLater = payLaterForApplicationNeeded(req);
    const paPayNow = payNowForApplicationNeeded(req) && application.appealType === 'protection';
    const eaHuEu = ['refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'].includes(application.appealType);
    const daysToWait: number = eaHuEu ? config.get('daysToWait.pendingPayment') : config.get('daysToWait.afterSubmission');
    const daysToWaitOOC: number = isOutOfCountry() ? config.get('daysToWait.outOfCountry') : config.get('daysToWait.afterReasonsForAppeal');
    const appealWithRemissionOption = appealHasRemissionOption(application);
    res.render('confirmation-page.njk', {
      date: addDaysToDate(daysToWait),
      dateOutOfCountryAppeal: addDaysToDate(daysToWaitOOC),
      late: isLate(),
      paPayLater,
      paPayNow,
      eaHuEu,
      appealWithRemissionOption,
      hasNlr: req.session.appeal?.application?.hasNonLegalRep === 'Yes'
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
    const renderObj: any = {
      date: addDaysToDate(daysToWait),
      appealWithRemissionOption
    };
    if (isPaPayLater) {
      renderObj.title = i18n.pages.confirmationPaid.title;
      renderObj.whatNextContent = i18n.pages.confirmationPaidLater.content;
    } else if (isPaPayNow) {
      renderObj.title = getPaPayNowTitle(payingImmediately, isLate);
      renderObj.whatNextListItems = getPaPayNowWhatNextItems(payingImmediately, isLate);
      if (req.session.appeal?.application?.hasNonLegalRep === 'Yes') {
        renderObj.whatNextListItems
          .push(...i18n.pages.successPage.submittedWithNlr);
      }
      renderObj.thingsYouCanDoAfterPaying = i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying;
    } else {
      renderObj.title = isLate ? i18n.pages.successPage.outOfTime.panel : i18n.pages.successPage.inTime.panel;
      renderObj.whatNextListItems = isLate ? i18n.pages.confirmationPaid.contentLate : i18n.pages.confirmationPaid.content;
      if (req.session.appeal?.application?.hasNonLegalRep === 'Yes') {
        renderObj.whatNextListItems
          .push(...i18n.pages.successPage.submittedWithNlr);
      }
      renderObj.thingsYouCanDoAfterPaying = i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying;
    }

    res.render('templates/confirmation-page.njk', renderObj);
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

function getPaPayNowTitle(payingImmediately: boolean, isLate: boolean) {
  return payingImmediately
    ? (isLate ? i18n.pages.successPage.outOfTime.panel : i18n.pages.successPage.inTime.panel)
    : i18n.pages.confirmationPaidLater.title;
}

function getPaPayNowWhatNextItems(payingImmediately: boolean, isLate: boolean) {
  return payingImmediately
    ? (isLate ? i18n.pages.confirmationPaid.contentLate : i18n.pages.confirmationPaid.content)
    : i18n.pages.confirmationPaidLater.content;
}

export {
  setConfirmationController,
  getConfirmationPage,
  getConfirmationPaidPage
};
