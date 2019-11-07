import axios from 'axios';
import { isJWTExpired } from '../utils/jwt-utils';
import Logger, { getLogLabel } from '../utils/logger';

const config = require('config');
const otp = require('otp');
const s2sSecret = config.get('s2s.secret');
const s2sUrl = config.get('s2s.url');
const proxyHost = config.get('proxy.host');
const proxyPort = config.get('proxy.port');
const microServiceName = config.get('s2s.microserviceName');

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);
interface IS2SService {
  buildRequest: () => {};
  requestServiceToken: () => void;
  setServiceToken: (token: string) => void;
  getServiceToken: () => {};
}

export default class S2SService implements IS2SService {
  private static instance: S2SService;
  private initialization;
  private serviceToken: string;

  public static getInstance(): S2SService {
    if (!S2SService.instance) {
      S2SService.instance = new S2SService();
    }
    return S2SService.instance;
  }

  constructor() {
    this.initialization = this.init();
  }

  async init() {
    await this.requestServiceToken();
  }

  /**
   * Assembles a serviceAuthProvider request object to be used to query the service
   * also creates a one-time-password from the secret.
   */
  buildRequest() {

    const uri = `${s2sUrl}/lease`;
    const oneTimePassword = otp(s2sSecret).totp();

    return {
      uri: uri,
      body: {
        microservice: microServiceName,
        oneTimePassword: oneTimePassword
      }
    };
  }

  /**
   * Sends out a request to the serviceAuthProvider and request a new service token
   * to be passed as a header in any outgoing calls.
   * Note: This token is stored in memory and this token is only valid for 3 hours.
   */
  async requestServiceToken() {
    logger.trace('Attempting to request a S2S token', logLabel);
    const request = this.buildRequest();
    let proxyConfig;
    if (process.env.NODE_ENV === 'development' && !s2sUrl.startsWith('http://localhost')) {
      proxyConfig = { proxy: { host: proxyHost, port: proxyPort } };
    }
    let res;
    try {
      res = await axios.post(request.uri, request.body, proxyConfig);
    } catch (err) {
      logger.exception(err, logLabel);
    }
    if (res && res.data) {
      this.serviceToken = res.data;
      logger.trace('Received S2S token and stored token', logLabel);
    } else {
      logger.exception('Could not retrieve S2S token', logLabel);
    }
  }

  /**
   * Checks that the token hasn't yet expired and retrieves the token that was saved in memory.
   * If it has expired it refreshes the token and returns it.
   */
  async getServiceToken() {
    if (isJWTExpired(this.serviceToken)) {
      logger.trace('Token expired Attempting to acquire a new one.', logLabel);
      await this.requestServiceToken();
    }
    return `Bearer ${this.serviceToken}`;
  }

  setServiceToken(token: string) {
    this.serviceToken = token;
  }
}
