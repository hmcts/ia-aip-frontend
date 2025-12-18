import axios from 'axios';
import config from 'config';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import { createToken } from '../createToken';
import Logger from '../utils/logger';

const logger: Logger = new Logger();

interface PcqParams {
  serviceId: string;
  actor: string;
  ccdCaseId: string;
  pcqId: string;
  partyId: string;
  returnUrl: string;
  language: string;
  token?: string;
}

export default class PcqService {

  getPcqId() {
    return uuid();
  }

  async checkPcqHealth(): Promise<boolean> {
    const uri = `${config.get('pcq.url')}${config.get('pcq.health')}`;
    try {
      const response = await axios.get(uri);
      // tslint:disable:no-console
      console.log('PCQ Health Response:' + response);
      const healthResponse = response.data;
      console.log('PCQ Health Response Data:' + response.data);
      return healthResponse.status && healthResponse.status === 'UP';
    } catch (error) {
      logger.trace('Cannot reach ' + uri, 'PCQ');
      return false;
    }
  }

  invokePcq(res: Response, appeal: Appeal) {
    const params: PcqParams = {
      serviceId: 'IAC',
      actor: 'APPELLANT',
      ccdCaseId: appeal.ccdCaseId,
      pcqId: appeal.pcqId,
      partyId: 'anonymous',
      returnUrl: `${config.get('pcq.returnUrl')}`,
      language: 'en'
    };
    params.token = createToken(params);

    const qs = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');

    logger.trace(`Invoking PCQ for ccd id ${JSON.stringify(appeal.ccdCaseId)}`, 'PCQ');

    res.redirect(`${config.get('pcq.url')}${config.get('pcq.path')}?${qs}`);
  }
}
