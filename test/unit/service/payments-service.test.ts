import { Request, Response } from 'express';
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
  let paymentDetailsStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  const createCardPaymentResponse = { reference: 'thePaymentReference', _links: { next_url: { href: 'http://govPaymentPayment' } } };
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    authenticationService = {
      getSecurityHeaders: sandbox.stub().resolves()
    };
    updateAppealService = {
      submitEventRefactored: sandbox.stub().resolves({ paymentReference: 'thePaymentReference' })
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
          ccdCaseId: 'aCcdCaseId'
        }
      }
    } as Partial<Request>;
    res = {
      redirect: sandbox.spy()
    } as Partial<Response>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should createCardPayment', async() => {
    const result = await paymentService.createCardPayment(req as Request, 'theFee');

    expect(authenticationService.getSecurityHeaders).to.have.been.called;
    expect(createCardPaymentStub).to.have.been.called;
    expect(updateAppealService.submitEventRefactored).to.have.been.called;
    expect(result).to.be.eql(createCardPaymentResponse);
    expect(req.session.appeal.paymentReference).to.be.eql('thePaymentReference');
  });

  it('should get payment details', async () => {
    paymentDetailsStub = sandbox.stub(paymentsApi, 'paymentDetails').resolves({});
    const details = await paymentService.getPaymentDetails(req as Request, 'thePaymentRef');

    expect(authenticationService.getSecurityHeaders).to.have.been.called;
    expect(details).to.be.eql({});
  });

  describe('initiatePayment', () => {
    it('should initiate a payment if not payment reference is present', async () => {
      const spy = sandbox.spy(paymentService, 'createCardPayment');
      await paymentService.initiatePayment(req as Request, res as Response, 'aFee');

      expect(spy).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith('http://govPaymentPayment');
    });

    it('should initiate a payment if payment reference is present and status is Success initiatePayment', async () => {
      req.session.appeal.paymentReference = 'aRef';
      paymentDetailsStub = sandbox.stub(paymentsApi, 'paymentDetails').resolves(JSON.stringify({ status: 'Success' }));
      await paymentService.initiatePayment(req as Request, res as Response, 'aFee');

      expect(res.redirect).to.have.been.calledWith(paths.common.finishPayment);
    });

    it('should initiate a payment if payment reference is present and status is Initiated initiatePayment', async () => {
      const spy = sandbox.spy(paymentService, 'createCardPayment');
      req.session.appeal.paymentReference = 'aRef';
      paymentDetailsStub = sandbox.stub(paymentsApi, 'paymentDetails').resolves(JSON.stringify({ status: 'Initiated' }));
      await paymentService.initiatePayment(req as Request, res as Response, 'aFee');

      expect(spy).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith('http://govPaymentPayment');
    });
  });
});
