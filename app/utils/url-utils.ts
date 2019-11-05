import config from 'config';
import { Request } from 'express';

const appPort = config.get('node.port');

function getUrl(protocol: string, host: string, path: string): string {
  const portString = (host === 'localhost') ? ':' + appPort : '';
  return protocol + '://' + host + portString + path;
}

export function getIdamRedirectUrl(req: Request): string {
  return getUrl(req.protocol, req.hostname, '/redirectUrl');
}
