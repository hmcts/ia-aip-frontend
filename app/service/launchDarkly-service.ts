import { Request } from 'express';
import _ from 'lodash';
import { setupSecrets } from '../setupSecrets';
import Logger from '../utils/logger';
const logger: Logger = new Logger();
const launchDarklyLabel: string = 'LaunchDarkly service';
const LaunchDarkly = require('launchdarkly-node-server-sdk');
const config = setupSecrets();
const ldKey: string = config.get('launchDarkly.sdkKey');
const ldClient = LaunchDarkly.init(ldKey);

interface ILaunchDarklyService {
  getVariation: (req: Request, flag: string, defaultReturn: boolean) => {};
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

  async getVariation(req: Request, flag: string, defaultReturn: boolean) {
    const username = _.get(req, 'idam.userDetails.sub', 'user-is-not-logged-in');
    return ldClient.variation(flag, { key: username }, defaultReturn);
  }

  public static close() {
    logger.console('Closing LaunchDarkly client', launchDarklyLabel);
    ldClient.close();
  }
}
