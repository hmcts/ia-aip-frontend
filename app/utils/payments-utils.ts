import { Request } from 'express';
import { States } from '../data/states';
import Logger, { getLogLabel } from './logger';

const EA_HU_EUSS_APPEAL_TYPES = ['refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'];

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

export function getFee(appeal: Appeal) {
  logger.trace('getFee', logLabel);
  const { decisionHearingFeeOption } = appeal.application;
  logger.trace(decisionHearingFeeOption, logLabel);
  const { feeWithHearing = null, feeWithoutHearing = null } = appeal;
  logger.trace(feeWithHearing, logLabel);
  logger.trace(feeWithoutHearing, logLabel);
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
