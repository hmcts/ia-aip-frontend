import { asBooleanValue } from '../../../app/utils/utils';

const rp = require('request-promise');
const config = require('config');

const s2sUrl = config.get('s2s.url');

const proxyUrl = config.get('proxy.host');
const proxyPort = config.get('proxy.port');
const s2sMicroserviceName = config.get('s2s.microserviceName');

const httpProxyEnabled = asBooleanValue(config.get('httpProxy'));
// tslint:disable:no-console
async function getS2sToken() {
  console.info('======================');
  console.info('Retrieving S2S Token');
  console.info('======================');
  let s2sTokenResponse = null;

  const s2sOptions = {
    uri: `${s2sUrl}/testing-support/lease`,
    json: true,
    body: {
      microservice: s2sMicroserviceName
    }
  };

  if (httpProxyEnabled) {
    const proxy = `http://${proxyUrl}:${proxyPort}`;
    const proxiedRequest = rp.defaults({ 'proxy': proxy });
    s2sTokenResponse = await proxiedRequest.post(s2sOptions);
  } else {
    s2sTokenResponse = await rp.post(s2sOptions);
  }

  return 'Bearer ' + s2sTokenResponse;
}

export {
  getS2sToken
};
