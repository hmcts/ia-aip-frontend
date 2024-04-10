import { Request } from 'express';
import { States } from '../data/states';

const EA_HU_EUSS_APPEAL_TYPES = ['refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'];

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
  const { paAppealTypeAipPaymentOption, paymentStatus } = req.session.appeal;
  const payNowProtection = appealType === 'protection' && paAppealTypeAipPaymentOption === 'payNow';
  const payNowEaHuEuss = EA_HU_EUSS_APPEAL_TYPES.includes(appealType);
  return (payNowProtection || payNowEaHuEuss) && paymentStatus !== 'Paid';
}

export function payLaterForApplicationNeeded(req: Request): boolean {
  const { appealType } = req.session.appeal.application;
  const { paAppealTypeAipPaymentOption = null, paymentStatus = null, appealStatus } = req.session.appeal;
  const payLaterProtection = appealStatus !== States.APPEAL_STARTED.id && appealType === 'protection' && paAppealTypeAipPaymentOption === 'payLater' && paymentStatus !== 'Paid';
  return payLaterProtection;
}

export function convertToAmountOfMoneyDividedBy100(amount: string): string {
  const parsedAmountValue = parseFloat(amount);
  if (isNaN(parsedAmountValue)) {
    throw new Error('Amount value is not available');
  }
  return (parsedAmountValue / 100).toString();
}
