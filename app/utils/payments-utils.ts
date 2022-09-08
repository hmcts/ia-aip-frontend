import { Request } from 'express';

export function getFee(appeal: Appeal) {
  const { decisionHearingFeeOption } = appeal.application;
  const { feeWithHearing = null, feeWithoutHearing = null } = appeal;
  const fee = decisionHearingFeeOption === 'decisionWithHearing' ? feeWithHearing : feeWithoutHearing;
  if (fee) {
    return {
      calculated_amount: fee,
      code: appeal.feeCode,
      version: appeal.feeVersion
    };
  }
  throw new Error('Fee is not available');
}

export function payNowForApplicationNeeded(req: Request): boolean {
  const { appealType } = req.session.appeal.application;
  const { paAppealTypeAipPaymentOption } = req.session.appeal;
  let payNow = false;
  payNow = payNow || appealType === 'protection' && paAppealTypeAipPaymentOption === 'payNow';
  payNow = payNow || ['refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'].includes(appealType);
  return payNow;
}

export function payLaterForApplicationNeeded(req: Request): boolean {
  const { appealType } = req.session.appeal.application;
  const { paAppealTypeAipPaymentOption = null, paymentStatus = null, appealStatus } = req.session.appeal;
  const payLater = appealStatus !== 'appealStarted' && appealType === 'protection' && paAppealTypeAipPaymentOption === 'payLater' && paymentStatus !== 'Paid';
  return payLater;
}

export function appendCaseReferenceAndAppellantName(caseReference: String, appellantSurnameName: String) {
  return caseReference + '_' + appellantSurnameName;
}
