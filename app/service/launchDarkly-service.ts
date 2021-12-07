import { Request } from 'express';
import _ from 'lodash';
import { FEATURE_FLAGS } from '../data/constants';
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

  // tslint:disable:no-console
  async getVariation(req: Request, flag: string, defaultReturn: boolean) {
    let defaultValue = 'user-is-not-logged-in';
    const username = _.get(req, 'idam.userDetails.sub', defaultValue);
    let variation = ldClient.waitForInitialization().then(() => {
      return ldClient.variation(flag, { key: username }, defaultReturn);
    }).catch((err) => {
      console.log(err);
    });
    // let variation = ldClient.variation(flag, { key: username }, defaultReturn);
    console.log('flag::' , flag);
    console.log('username::' , username);
    variation.then(res => console.log('flag value:::', res));
    if (process.env.NODE_ENV !== 'production' && FEATURE_FLAGS.CARD_PAYMENTS === flag && username === defaultValue) {
      console.log(`Overriding the feature flag ${flag} for the environment ${process.env.NODE_ENV} to be true`);
      return true;
    }
    return variation;
  }

  public static close() {
    logger.console('Closing LaunchDarkly client', launchDarklyLabel);
    ldClient.close();
  }
}
