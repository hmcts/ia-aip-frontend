import { Request, Response } from 'express';
import * as paymentApi from '../api/payments-api';
import { Events } from '../data/events';
import { paths } from '../paths';
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
      amount: 215,
      case_reference: 'aCaseRef',
      ccd_case_number: req.session.appeal.ccdCaseId,
      channel: 'online',
      currency: 'GBP',
      description: 'a test card payment',
      service: 'CMC',
      site_id: 'AA101',
      fees: [
        {
          calculated_amount: 215,
          code: 'FEE0123',
          version: '1'
        }
      ]
    };
    const results = await paymentApi.createCardPayment(securityHeaders, body, '');
    const appeal: Appeal = {
      ...req.session.appeal,
      paymentReference: results.reference
    };
    const appealUpdated: Appeal = await this.updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], true);
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
        // TODO: try to cancel initiated payment
      } else if (paymentDetails.status === 'Success') {
        return res.redirect(paths.common.finishPayment);
      }
    }
    const response = await this.createCardPayment(req, 'theFee');
    return res.redirect(response._links.next_url.href);
  }
}
