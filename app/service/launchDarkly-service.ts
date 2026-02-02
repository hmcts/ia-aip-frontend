import type { Request } from 'express-serve-static-core';
import _ from 'lodash';
import { setupSecrets } from '../setupSecrets';
import Logger from '../utils/logger';

const logger: Logger = new Logger();
const launchDarklyLabel: string = 'LaunchDarkly service';
const LaunchDarkly = require('@launchdarkly/node-server-sdk');
const config = setupSecrets();
const ldKey: string = config.get('launchDarkly.sdkKey');
const ldClient = LaunchDarkly.init(ldKey);

interface ILaunchDarklyService {
  getVariation: (req: Request<Params>, flag: string, defaultReturn: boolean) => {};
}

export default class LaunchDarklyService implements ILaunchDarklyService {
  private static instance: LaunchDarklyService;
  private initialization;

  public static getInstance(): LaunchDarklyService {
    if (!LaunchDarklyService.instance) {
      LaunchDarklyService.instance = new LaunchDarklyService();
    }
    return LaunchDarklyService.instance;
  }

  constructor() {
    this.initialization = this.init();
  }

  async init() {
    ldClient.on('ready', () => {
      logger.console("It's now safe to request feature flags", launchDarklyLabel);
      return ldClient;
    });
  }

  async getVariation(req: Request<Params>, flag: string, defaultReturn: boolean) {
    if (process.env.IS_FUNCTIONAL_TEST === 'true') {
      return this.getTestFlagValue(flag);
    }
    const username = _.get(req, 'idam.userDetails.sub', 'user-is-not-logged-in');
    return ldClient.variation(flag, {  kind: 'user', key: username }, defaultReturn);
  }

  public static close() {
    logger.console('Closing LaunchDarkly client', launchDarklyLabel);
    ldClient.close();
  }

  getTestFlagValue(flag: string) {
    switch (flag) {
      case 'online-card-payments-feature':
      case 'pcq-feature':
      case 'aip-hearing-requirements-feature':
      case 'aip-hearing-bundle-feature':
      case 'aip-ooc-feature':
      case 'aip-upload-addendum-evidence-feature':
      case 'aip-make-application-feature':
      case 'aip-ftpa-feature':
      case 'dlrm-fee-remission-feature-flag':
      case 'dlrm-setaside-feature-flag':
      case 'dlrm-refund-feature-flag':
      case 'dlrm-internal-feature-flag':
      case 'use-ccd-document-am':
        return true;
      default:
        return false;
    }
  }
}
