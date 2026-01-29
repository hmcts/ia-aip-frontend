import type { Request } from 'express-serve-static-core';
import i18n from '../../locale/en.json';
import { Events } from '../data/events';
import { convertToAmountOfMoneyDividedBy100 } from './payments-utils';
import { addSummaryRow } from './summary-list';

function appealHasRemissionOption(application: AppealApplication, checkHelpWithFeesReferenceNumber: boolean = false) {
  let hasHwfNumber: boolean = checkHelpWithFeesReferenceNumber
    ? !!(application.helpWithFeesRefNumber || application.helpWithFeesReferenceNumber) : !!(application.helpWithFeesRefNumber);

  return ['asylumSupportFromHo', 'feeWaiverFromHo', 'under18GetSupportFromLocalAuthority', 'parentGetSupportFromLocalAuthority']
      .includes(application.remissionOption)
    || ['noneOfTheseStatements', 'iWantToGetHelpWithFees'].includes(application.remissionOption)
    && ['wantToApply', 'alreadyApplied'].includes(application.helpWithFeesOption)
    && hasHwfNumber;
}

function appealHasRemissionType(application: AppealApplication) {
  if (application.remissionType === 'hoWaiverRemission') {
    return appealHasRemissionClaim(application);
  }
  return ['helpWithFees', 'exceptionalCircumstancesRemission'].includes(application.remissionType);
}

function appealHasRemissionClaim(application: AppealApplication) {
  return ['asylumSupport','legalAid','section17','section20','homeOfficeWaiver']
    .includes(application.remissionClaim);
}

function appealHasNoRemissionOption(application: AppealApplication) {
  return 'noneOfTheseStatements' === application.remissionOption && 'willPayForAppeal' === application.helpWithFeesOption;
}

function hasFeeRemissionDecision(req: Request<Params>) {
  return !!req.session.appeal.application.remissionDecision;
}

function getFeeSupportStatusForAppealDetails(req: Request<Params>) {
  if (hasFeeRemissionDecision(req)) {
    const remissionDecision = req.session.appeal.application.remissionDecision;
    switch (remissionDecision) {
      case 'approved':
        return i18n.pages.overviewPage.doThisNext.remissionDecided.feeSupportStatusApproved;
      case 'partiallyApproved':
        return i18n.pages.overviewPage.doThisNext.remissionDecided.feeSupportStatusPartiallyApproved;
      case 'rejected':
        return i18n.pages.overviewPage.doThisNext.remissionDecided.feeSupportStatusRefused;
    }
  } else {
    return i18n.pages.overviewPage.doThisNext.remissionDecided.feeSupportRequested;
  }
}

function getDecisionReasonRowForAppealDetails(req: Request<Params>) {
  const remissionDecision = req.session.appeal.application.remissionDecision;
  const remissionDecisionReason = req.session.appeal.application.remissionDecisionReason;
  switch (remissionDecision) {
    case 'approved':
      return [];
    case 'partiallyApproved':
      const amountLeftToPay = convertToAmountOfMoneyDividedBy100(req.session.appeal.application.amountLeftToPay);
      return [
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.reasonForDecision,
          [remissionDecisionReason], null),
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.feeToPay, ['£' + amountLeftToPay], null)
      ];
    case 'rejected':
      return [
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.reasonForDecision,
          [remissionDecisionReason], null)
      ];
    default:
      return [];
  }
}

function getPaymentStatusRow(req: Request<Params>) {
  const { paymentStatus = null } = req.session.appeal;
  const { application } = req.session.appeal;
  const { remissionDecision, isLateRemissionRequest } = application;

  if (!hasFeeRemissionDecision(req)) {
    return paymentStatus;
  }

  if (isLateRemissionRequest) {
    return ['approved', 'partiallyApproved'].includes(remissionDecision) ? 'To be refunded' : paymentStatus;
  } else {
    if (paymentForAppealHasBeenMade(req) && paymentStatus === 'Paid') {
      return paymentStatus;
    } else {
      switch (remissionDecision) {
        case 'approved':
          return i18n.pages.overviewPage.doThisNext.remissionDecided.paymentPending.decisionApprovedPaymentStatus;
        case 'partiallyApproved':
          return i18n.pages.overviewPage.doThisNext.remissionDecided.paymentPending.decisionPartiallyApprovedPaymentStatus;
        case 'rejected':
          return i18n.pages.overviewPage.doThisNext.remissionDecided.paymentPending.decisionRejectedPaymentStatus;
      }
    }
  }
}

/* An appeal can be created with options such as 'Fee Remission' and 'Pay Later'.
Following submission, remission can be decided.
In such cases, the payment status changed to 'PAID' automatically without the occurrence of a payment event.
This function verifies whether a payment event has been triggered or not. */
function paymentForAppealHasBeenMade(req: Request<Params>) {
  return req.session.appeal.history
    && req.session.appeal.history.some(history => [Events.PAYMENT_APPEAL.id, Events.MARK_APPEAL_PAID.id].includes(history.id));
}

export {
  appealHasRemissionOption,
  appealHasNoRemissionOption,
  hasFeeRemissionDecision,
  getFeeSupportStatusForAppealDetails,
  getDecisionReasonRowForAppealDetails,
  getPaymentStatusRow,
  paymentForAppealHasBeenMade,
  appealHasRemissionType
};
