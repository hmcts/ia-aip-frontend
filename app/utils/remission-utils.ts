import { Request } from 'express';
import i18n from '../../locale/en.json';
import { convertToAmountOfMoneyDividedBy100 } from './payments-utils';
import { addSummaryRow } from './summary-list';

function appealHasRemissionOption(application: AppealApplication) {
  return !['noneOfTheseStatements'].includes(application.remissionOption) || 'willPayForAppeal' !== application.helpWithFeesOption;
}

function appealHasNoRemissionOption(application: AppealApplication) {
  return 'noneOfTheseStatements' === application.remissionOption && 'willPayForAppeal' === application.helpWithFeesOption;
}

function hasFeeRemissionDecision(req: Request, dlrmFeeRemissionFlag: boolean) {
  return dlrmFeeRemissionFlag && !!req.session.appeal.application.remissionDecision;
}

function getFeeSupportStatusForAppealDetails(req: Request, dlrmFeeRemissionFlag: boolean) {
  if (hasFeeRemissionDecision(req, dlrmFeeRemissionFlag)) {
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

function getDecisionReasonRowForAppealDetails(req: Request) {
  const remissionDecision = req.session.appeal.application.remissionDecision;
  switch (remissionDecision) {
    case 'partiallyApproved':
      const amountLeftToPay = convertToAmountOfMoneyDividedBy100(req.session.appeal.application.amountLeftToPay);
      return [
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.reasonForDecision,
          [i18n.pages.overviewPage.doThisNext.remissionDecided.partiallyApprovedDecisionReason
            .replace('{{ feeLeftToPay }}', amountLeftToPay)], null),
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.feeToPay, ['£' + amountLeftToPay], null)
      ];
    case 'rejected':
      return [
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.reasonForDecision,
          [i18n.pages.overviewPage.doThisNext.remissionDecided.refusedDecisionReason], null)
      ];
  }
}

export {
  appealHasRemissionOption,
  appealHasNoRemissionOption,
  hasFeeRemissionDecision,
  getFeeSupportStatusForAppealDetails,
  getDecisionReasonRowForAppealDetails
};
