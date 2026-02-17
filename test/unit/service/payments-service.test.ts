import { Request, Response } from 'express';
import { any } from 'joi';
import * as paymentsApi from '../../../app/api/payments-api';
import { paths } from '../../../app/paths';
import { AuthenticationService } from '../../../app/service/authentication-service';
import PaymentService from '../../../app/service/payments-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Payments Service', () => {
  let authenticationService: Partial<AuthenticationService>;
  let updateAppealService: Partial<UpdateAppealService>;
  let paymentService: PaymentService;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let createCardPaymentStub: sinon.SinonStub;
  let securityHeadersStub: sinon.SinonStub;
  let submitStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  const createCardPaymentResponse = { reference: 'thePaymentReference', _links: { next_url: { href: 'http://govPaymentPayment' } } };
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    securityHeadersStub = sandbox.stub().resolves();
    submitStub = sandbox.stub().resolves({ paymentReference: 'thePaymentReference' });
    authenticationService = {
      getSecurityHeaders: securityHeadersStub
    };
    updateAppealService = {
      submitEventRefactored: submitStub
    };
    paymentService = new PaymentService(authenticationService as AuthenticationService, updateAppealService as UpdateAppealService);
    createCardPaymentStub = sandbox.stub(paymentsApi, 'createCardPayment').resolves(createCardPaymentResponse);
    req = {
      app: {
        locals: {
          logger
        }
      } as any,
      idam: {
        userDetails: {
          uid: 'theUID'
        }
      },
      cookies: {
        '__auth-token': 'atoken'
      },
      session: {
        appeal: {
          ccdCaseId: 'aCcdCaseId',
          application: {
            contactDetails: {},
            personalDetails: {}
          }
        }
      }
    } as Partial<Request>;
    redirectStub = sandbox.stub();
    res = {
      redirect: redirectStub
    } as Partial<Response>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should createCardPayment', async() => {
    const result = await paymentService.createCardPayment(req as Request, 'theFee');

    expect(securityHeadersStub.called).to.equal(true);
    expect(createCardPaymentStub.called).to.equal(true);
    expect(submitStub.called).to.equal(true);
    expect(result).to.deep.equal(createCardPaymentResponse);
    expect(req.session.appeal.paymentReference).to.deep.equal('thePaymentReference');
  });

  it('should get payment details', async () => {
    sandbox.stub(paymentsApi, 'paymentDetails').resolves({});
    const details = await paymentService.getPaymentDetails(req as Request, 'thePaymentRef');

    expect(securityHeadersStub.called).to.equal(true);
    expect(details).to.deep.equal({});
  });

  describe('initiatePayment', () => {
    it('should initiate a payment if not payment reference is present', async () => {
      const spy = sandbox.spy(paymentService, 'createCardPayment');
      await paymentService.initiatePayment(req as Request, res as Response, 'aFee');

      expect(spy.called).to.equal(true);
      expect(redirectStub.calledWith('http://govPaymentPayment')).to.equal(true);
    });

    it('should initiate a payment if payment reference is present and status is Success initiatePayment', async () => {
      req.session.appeal.paymentReference = 'aRef';
      req.session.appeal.application.refundConfirmationApplied = false;
      sandbox.stub(paymentsApi, 'paymentDetails').resolves(JSON.stringify({ status: 'Success' }));
      await paymentService.initiatePayment(req as Request, res as Response, 'aFee');

      expect(redirectStub.calledWith(paths.common.finishPayment)).to.equal(true);
    });

    it('should initiate a payment if payment reference is present and status is Initiated initiatePayment', async () => {
      const spy = sandbox.spy(paymentService, 'createCardPayment');
      req.session.appeal.paymentReference = 'aRef';
      sandbox.stub(paymentsApi, 'paymentDetails').resolves(JSON.stringify({ status: 'Initiated' }));
      await paymentService.initiatePayment(req as Request, res as Response, 'aFee');

      expect(spy.called).to.equal(true);
      expect(redirectStub.calledWith('http://govPaymentPayment')).to.equal(true);
    });
  });
});
