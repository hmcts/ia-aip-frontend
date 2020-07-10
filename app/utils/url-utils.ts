import config from 'config';
import { Request, Response } from 'express';
import * as _ from 'lodash';
import { idamConfig } from '../config/idam-config';
import { paths } from '../paths';

const appPort = config.get('node.port');

export function getUrl(protocol: string, host: string, path: string): string {
  const portString = (host === 'localhost') ? ':' + appPort : '';
  return protocol + '://' + host + portString + path;
}

export function getIdamRedirectUrl(req: Request): string {
  return getUrl('https', req.hostname, '/redirectUrl');
}

export function getIdamLoginUrl(req: Request) {
  if (req.query['register']) {
    return idamConfig.idamRegistrationUrl;
  }
  return idamConfig.idamUserLoginUrl;
}

/**
 * Helps to workout where to redirect the user if it is an edit also resets the isEdit flag each time.
 * @param req the request
 * @param res the response
 * @param redirectUrl the page to be redirected if action is not an edit
 */
export function getConditionalRedirectUrl(req: Request, res: Response, redirectUrl: string) {

  if (_.get(req.session, 'appeal.application.isEdit', false)
    && req.session.appeal.application.isEdit === true) {
    req.session.appeal.application.isEdit = false;
    return res.redirect(paths.appealStarted.checkAndSend);
  }
  if (_.get(req.session, 'appeal.reasonsForAppeal.isEdit', false)
    && req.session.appeal.reasonsForAppeal.isEdit === true) {
    req.session.appeal.reasonsForAppeal.isEdit = false;
    return res.redirect(paths.awaitingReasonsForAppeal.checkAndSend);
  }
  if (_.get(req.session, 'appeal.cmaRequirements.isEdit', false)
    && req.session.appeal.cmaRequirements.isEdit === true) {
    req.session.appeal.cmaRequirements.isEdit = false;
    return res.redirect(paths.awaitingCmaRequirements.checkAndSend);
  }
  return res.redirect(redirectUrl);
}
