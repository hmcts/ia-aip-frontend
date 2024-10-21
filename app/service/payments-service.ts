import { Request, Response } from 'express';
import * as paymentApi from '../api/payments-api';
import { Events } from '../data/events';
import { paths } from '../paths';
import { getUrl } from '../utils/url-utils';
import { AuthenticationService, SecurityHeaders } from './authentication-service';
import UpdateAppealService from './update-appeal-service';

export default class PaymentService {
  private authenticationService: AuthenticationService;
  private updateAppealService: UpdateAppealService;

  constructor(authenticationService: AuthenticationService, updateAppealService: UpdateAppealService) {
    this.authenticationService = authenticationService;
    this.updateAppealService = updateAppealService;
  }

  // TODO: use the actual fee to initiate the payment
  async createCardPayment(req: Request, fee) {
    const securityHeaders: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);
    const body = {
      amount: fee.calculated_amount,
      case_reference: req.session.appeal.appealReferenceNumber,
      ccd_case_number: req.session.appeal.ccdCaseId,
      channel: 'online',
      currency: 'GBP',
      description: 'Appealing an immigration or asylum decision',
      service: 'IAC',
      case_type: 'Asylum',
      fees: [ fee ]
    };
    req.app.locals.logger.trace(`Creating Card Payment with fee ${JSON.stringify(fee)} for ccd id ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Payments Service');
    const event = req.session.appeal.appealStatus === 'appealStarted' ? Events.EDIT_APPEAL : Events.PAYMENT_APPEAL;
    const results = await paymentApi.createCardPayment(securityHeaders, body, getUrl(req.protocol, req.hostname, paths.common.finishPayment));
    const appeal: Appeal = {
      ...req.session.appeal,
      paymentReference: results.reference
    };
    const appealUpdated: Appeal = await this.updateAppealService.submitEventRefactored(event, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], true);
    req.session.appeal = {
      ...req.session.appeal,
      ...appealUpdated
    };
    return results;
  }

  async getPaymentDetails(req: Request, paymentReference) {
    const securityHeaders: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);
    const paymentDetails = await paymentApi.paymentDetails(securityHeaders, paymentReference);
    return paymentDetails;
  }

  async initiatePayment(req: Request, res: Response, fee: any) {
    const { paymentReference } = req.session.appeal || null;
    if (paymentReference) {
      const paymentDetails = JSON.parse(await this.getPaymentDetails(req, req.session.appeal.paymentReference));
      if (paymentDetails.status === 'Initiated') {
        req.app.locals.logger.trace(`Payment already initiated, cancel payment should go here`, 'Payments Service');
      } else if (paymentDetails.status === 'Success') {
        return res.redirect(paths.common.finishPayment);
      }
    }
    const response = await this.createCardPayment(req, fee);
    return res.redirect(response._links.next_url.href);
  }
}
