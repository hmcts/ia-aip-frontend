import config from 'config';
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
    const serviceRequestReference = req.session.appeal.serviceRequestReference;
    const ccdCaseId = req.session.appeal.ccdCaseId;
    const appealReferenceNumber = req.session.appeal.appealReferenceNumber;
    const returnUrl = getUrl(req.protocol, req.hostname, paths.common.finishPayment);
    const paymentsApiUrl: string = config.get('payments.apiUrl');
    const iaPaymentsApiUrl: string = config.get('iaPayments.apiUrl');
    const paymentEndpoint = `${paymentsApiUrl}/service-request/${serviceRequestReference}/card-payments`;
    const serviceCallbackUrl = `${iaPaymentsApiUrl}/service-request-update`;

    const body = {
      amount: fee.calculated_amount,
      case_reference: appealReferenceNumber,
      ccd_case_number: ccdCaseId,
      channel: 'online',
      currency: 'GBP',
      description: 'Appealing an immigration or asylum decision',
      service: 'IAC',
      case_type: 'Asylum',
      fees: [ fee ]
    };

    req.app.locals.logger.trace(`Creating Card Payment for ccd id: ${ccdCaseId}`, 'Payments Service');
    req.app.locals.logger.trace(`Payment endpoint: ${paymentEndpoint}`, 'Payments Service');
    req.app.locals.logger.trace(`Return URL: ${returnUrl}`, 'Payments Service');
    req.app.locals.logger.trace(`Service callback URL: ${serviceCallbackUrl}`, 'Payments Service');
    req.app.locals.logger.trace(`Service request reference: ${serviceRequestReference}`, 'Payments Service');
    req.app.locals.logger.trace(`Appeal reference number: ${appealReferenceNumber}`, 'Payments Service');
    req.app.locals.logger.trace(`Fee details: ${JSON.stringify(fee)}`, 'Payments Service');
    req.app.locals.logger.trace(`Request body: ${JSON.stringify(body)}`, 'Payments Service');

    const event = req.session.appeal.appealStatus === 'appealStarted' ? Events.EDIT_APPEAL : Events.PAYMENT_APPEAL;
    req.app.locals.logger.trace(`Appeal status: ${req.session.appeal.appealStatus}, using event: ${event.id}`, 'Payments Service');

    const results = await paymentApi.createCardPayment(securityHeaders, body, returnUrl, serviceRequestReference);

    req.app.locals.logger.trace(`Payment API response - reference: ${results.reference}`, 'Payments Service');
    req.app.locals.logger.trace(`Payment API response - next URL: ${results._links?.next_url?.href}`, 'Payments Service');

    const appeal: Appeal = {
      ...req.session.appeal,
      paymentReference: results.reference
    };
    const appealUpdated: Appeal = await this.updateAppealService.submitEventRefactored(event, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], true);

    req.app.locals.logger.trace(`Appeal updated with payment reference: ${appealUpdated.paymentReference}`, 'Payments Service');

    req.session.refreshCasesList = true;
    req.session.appeal = {
      ...req.session.appeal,
      ...appealUpdated
    };
    return results;
  }

  async getPaymentDetails(req: Request, paymentReference) {
    req.app.locals.logger.trace(`Getting payment details for paymentReference: ${paymentReference}`, 'Payments Service');
    const securityHeaders: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);
    const paymentDetails = await paymentApi.paymentDetails(securityHeaders, paymentReference);
    req.app.locals.logger.trace(`Payment details response: ${paymentDetails}`, 'Payments Service');
    return paymentDetails;
  }

  async initiatePayment(req: Request, res: Response, fee: any) {
    req.app.locals.logger.trace(`Initiating payment for ccd id: ${req.session.appeal?.ccdCaseId}`, 'Payments Service');
    const { paymentReference } = req.session.appeal || null;
    if (paymentReference) {
      req.app.locals.logger.trace(`Existing payment reference found: ${paymentReference}`, 'Payments Service');
      const paymentDetails = JSON.parse(await this.getPaymentDetails(req, req.session.appeal.paymentReference));
      req.app.locals.logger.trace(`Existing payment status: ${paymentDetails.status}`, 'Payments Service');
      if (paymentDetails.status === 'Initiated') {
        req.app.locals.logger.trace('Payment already initiated, cancel payment should go here', 'Payments Service');
      } else if (!req.session.appeal.application.refundConfirmationApplied && paymentDetails.status === 'Success') {
        req.app.locals.logger.trace('Payment already successful, redirecting to finish payment', 'Payments Service');
        return res.redirect(paths.common.finishPayment);
      }
    } else {
      req.app.locals.logger.trace('No existing payment reference, creating new payment', 'Payments Service');
    }
    const response = await this.createCardPayment(req, fee);
    req.app.locals.logger.trace(`Redirecting to GOV.UK Pay: ${response._links.next_url.href}`, 'Payments Service');
    return res.redirect(response._links.next_url.href);
  }
}
