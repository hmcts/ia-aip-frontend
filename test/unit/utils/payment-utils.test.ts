import { expect } from 'chai';
import { Request } from 'express';
import {
  convertToAmountOfMoneyDividedBy100,
  getFee,
  payLaterForApplicationNeeded,
  payNowForApplicationNeeded
} from '../../../app/utils/payments-utils';
import { sinon } from '../../utils/testUtils';

describe('payment-utils', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      cookies: {},
      session: {
        appeal: {
          'appealStatus': 'appealSubmitted',
          'paymentStatus': 'NotPaid',
          'application': {
            'appealType': 'protection',
            'decisionHearingFeeOption': 'decisionWithHearing'
          },
          'paAppealTypeAipPaymentOption': 'payNow',
          'feeWithHearing': '140',
          'feeCode': 'FEE0238',
          'feeVersion': '2'
        }
      }
    } as Partial<Request>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getFee', () => {
    it('should return correct appeal fee information', () => {
      const result = getFee(req.session.appeal);

      expect(result).to.eql(
        {
          calculated_amount: '140',
          code: 'FEE0238',
          version: '2'
        }
      );
    });
    it('should throw error when fee is not provided', () => {
      const application = {
        ...req.session.appeal.application,
        decisionHearingFeeOption: 'decisionWithoutHearing'
      };
      req.session.appeal.application = {
        ...application
      };

      expect(() => {
        getFee(req.session.appeal);
      }).to.throw('Fee is not available');
    });
  });

  describe('payNowForApplicationNeeded', () => {
    it('should return payNow = true for protection appeal when paAppealTypeAipPaymentOption is payNow', () => {
      const payNow = payNowForApplicationNeeded(req as Request);

      expect(payNow).to.eql(true);
    });
    it('should return payNow = false for protection appeal when paAppealTypeAipPaymentOption is not payNow', () => {
      req.session.appeal.paAppealTypeAipPaymentOption = 'payLater';
      const payNow = payNowForApplicationNeeded(req as Request);

      expect(payNow).to.eql(false);
    });
    it('should return payNow = true for refusalOfHumanRights or refusalOfEu or euSettlementScheme appeals', () => {
      let payNow = true;
      ['refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'].forEach(appealTye => {
        req.session.appeal.application.appealType = appealTye;
        payNow = payNow && payNowForApplicationNeeded(req as Request);
      });

      expect(payNow).to.eql(true);
    });
  });

  describe('payLaterForApplicationNeeded', () => {
    it('should return payLater = true for protection appeal when paAppealTypeAipPaymentOption is payLater and appeal status is not appealStarted and payment status is not Paid', () => {
      req.session.appeal.paAppealTypeAipPaymentOption = 'payLater';
      const payLater = payLaterForApplicationNeeded(req as Request);

      expect(payLater).to.eql(true);
    });
    it('should return payLater = false for protection appeal when paAppealTypeAipPaymentOption is payNow', () => {
      const payLater = payLaterForApplicationNeeded(req as Request);

      expect(payLater).to.eql(false);
    });
    it('should return payLater = false for refusalOfHumanRights or refusalOfEu or euSettlementScheme appeals when appeal status is paymentPending', () => {
      req.session.appeal.appealStatus = 'pendingPayment';
      let payLater: boolean;
      ['refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'].forEach(appealTye => {
        req.session.appeal.application.appealType = appealTye;
        payLater = payLaterForApplicationNeeded(req as Request);
      });

      expect(payLater).to.eql(false);
    });
    it('should return payLater = false for refusalOfHumanRights or refusalOfEu or euSettlementScheme appeals when appeal status is not paymentPending', () => {
      let payLater = true;
      ['refusalOfHumanRights', 'refusalOfEu', 'euSettlementScheme'].forEach(appealTye => {
        req.session.appeal.application.appealType = appealTye;
        payLater = payLater && payLaterForApplicationNeeded(req as Request);
      });

      expect(payLater).to.eql(false);
    });
  });

  describe('convertToAmountOfMoneyDividedBy100', () => {
    it('should return correct converted amount of money', () => {
      expect(convertToAmountOfMoneyDividedBy100('4000')).to.eql('40');
    });

    it('should throw an error for invalid input', () => {
      expect(() => convertToAmountOfMoneyDividedBy100('invalid')).to.throw('Amount value is not available');
    });
  });
});
