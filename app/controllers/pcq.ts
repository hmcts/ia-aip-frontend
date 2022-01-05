import config from 'config';
import { Response } from 'express';
import rp from 'request-promise';
import { v4 as uuid } from 'uuid';
import { createToken } from '../createToken';
import Logger, { getLogLabel } from '../utils/logger';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

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

async function checkPcqHealth(): Promise<boolean> {
  const uri = `${config.get('pcq.url')}${config.get('pcq.health')}`;
  try {
    let healthResponse = await rp.get({ uri, json: true });
    if (healthResponse.status && healthResponse.status === 'UP') {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  } catch (error) {
    logger.trace('Cannot reach ' + uri, 'PCQ');
    return Promise.resolve(false);
  }
}

function invokePcq(res: Response, appeal: Appeal) {
  const pcqId = uuid.v4();
  const params: PcqParams = {
    serviceId: 'IAC',
    actor: 'APPELLANT',
    ccdCaseId: appeal.ccdCaseId,
    pcqId: pcqId,
    partyId: 'anonymous',
    returnUrl: `${config.get('pcq.returnUrl')}`,
    language: 'en'
  };
  params.token = createToken(params);

  const qs = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&');

  res.redirect(`${config.get('pcq.url')}${config.get('pcq.path')}?${qs}`);

  logger.trace('PCQ is INVOKED', 'PCQ');
}

export {
  checkPcqHealth,
  invokePcq
};
