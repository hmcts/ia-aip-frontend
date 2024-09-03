import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
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
      appealWithRemissionOption
    });
  } catch (e) {
    next(e);
  }
}

function getConfirmationPaidPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.app.locals.logger.trace(`Successful AIP paid after submission for ccd id ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Confirmation appeal submission');

    try {
      const { application, paAppealTypeAipPaymentOption = null } = req.session.appeal;
      const { payingImmediately = false } = req.session;
      const isLate = application.isAppealLate;
      const isPaPayNow = application.appealType === 'protection' && paAppealTypeAipPaymentOption === 'payNow';
      const isPaPayLater = application.appealType === 'protection' && paAppealTypeAipPaymentOption === 'payLater';
      const daysToWait: number = config.get('daysToWait.afterSubmission');
      const appealWithRemissionOption = appealHasRemissionOption(application);

      if (isPaPayLater) {
        await updateRefundConfirmationAppliedStatus(req, updateAppealService);
        res.render('templates/confirmation-page.njk', {
          date: addDaysToDate(daysToWait),
          title: i18n.pages.confirmationPaid.title,
          whatNextContent: i18n.pages.confirmationPaidLater.content,
          appealWithRemissionOption
        });
      } else if (isPaPayNow) {
        res.render('templates/confirmation-page.njk', {
          date: addDaysToDate(daysToWait),
          title: getPaPayNowTitle(payingImmediately, isLate),
          whatNextListItems: getPaPayNowWhatNextItems(payingImmediately, isLate),
          thingsYouCanDoAfterPaying: i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying,
          appealWithRemissionOption
        });
      } else {
        res.render('templates/confirmation-page.njk', {
          date: addDaysToDate(daysToWait),
          title: isLate ? i18n.pages.successPage.outOfTime.panel : i18n.pages.successPage.inTime.panel,
          whatNextListItems: isLate ? i18n.pages.confirmationPaid.contentLate : i18n.pages.confirmationPaid.content,
          thingsYouCanDoAfterPaying: i18n.pages.confirmationPaid.thingsYouCanDoAfterPaying,
          appealWithRemissionOption
        });
      }
    } catch (e) {
      next(e);
    }
  };
}

async function updateRefundConfirmationAppliedStatus(req: Request, updateAppealService: UpdateAppealService) {
  const event = req.session.appeal.appealStatus === 'appealStarted' ? Events.EDIT_APPEAL : Events.PAYMENT_APPEAL;

  const appeal: Appeal = {
    ...req.session.appeal,
    application: {
      ...req.session.appeal.application,
      refundConfirmationApplied: false
    }
  };

  const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(event, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], true);
  req.session.appeal = {
    ...req.session.appeal,
    ...appealUpdated
  };
}

function setConfirmationController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealSubmitted.confirmation, middleware, getConfirmationPage);
  router.get(paths.common.confirmationPayment, middleware, getConfirmationPaidPage(updateAppealService));
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
  getConfirmationPaidPage,
  updateRefundConfirmationAppliedStatus
};
